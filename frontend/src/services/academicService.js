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
  },

  async getAdminAuditLogs(limit = 5) {
    const { data, error } = await supabase
      .from('audit_log')
      .select('log_id, action, details, timestamp, user_id')
      .order('timestamp', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data || [];
  },

  async getAdminUserDirectory() {
    const [
      { data: usersData, error: usersError },
      { data: studentData, error: studentError },
      { data: facultyData, error: facultyError },
      { data: adminData, error: adminError },
      { data: teamData, error: teamError },
      { data: subjectData, error: subjectError }
    ] = await Promise.all([
      supabase.from('users').select('*').order('user_id'),
      supabase.from('student').select('*').order('student_id'),
      supabase.from('faculty').select('*').order('faculty_id'),
      supabase.from('admin').select('*').order('admin_id'),
      supabase.from('team').select('*').order('team_id'),
      supabase.from('subject').select('*').order('subject_id')
    ]);

    if (usersError) throw usersError;
    if (studentError) throw studentError;
    if (facultyError) throw facultyError;
    if (adminError) throw adminError;
    if (teamError) throw teamError;
    if (subjectError) throw subjectError;

    const subjectById = new Map((subjectData || []).map(subject => [subject.subject_id, subject]));
    const facultyById = new Map((facultyData || []).map(faculty => [faculty.faculty_id, faculty]));
    const facultyByUserId = new Map((facultyData || []).map(faculty => [faculty.user_id, faculty]));
    const studentByUserId = new Map((studentData || []).map(student => [student.user_id, student]));
    const adminByUserId = new Map((adminData || []).map(adminUser => [adminUser.user_id, adminUser]));

    const teams = (teamData || []).map(team => {
      const subject = subjectById.get(team.subject_id);
      const guide = facultyById.get(team.guide_id);
      const members = (studentData || []).filter(student => student.team_id === team.team_id);

      return {
        team_id: team.team_id,
        teamCode: team.team_code,
        subjectId: team.subject_id,
        subjectCode: subject?.subject_code || null,
        subjectName: subject?.subject_name || null,
        guideName: guide?.name || 'Not assigned',
        guideId: team.guide_id || null,
        studentCount: members.length,
        students: members.map(student => ({
          student_id: student.student_id,
          usn: student.usn,
          name: student.name,
          user_id: student.user_id,
          team_id: student.team_id
        }))
      };
    });

    const teamById = new Map(teams.map(team => [team.team_id, team]));

    const normalizedUsers = (usersData || []).map(user => {
      const studentRecord = studentByUserId.get(user.user_id);
      const facultyRecord = facultyByUserId.get(user.user_id);
      const adminRecord = adminByUserId.get(user.user_id);
      const teamRecord = studentRecord ? teamById.get(studentRecord.team_id) : null;

      const teamSubject = teamRecord
        ? {
            subjectCode: teamRecord.subjectCode || null,
            subjectName: teamRecord.subjectName || null
          }
        : null;

      const facultySubject = facultyRecord
        ? subjectById.get(facultyRecord.subject_id) || null
        : null;

      const subjectCode = teamSubject
        ? teamSubject.subjectCode
        : facultySubject
          ? facultySubject.subject_code
          : null;

      const subjectName = teamSubject
        ? teamSubject.subjectName
        : facultySubject
          ? facultySubject.subject_name
          : null;

      const normalizedUser = {
        id: user.user_id,
        user_id: user.user_id,
        email: user.email,
        role: user.role,
        username: studentRecord?.usn || user.email,
        name: studentRecord?.name || facultyRecord?.name || (adminRecord ? 'System Administrator' : user.email),
        usn: studentRecord?.usn || null,
        teamId: studentRecord?.team_id || null,
        teamCode: teamRecord?.teamCode || null,
        subjectCode,
        subjectName,
        guideName: teamRecord?.guideName || null,
        isCoordinator: Boolean(facultyRecord?.is_coordinator),
        teacherRoles: facultyRecord ? ['FACULTY', ...(facultyRecord.is_coordinator ? ['COORDINATOR'] : [])] : [],
      };

      return normalizedUser;
    });

    const students = normalizedUsers.filter(user => user.role === 'STUDENT');
    const faculty = normalizedUsers.filter(user => user.role === 'FACULTY');
    const admins = normalizedUsers.filter(user => user.role === 'ADMIN');

    return {
      users: normalizedUsers,
      students,
      faculty,
      admins,
      teams
    };
  }
};
