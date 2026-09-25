import { supabase } from '../lib/supabase';

export const evaluationService = {
  async getEvaluationsForTeamTask(teamId, taskId) {
    if (!teamId || !taskId) return [];

    try {
      const { data, error } = await supabase
        .from('evaluation')
        .select('*, submission!inner(task_id, team_id), evaluation_criteria(criteria_name, max_marks)')
        .eq('submission.team_id', Number(teamId))
        .eq('submission.task_id', Number(taskId));
        
      if (!error && data) {
        return data;
      }
    } catch (joinErr) {
      console.warn("Direct inner join query notice:", joinErr);
    }

    // Fallback: fetch all evaluations and filter client-side if join syntax has issues
    try {
      const { data: allEvals, error: allErr } = await supabase
        .from('evaluation')
        .select('*, submission(task_id, team_id), evaluation_criteria(criteria_name, max_marks)');
        
      if (allErr) throw allErr;
      return (allEvals || []).filter(e => 
        e.submission && 
        Number(e.submission.team_id) === Number(teamId) && 
        Number(e.submission.task_id) === Number(taskId)
      );
    } catch (err) {
      console.error("Failed to load evaluations for team and task:", err);
      return [];
    }
  },
  
  async getEvaluationsForStudent(studentId) {
    if (!studentId) return [];

    const { data, error } = await supabase
      .from('evaluation')
      .select(`
        *,
        submission(task_id, team_id),
        evaluation_criteria(criteria_name, max_marks)
      `)
      .eq('student_id', Number(studentId));
      
    if (error) throw error;
    return data || [];
  },
  
  async saveEvaluations(payloadArray) {
    if (!payloadArray || payloadArray.length === 0) return [];

    const studentId = Number(payloadArray[0].student_id);
    const criteriaIds = payloadArray.map(p => Number(p.criteria_id)).filter(Boolean);
    
    // Delete existing evaluations for this student for these specific criteria to prevent duplicates
    if (criteriaIds.length > 0) {
      const { error: delError } = await supabase
        .from('evaluation')
        .delete()
        .eq('student_id', studentId)
        .in('criteria_id', criteriaIds);
      if (delError) {
        console.warn("Notice: could not clear prior evaluations:", delError.message);
      }
    }

    // Clean payload to ONLY include valid PostgreSQL columns on 'evaluation' table
    const cleanPayload = payloadArray.map(item => ({
      submission_id: Number(item.submission_id),
      student_id: Number(item.student_id),
      criteria_id: Number(item.criteria_id),
      evaluator_id: Number(item.evaluator_id),
      awarded_marks: Number(item.awarded_marks) || 0,
      feedback: item.feedback || ''
    }));

    const { data, error } = await supabase
      .from('evaluation')
      .insert(cleanPayload)
      .select();
      
    if (error) throw error;
    return data;
  },
  
  async getCriteriaForTask(taskId) {
    if (!taskId) return [];

    const { data, error } = await supabase
      .from('evaluation_criteria')
      .select('*')
      .eq('task_id', Number(taskId));
      
    if (error) throw error;
    return data || [];
  },

  async getAllEvaluations() {
    const { data, error } = await supabase
      .from('evaluation')
      .select('*, submission(team_id, task_id), evaluation_criteria(criteria_name, max_marks)');
      
    if (error) throw error;
    return data || [];
  }
};
