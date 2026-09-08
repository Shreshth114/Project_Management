import { supabase } from '../lib/supabase';

export const academicService = {
  
  // --- SUBJECTS ---
  
  async getSubjects() {
    // Fetch subjects and faculty coordinators in parallel
    const [{ data: subjects, error: subjectError }, { data: coordinators }] = await Promise.all([
      supabase.from('subject').select('*').order('subject_code'),
      supabase.from('faculty').select('faculty_id, name, subject_id, is_coordinator').eq('is_coordinator', true)
    ]);

    if (subjectError) throw subjectError;

    // Map each subject to its assigned coordinator name
    const coordBySubjectId = new Map((coordinators || []).map(f => [f.subject_id, f]));

    return (subjects || []).map(s => ({
      ...s,
      coordinator: coordBySubjectId.get(s.subject_id)?.name || null
    }));
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

  async assignCoordinator(facultyIdentifier, subjectCode) {
    try {
      if (!facultyIdentifier) return { success: false, reason: 'No faculty identifier provided' };

      // 1. Find faculty by ID or by name
      let facultyRecord = null;
      if (!isNaN(facultyIdentifier) && String(facultyIdentifier).trim() !== '') {
        const { data } = await supabase
          .from('faculty')
          .select('faculty_id, user_id, name, subject_id')
          .eq('faculty_id', Number(facultyIdentifier))
          .maybeSingle();
        facultyRecord = data;
      }

      if (!facultyRecord) {
        const trimmedName = String(facultyIdentifier).trim();
        const { data: matches } = await supabase
          .from('faculty')
          .select('faculty_id, user_id, name, subject_id')
          .ilike('name', `%${trimmedName}%`);
        if (matches && matches.length > 0) {
          facultyRecord = matches[0];
        }
      }

      if (!facultyRecord) {
        console.warn('[assignCoordinator] No faculty found with:', facultyIdentifier);
        return { success: false, reason: 'Faculty not found in DB' };
      }

      const facultyId = facultyRecord.faculty_id;
      const userId = facultyRecord.user_id;

      // 2. Set is_coordinator = true for this faculty
      await supabase
        .from('faculty')
        .update({ is_coordinator: true })
        .eq('faculty_id', facultyId);

      console.log('[assignCoordinator] Assigned coordinator for:', facultyRecord.name, 'facultyId:', facultyId);

      // 3. Link faculty to subject if subjectCode given
      if (subjectCode) {
        const { data: matchedSubject } = await supabase
          .from('subject')
          .select('subject_id')
          .ilike('subject_code', subjectCode.trim())
          .maybeSingle();

        if (matchedSubject?.subject_id) {
          await supabase
            .from('faculty')
            .update({ subject_id: matchedSubject.subject_id })
            .eq('faculty_id', facultyId);
          console.log('[assignCoordinator] Linked faculty to subject_id:', matchedSubject.subject_id);
        }
      }

      return { success: true, facultyId, userId, facultyName: facultyRecord.name };
    } catch (err) {
      console.warn('[assignCoordinator] Error:', err?.message || err);
      return { success: false, reason: err.message };
    }
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
        subject:subject(subject_id, subject_code, subject_name),
        guide:faculty(faculty_id, name, user_id),
        members:student(student_id, usn, name, user_id)
      `)
      .eq('team_id', studentData.team_id)
      .single();
      
    if (error) throw error;

    // 3. Fetch the coordinator assigned to this team's subject
    const subjectCode = data?.subject?.subject_code;
    let foundCoordinator = null;

    if (subjectCode) {
      // Find all coordinators with matching subject code
      const { data: facultyCoordinators } = await supabase
        .from('faculty')
        .select('name, is_coordinator, subject_id, subject:subject(subject_code)')
        .eq('is_coordinator', true);

      if (facultyCoordinators && facultyCoordinators.length > 0) {
        // Prioritize real coordinator matching subject code (excluding [TEST] if possible)
        const codeMatch = facultyCoordinators.find(f => 
          !f.name.includes('[TEST]') && 
          f.subject?.subject_code?.toLowerCase() === subjectCode.toLowerCase()
        ) || facultyCoordinators.find(f => 
          f.subject_id === data.subject_id && !f.name.includes('[TEST]')
        ) || facultyCoordinators.find(f => 
          !f.name.includes('[TEST]')
        );

        if (codeMatch) {
          foundCoordinator = codeMatch.name;
        }
      }
    }

    data.coordinator = foundCoordinator || 'Not Assigned';

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
