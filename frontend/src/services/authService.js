import { supabase } from '../lib/supabase';

export const authService = {
  async login(email, password) {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    return data;
  },

  async logout() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },

  async getUserProfile(user) {
    // 1. Fetch the user's role from public.users table mapped by auth_id
    const { data: userRecord, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('auth_id', user.id)
      .single();

    if (userError || !userRecord) {
      throw new Error("Application profile not found for this email in the database.");
    }

    const role = userRecord.role;
    const dbUserId = userRecord.user_id;

    let profile = { ...userRecord };

    // 2. Map public.users -> role specific tables
    if (role === 'STUDENT') {
      const { data: studentRecord } = await supabase
        .from('student')
        .select('*')
        .eq('user_id', dbUserId)
        .single();
        
      if (studentRecord) profile = { ...profile, ...studentRecord };
      
      // Transform keys to match existing UI mock expectations temporarily
      profile.name = profile.name || user.email;
      profile.username = profile.usn || user.email;
      
    } else if (role === 'FACULTY') {
      const { data: facultyRecord } = await supabase
        .from('faculty')
        .select('*')
        .eq('user_id', dbUserId)
        .single();
        
      if (facultyRecord) profile = { ...profile, ...facultyRecord };
      
      profile.name = profile.name || user.email;
      profile.username = user.email;
      
      // Determine if they are a coordinator
      profile.teacherRoles = ['FACULTY'];
      if (profile.is_coordinator) {
        profile.teacherRoles.push('COORDINATOR');
      }
      
      // Temporarily transform 'FACULTY' DB role to 'TEACHER' UI role so DashboardLayout logic works
      profile.role = 'TEACHER';
      
    } else if (role === 'ADMIN') {
      const { data: adminRecord } = await supabase
        .from('admin')
        .select('*')
        .eq('user_id', dbUserId)
        .single();
        
      if (adminRecord) profile = { ...profile, ...adminRecord };
      
      profile.name = "System Administrator";
      profile.username = user.email;
    }

    return profile;
  }
};
