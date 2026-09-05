import { supabase } from '../lib/supabase';

export const evaluationService = {
  async getEvaluationsForTeamTask(teamId, taskId) {
    const { data, error } = await supabase
      .from('evaluation')
      .select(`
        *,
        submission!inner(task_id, team_id),
        evaluation_criteria(criteria_name, max_marks)
      `)
      .eq('submission.team_id', teamId)
      .eq('submission.task_id', taskId);
      
    if (error) throw error;
    return data;
  },
  
  async getEvaluationsForStudent(studentId) {
    const { data, error } = await supabase
      .from('evaluation')
      .select(`
        *,
        evaluation_criteria(criteria_name, max_marks)
      `)
      .eq('student_id', studentId);
      
    if (error) throw error;
    return data;
  },
  
  async saveEvaluations(payloadArray) {
    const { data, error } = await supabase
      .from('evaluation')
      .insert(payloadArray)
      .select();
    if (error) throw error;
    return data;
  },
  
  async getCriteriaForTask(taskId) {
    const { data, error } = await supabase
      .from('evaluation_criteria')
      .select('*')
      .eq('task_id', taskId);
    if (error) throw error;
    return data;
  },

  async getAllEvaluations() {
    const { data, error } = await supabase
      .from('evaluation')
      .select('*, submission!inner(team_id)');
      
    if (error) throw error;
    return data;
  }
};
