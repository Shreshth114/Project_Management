import { supabase } from '../lib/supabase';

export const academicService = {
  
  // --- SUBJECTS ---
  
  async getSubjects() {
    const { data, error } = await supabase
      .from('subject')
      .select('*')
      .order('subject_code');
      
    if (error) throw error;
    return data;
  },
  
  async createSubject(code, name) {
    const { data, error } = await supabase
      .from('subject')
      .insert({
        subject_code: code,
        subject_name: name
      })
      .select()
      .single();
      
    if (error) throw error;
    return data;
  },

  async getFaculty() {
    const { data, error } = await supabase
      .from('faculty')
      .select('faculty_id, name, is_coordinator, subject_id, user_id');
    if (error) throw error;
    return data;
  },
  
  // --- TEAMS ---
  
  async getTeams(filters = {}) {
    let query = supabase
      .from('team')
      .select(`
        team_id,
        team_code,
        subject_id,
        subject:subject(subject_code, subject_name),
        guide:faculty(name, user_id),
        members:student(student_id, usn, name, user_id)
      `)
      .order('team_code');
      
    if (filters.subject_id) {
      query = query.eq('subject_id', filters.subject_id);
    }
    if (filters.guide_id) {
      query = query.eq('guide_id', filters.guide_id);
    }
    // Note: To filter by a student inside the team, we'd need a more complex join or post-filter.
    
    const { data, error } = await query;
    if (error) throw error;
    return data;
  },

  async getTeamByStudent(studentId) {
    // 1. Get the student's team_id
    const { data: studentData, error: studentError } = await supabase
      .from('student')
      .select('team_id')
      .eq('student_id', studentId)
      .single();
      
    if (studentError) throw studentError;
    if (!studentData?.team_id) return null;
    
    // 2. Fetch the full team using the shared method
    const { data, error } = await supabase
      .from('team')
      .select(`
        team_id,
        team_code,
        subject_id,
        subject:subject(subject_code, subject_name),
        guide:faculty(name, user_id),
        members:student(student_id, usn, name, user_id)
      `)
      .eq('team_id', studentData.team_id)
      .single();
      
    if (error) throw error;
    return data;
  },
  
  async updateTeamGuide(teamId, newGuideId) {
    const { data, error } = await supabase
      .from('team')
      .update({ guide_id: newGuideId })
      .eq('team_id', teamId)
      .select()
      .single();
      
    if (error) throw error;
    return data;
  },
  
  // --- FACULTY/DASHBOARD STATS ---
  async getAdminStats() {
    const [{ count: subjectsCount }, { count: teamsCount }, { count: usersCount }] = await Promise.all([
      supabase.from('subject').select('*', { count: 'exact', head: true }),
      supabase.from('team').select('*', { count: 'exact', head: true }),
      supabase.from('users').select('*', { count: 'exact', head: true })
    ]);
    
    return {
      subjectsCount: subjectsCount || 0,
      teamsCount: teamsCount || 0,
      usersCount: usersCount || 0
    };
  }
};
