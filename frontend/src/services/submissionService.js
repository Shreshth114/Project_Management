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
    const fileExt = file.name.split('.').pop();
    const fileName = `\${studentId}-\${taskId}-\${Date.now()}.\${fileExt}`;
    
    const { data, error } = await supabase.storage
      .from('submissions')
      .upload(fileName, file);
      
    if (error) throw error;
    
    const { data: publicUrlData } = supabase.storage
      .from('submissions')
      .getPublicUrl(fileName);
      
    return {
      file_name: file.name,
      file_url: publicUrlData.publicUrl,
      file_type: fileExt.toUpperCase()
    };
  }
};
