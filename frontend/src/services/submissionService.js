import { supabase } from '../lib/supabase';

export const submissionService = {
  async getSubmissionsByTeam(teamId) {
    const { data, error } = await supabase
      .from('submission')
      .select(`*, student(*)`)
      .eq('team_id', teamId);
    if (error) throw error;
    return data;
  },

  async getAllSubmissionsForFaculty(facultyId) {
    const { data, error } = await supabase
      .from('submission')
      .select(`
        *, 
        student(*),
        team!inner(*)
      `)
      .eq('team.guide_id', facultyId);
      
    if (error) throw error;
    return data;
  },

  async submitTask(payload) {
    // Prevent duplicate submissions for the same milestone task by the team
    const { data: existing } = await supabase
      .from('submission')
      .select('submission_id')
      .eq('task_id', payload.task_id)
      .eq('team_id', payload.team_id)
      .maybeSingle();

    if (existing) {
      throw new Error('This milestone deliverable has already been submitted and cannot be resubmitted.');
    }

    const { data, error } = await supabase
      .from('submission')
      .insert({
        task_id: payload.task_id,
        submitted_by_student_id: payload.student_id,
        team_id: payload.team_id,
        file_name: payload.file_name,
        file_type: payload.file_type || 'link',
        file_url: payload.file_url || ''
      })
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async uploadFile(file, studentId, taskId) {
    const fileExt = (file.name.split('.').pop() || 'dat').toLowerCase();
    const fileName = `${studentId}-${taskId}-${Date.now()}.${fileExt}`;
    
    // 1. Attempt upload to Supabase Storage bucket
    try {
      const { data, error } = await supabase.storage
        .from('submissions')
        .upload(fileName, file, { upsert: true });
        
      if (!error && data) {
        const { data: publicUrlData } = supabase.storage
          .from('submissions')
          .getPublicUrl(fileName);
          
        if (publicUrlData?.publicUrl) {
          return {
            file_name: file.name,
            file_url: publicUrlData.publicUrl,
            file_type: fileExt.toUpperCase()
          };
        }
      }
    } catch (storageErr) {
      console.warn("Supabase storage upload notice, using embedded deliverable fallback:", storageErr);
    }

    // 2. Reliable Fallback: Embed file directly as Base64 Data URL so content is never lost or corrupted into '#'
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        resolve({
          file_name: file.name,
          file_url: reader.result,
          file_type: fileExt.toUpperCase()
        });
      };
      reader.onerror = (err) => reject(new Error('Failed to read file: ' + (err?.message || 'Unknown error')));
      reader.readAsDataURL(file);
    });
  },

  openSubmissionFile(fileUrl, fileName = 'submission_document') {
    if (!fileUrl || fileUrl === '#' || fileUrl.trim() === '') {
      alert('No active deliverable document attached to this submission record.');
      return;
    }

    // Standard web URL (e.g. Supabase storage or GitHub repo)
    if (fileUrl.startsWith('http://') || fileUrl.startsWith('https://')) {
      window.open(fileUrl, '_blank', 'noopener,noreferrer');
      return;
    }

    // Base64 Data URL (e.g. data:application/pdf;base64,...)
    if (fileUrl.startsWith('data:')) {
      try {
        const parts = fileUrl.split(',');
        const mimeMatch = parts[0].match(/:(.*?);/);
        const mime = mimeMatch ? mimeMatch[1] : 'application/pdf';
        const byteCharacters = atob(parts[1]);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        const blob = new Blob([byteArray], { type: mime });
        const blobUrl = URL.createObjectURL(blob);
        
        const newTab = window.open(blobUrl, '_blank');
        if (!newTab) {
          // If popup blocker intervened, trigger direct download
          const link = document.createElement('a');
          link.href = blobUrl;
          link.download = fileName || 'deliverable';
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        }
        return;
      } catch (err) {
        console.error('Error opening base64 deliverable:', err);
        alert('Could not render document: ' + err.message);
        return;
      }
    }

    window.open(fileUrl, '_blank', 'noopener,noreferrer');
  }
};
