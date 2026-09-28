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

  async getAllSubmissions() {
    const { data, error } = await supabase
      .from('submission')
      .select(`
        *, 
        student(*),
        team(*)
      `)
      .order('submitted_at', { ascending: false });
      
    if (error) throw error;
    return data || [];
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

  isDeliverable(sub) {
    if (!sub) return false;
    if (!sub.file_url || sub.file_url === '#' || String(sub.file_url).trim() === '') return false;
    const fileType = String(sub.file_type || '').toUpperCase();
    if (fileType === 'SYSTEM' || fileType === 'FACULTY_EVAL') return false;
    const fileName = String(sub.file_name || '').toLowerCase();
    if (fileName.includes('pending student deliverable') || fileName.includes('evaluation record') || fileName.includes('evaluation entry')) {
      return false;
    }
    return true;
  },

  async submitTask(payload, isIndividual = false) {
    // Prevent duplicate submissions:
    // For individual tasks: prevent duplicate for this student
    // For group tasks: prevent duplicate for this team
    let query = supabase
      .from('submission')
      .select('submission_id, file_url, file_type, file_name')
      .eq('task_id', payload.task_id);

    if (isIndividual) {
      query = query.eq('submitted_by_student_id', payload.student_id);
    } else {
      query = query.eq('team_id', payload.team_id);
    }

    const { data: existing } = await query.maybeSingle();

    if (existing) {
      if (this.isDeliverable(existing)) {
        throw new Error(isIndividual
          ? 'You have already submitted this individual deliverable and cannot resubmit.'
          : 'This milestone deliverable has already been submitted and cannot be resubmitted.');
      } else {
        // Upgrade placeholder to actual student submission deliverable
        const { data, error } = await supabase
          .from('submission')
          .update({
            submitted_by_student_id: payload.student_id,
            file_name: payload.file_name,
            file_type: payload.file_type || 'link',
            file_url: payload.file_url || '',
            submitted_at: new Date().toISOString()
          })
          .eq('submission_id', existing.submission_id)
          .select()
          .single();
        if (error) throw error;
        return data;
      }
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

  async createPlaceholderSubmission(payload) {
    // Check if a submission already exists for this team and task
    const { data: existing } = await supabase
      .from('submission')
      .select('*')
      .eq('team_id', payload.team_id)
      .eq('task_id', payload.task_id)
      .limit(1)
      .maybeSingle();

    if (existing) {
      return existing;
    }

    const { data, error } = await supabase
      .from('submission')
      .insert({
        task_id: payload.task_id,
        team_id: payload.team_id,
        submitted_by_student_id: payload.submitted_by_student_id,
        file_name: payload.file_name || 'Evaluation Record (Pending Student Deliverable)',
        file_type: payload.file_type || 'SYSTEM',
        file_url: payload.file_url || ''
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async uploadFile(file, taskId) {
    const fileExt = (file.name.split('.').pop() || 'dat').toLowerCase();
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) throw new Error('Sign in before uploading a submission.');
    const filePath = `${user.id}/${taskId}/${crypto.randomUUID()}.${fileExt}`;
    
    // 1. Attempt upload to Supabase Storage bucket
    try {
      const { data, error } = await supabase.storage
        .from('submissions')
        .upload(filePath, file, { upsert: false });
        
      if (!error && data) {
        return {
          file_name: file.name,
          file_url: data.path,
          file_type: fileExt.toUpperCase()
        };
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

  async openSubmissionFile(fileUrl, fileName = 'submission_document') {
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

    const { data, error } = await supabase.storage
      .from('submissions')
      .createSignedUrl(fileUrl, 120, { download: fileName });

    if (error || !data?.signedUrl) {
      alert('Could not create a temporary link for this submission.');
      return;
    }

    window.open(data.signedUrl, '_blank', 'noopener,noreferrer');
  }
};
