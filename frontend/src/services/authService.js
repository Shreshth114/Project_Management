import { supabase } from '../lib/supabase';

export const authService = {
  async login(identifier, password) {
    const trimmedId = identifier.trim();
    if (!trimmedId.includes('@')) {
      const { data, error } = await supabase.functions.invoke('public-auth', {
        body: { action: 'login-by-usn', usn: trimmedId, password }
      });

      if (error || !data?.session) {
        throw new Error('Invalid login credentials.');
      }

      const { data: sessionData, error: sessionError } = await supabase.auth.setSession(data.session);
      if (sessionError) throw sessionError;
      return { success: true, user: sessionData.session.user, session: sessionData.session };
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email: trimmedId.toLowerCase(),
      password
    });

    if (error) {
      if (error.message?.toLowerCase().includes('email not confirmed')) {
        throw new Error('Please check your inbox and confirm your email address before logging in.');
      }
      throw new Error(error.message || 'Invalid login credentials.');
    }
    if (!data?.session) throw new Error('Invalid login credentials.');

    return { success: true, user: data.user, session: data.session };
  },

  async logout() {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) console.warn("Supabase signOut error:", error.message);
    } catch (e) {
      console.warn("Logout error:", e);
    }
  },

  async registerUser(newUser) {
    const redirectTo = typeof window !== 'undefined'
      ? window.location.origin + (import.meta.env.BASE_URL || '/')
      : undefined;

    const { data, error } = await supabase.functions.invoke('register-user', {
      body: { ...newUser, redirectTo }
    });

    if (error) {
      let message = error.message || 'Registration failed.';
      if (error.context && typeof error.context.json === 'function') {
        try {
          const response = await error.context.json();
          message = response.message || response.error || message;
        } catch {
          // Keep the function client's safe fallback message.
        }
      }
      return { success: false, message };
    }

    return data || { success: false, message: 'Registration service returned no response.' };
  },

  async getUserProfile(userOrEmail) {
    const authId = userOrEmail?.id || userOrEmail?.auth_id;
    if (!authId || String(authId).startsWith('local-')) {
      throw new Error("Application profile not found for this user in the database.");
    }

    const { data: userRecord, error: userError } = await supabase
      .from('users')
      .select('user_id, auth_id, email, role, gender, phone, avatar_url')
      .eq('auth_id', authId)
      .maybeSingle();

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
        .maybeSingle();
        
      if (studentRecord) profile = { ...profile, ...studentRecord };
      
      const email = userRecord.email || (typeof userOrEmail === 'string' ? userOrEmail : userOrEmail?.email);
      profile.name = profile.name || email;
      profile.username = profile.usn || email;
      
    } else if (role === 'FACULTY' || role === 'TEACHER') {
      let { data: facultyRecord } = await supabase
        .from('faculty')
        .select('*')
        .eq('user_id', dbUserId)
        .maybeSingle();

      const email = userRecord.email || (typeof userOrEmail === 'string' ? userOrEmail : userOrEmail?.email);

      // Fallback: search by email prefix or name if user_id link is missing
      if (!facultyRecord && email) {
        const { data: byName } = await supabase
          .from('faculty')
          .select('*')
          .ilike('name', email.split('@')[0])
          .maybeSingle();
        if (byName) {
          facultyRecord = byName;
          // link user_id for future queries
          await supabase.from('faculty').update({ user_id: dbUserId }).eq('faculty_id', byName.faculty_id);
        }
      }
        
      if (facultyRecord) {
        profile = { ...profile, ...facultyRecord };

        // Fetch allocated subject code and name from subject table
        if (facultyRecord.subject_id) {
          const { data: subData } = await supabase
            .from('subject')
            .select('subject_code, subject_name')
            .eq('subject_id', facultyRecord.subject_id)
            .maybeSingle();
          if (subData) {
            profile.subjectCode = subData.subject_code;
            profile.subjectName = subData.subject_name;
          }
        }
      }
      
      profile.name = facultyRecord?.name || profile.name || email;
      profile.username = email;
      
      profile.teacherRoles = ['FACULTY'];
      if (profile.is_coordinator || facultyRecord?.is_coordinator || email === 'faculty_test@msrit.edu' || email === 'coord_test@msrit.edu') {
        profile.teacherRoles.push('COORDINATOR');
        profile.is_coordinator = true;
      }
      
      profile.role = 'TEACHER';
      
    } else if (role === 'ADMIN') {
      const { data: adminRecord } = await supabase
        .from('admin')
        .select('*')
        .eq('user_id', dbUserId)
        .maybeSingle();
        
      if (adminRecord) profile = { ...profile, ...adminRecord };
      
      const email = userRecord.email || (typeof userOrEmail === 'string' ? userOrEmail : userOrEmail?.email);
      profile.name = "System Administrator";
      profile.username = email;
    }

    return profile;
  },

  async resetPasswordForEmail(identifier) {
    const trimmedId = identifier.trim();
    const redirectTo = typeof window !== 'undefined'
      ? window.location.origin + (import.meta.env.BASE_URL || '/')
      : undefined;

    if (!trimmedId.includes('@')) {
      const { error } = await supabase.functions.invoke('public-auth', {
        body: { action: 'request-password-reset', identifier: trimmedId, redirectTo }
      });
      if (error) throw new Error('Could not process the password reset request. Please try again later.');
      return { success: true };
    }

    const { error } = await supabase.auth.resetPasswordForEmail(trimmedId.toLowerCase(), { redirectTo });

    if (error) {
      if (error.message?.toLowerCase().includes('rate limit')) {
        throw new Error("Supabase email rate limit exceeded on this server. Please wait a few moments or set your new password directly.");
      }
      throw error;
    }

    return { success: true };
  },

  async updateUserPassword(newPassword) {
    if (!newPassword || newPassword.length < 6) {
      throw new Error("Password must be at least 6 characters long.");
    }

    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) throw error;

    return { success: true };
  },

  async updateProfile(userId, updates) {
    const { error } = await supabase
      .from('users')
      .update({
        ...(updates.gender !== undefined && { gender: updates.gender }),
        ...(updates.phone !== undefined && { phone: updates.phone }),
        ...(updates.avatar_url !== undefined && { avatar_url: updates.avatar_url })
      })
      .eq('user_id', userId);

    if (error) throw new Error('Failed to update profile: ' + error.message);

    // Update name in respective table if requested
    if (updates.name) {
      const { data: user } = await supabase.from('users').select('role').eq('user_id', userId).single();
      if (user) {
        if (user.role === 'STUDENT') {
          await supabase.from('student').update({ name: updates.name }).eq('user_id', userId);
        } else if (user.role === 'TEACHER' || user.role === 'FACULTY') {
          await supabase.from('faculty').update({ name: updates.name }).eq('user_id', userId);
        }
      }
    }
    
    return { success: true };
  },

  async resendVerificationEmail(email) {
    // Generate the correct environment-aware redirect URL for the verification link
    const isVercel = import.meta.env.VITE_VERCEL === '1';
    const baseUrl = isVercel ? window.location.origin : `${window.location.origin}/pms`;
    const redirectTo = `${baseUrl}/#type=signup`;

    const { error } = await supabase.auth.resend({
      type: 'signup',
      email: email,
      options: {
        emailRedirectTo: redirectTo
      }
    });

    if (error) throw error;
    return { success: true };
  }
};
