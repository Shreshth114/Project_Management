import { supabase } from '../lib/supabase';

export const taskService = {
  
  async getTasks(filters = {}) {
    let query = supabase
      .from('task')
      .select(`
        *,
        faculty:faculty(name),
        evaluation_criteria(*)
      `)
      .order('created_at', { ascending: false });
      
    if (filters.faculty_id) {
      query = query.eq('faculty_id', filters.faculty_id);
    }
    
    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  },

  async updateTaskDeadline(taskId, newDeadline) {
    const { data, error } = await supabase
      .from('task')
      .update({ deadline: newDeadline })
      .eq('task_id', taskId)
      .select()
      .single();
      
    if (error) throw error;
    return data;
  },

  async createTaskWithCriteria(taskData, criteriaList) {
    // 1. Insert Task
    const { data: taskRecord, error: taskError } = await supabase
      .from('task')
      .insert({
        faculty_id: taskData.faculty_id,
        title: taskData.title,
        description: taskData.description || '',
        task_type: taskData.task_type || 'GROUP',
        deadline: taskData.deadline
      })
      .select()
      .single();
      
    if (taskError) throw taskError;
    
    const newTaskId = taskRecord.task_id;
    
    // 2. Insert Criteria (if any)
    let criteriaData = [];
    if (criteriaList && criteriaList.length > 0) {
      const criteriaInserts = criteriaList.map(c => ({
        task_id: newTaskId,
        criteria_name: c.criteria_name,
        max_marks: Number(c.max_marks)
      }));
      
      const { data: cData, error: cError } = await supabase
        .from('evaluation_criteria')
        .insert(criteriaInserts)
        .select();
        
      if (cError) {
        console.error("Task created, but criteria failed:", cError);
        throw cError;
      }
      criteriaData = cData;
    }
    
    return { ...taskRecord, evaluation_criteria: criteriaData };
  },
  
  // Dashboard specific stats
  async getCoordinatorStats(coordinatorId) {
    // Just count tasks for this coordinator
    const { count, error } = await supabase
      .from('task')
      .select('*', { count: 'exact', head: true })
      .eq('faculty_id', coordinatorId);
      
    if (error) throw error;
    return { totalTasks: count || 0 };
  }
};
