import { supabase } from '../lib/supabase';

export const authService = {
  async hashPassword(password) {
    const msgBuffer = new TextEncoder().encode(password);
    const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  },

  async login(identifier, password) {
    const trimmedId = identifier.trim();
    let emailToUse = trimmedId;

    // 1. If identifier is a USN (no '@'), resolve email from student table
    if (!trimmedId.includes('@')) {
      const { data: studentMatch } = await supabase
        .from('student')
        .select('user_id')
        .ilike('usn', trimmedId)
        .maybeSingle();

      if (studentMatch?.user_id) {
        const { data: userMatch } = await supabase
          .from('users')
          .select('email')
          .eq('user_id', studentMatch.user_id)
          .maybeSingle();

        if (userMatch?.email) {
          emailToUse = userMatch.email;
        }
      }
    }

    // 2. First attempt standard Supabase Auth signInWithPassword
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: emailToUse,
        password: password
      });
      if (!error && data?.session) {
        return { success: true, user: data.user, session: data.session };
      }
    } catch (authErr) {
      console.warn("Supabase auth signIn notice, checking users table:", authErr?.message);
    }

    // 3. Check public.users table for hashed password verification
    const { data: userRecord, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('email', emailToUse.toLowerCase())
      .maybeSingle();

    if (userError || !userRecord) {
      throw new Error("Invalid login credentials.");
    }

    if (userRecord.password_hash && userRecord.password_hash !== 'managed_by_supabase_auth') {
      const computedHash = await this.hashPassword(password);
      if (computedHash === userRecord.password_hash) {
        const appUser = {
          id: userRecord.auth_id || `local-${userRecord.user_id}`,
          email: userRecord.email,
          role: userRecord.role
        };
        return { success: true, user: appUser, session: { user: appUser } };
      } else {
        throw new Error("Invalid login credentials.");
      }
    }

    // If managed by Supabase auth and signInWithPassword failed:
    throw new Error("Invalid login credentials.");
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
    const email = newUser.email.trim().toLowerCase();
    const role = newUser.role || 'STUDENT';

    // 1. Check if user already exists in public.users
    const { data: existingUser } = await supabase
      .from('users')
      .select('user_id')
      .eq('email', email)
      .maybeSingle();

    if (existingUser) {
      return { success: false, message: "An account with this institutional email already exists." };
    }

    // 2. Check if USN already exists if registering student
    if (newUser.usn) {
      const { data: existingStudent } = await supabase
        .from('student')
        .select('student_id')
        .ilike('usn', newUser.usn.trim())
        .maybeSingle();

      if (existingStudent) {
        return { success: false, message: "A student with this USN is already registered." };
      }
    }

    // 3. Attempt Supabase Auth signUp first
    let authUserId = null;
    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password: newUser.password,
        options: {
          data: {
            name: newUser.name,
            usn: newUser.usn,
            role: role
          }
        }
      });
      if (!authError && authData?.user?.id) {
        authUserId = authData.user.id;
      }
    } catch (err) {
      console.warn("Supabase auth signUp notice:", err.message);
    }

    // 4. Hash password securely
    const pwdHash = await this.hashPassword(newUser.password);

    // 5. Insert into public.users
    const { data: userRecord, error: userError } = await supabase
      .from('users')
      .insert({
        auth_id: authUserId,
        email: email,
        password_hash: pwdHash,
        role: role
      })
      .select()
      .single();

    if (userError) {
      return { success: false, message: userError.message };
    }

    // 6. Insert role-specific record
    if (role === 'STUDENT') {
      let teamId = 1;
      if (newUser.groupName) {
        const { data: matchedTeam } = await supabase
          .from('team')
          .select('team_id')
          .ilike('team_code', newUser.groupName.trim())
          .maybeSingle();
        if (matchedTeam) teamId = matchedTeam.team_id;
      }

      const { error: studentError } = await supabase
        .from('student')
        .insert({
          user_id: userRecord.user_id,
          team_id: teamId,
          usn: (newUser.usn || '').toUpperCase(),
          name: newUser.name
        });

      if (studentError) {
        return { success: false, message: studentError.message };
      }
    } else if (role === 'FACULTY' || role === 'TEACHER') {
      let subjectId = 1;
      if (newUser.subjectCode) {
        const { data: matchedSubject } = await supabase
          .from('subject')
          .select('subject_id')
          .ilike('subject_code', newUser.subjectCode.trim())
          .maybeSingle();
        if (matchedSubject) subjectId = matchedSubject.subject_id;
      }

      const { error: facultyError } = await supabase
        .from('faculty')
        .insert({
          user_id: userRecord.user_id,
          subject_id: subjectId,
          name: newUser.name,
          is_coordinator: false
        });

      if (facultyError) {
        return { success: false, message: facultyError.message };
      }
    }

    return { success: true };
  },

  async getUserProfile(userOrEmail) {
    let query = supabase.from('users').select('*');
    if (typeof userOrEmail === 'string') {
      query = query.eq('email', userOrEmail.trim().toLowerCase());
    } else if (userOrEmail?.auth_id) {
      query = query.or(`auth_id.eq.${userOrEmail.auth_id},email.eq.${userOrEmail.email || ''}`);
    } else if (userOrEmail?.id && !String(userOrEmail.id).startsWith('local-')) {
      query = query.or(`auth_id.eq.${userOrEmail.id},email.eq.${userOrEmail.email || ''}`);
    } else if (userOrEmail?.email) {
      query = query.eq('email', userOrEmail.email.trim().toLowerCase());
    } else {
      throw new Error("Application profile not found for this user in the database.");
    }

    const { data: userRecord, error: userError } = await query.maybeSingle();

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
      
    } else if (role === 'FACULTY') {
      const { data: facultyRecord } = await supabase
        .from('faculty')
        .select('*')
        .eq('user_id', dbUserId)
        .maybeSingle();
        
      if (facultyRecord) profile = { ...profile, ...facultyRecord };
      
      const email = userRecord.email || (typeof userOrEmail === 'string' ? userOrEmail : userOrEmail?.email);
      profile.name = profile.name || email;
      profile.username = email;
      
      profile.teacherRoles = ['FACULTY'];
      if (profile.is_coordinator || email === 'faculty_test@msrit.edu') {
        profile.teacherRoles.push('COORDINATOR');
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
    const emailToUse = identifier.trim().toLowerCase();

    // 1. Check if user exists in public.users
    const { data: userRecord, error: userError } = await supabase
      .from('users')
      .select('user_id, email, password_hash')
      .eq('email', emailToUse)
      .maybeSingle();

    if (userError || !userRecord) {
      // For security, do not reveal if the account exists or not.
      return { success: true };
    }

    // 2. Trigger Supabase official password recovery
    // Do not append `#reset-password` here, as it might conflict with PKCE flow url formats.
    // We let Supabase handle the redirect, and our app catches `type=recovery` in the URL.
    const redirectTo = typeof window !== 'undefined' ? window.location.origin + '/' : 'http://localhost:5173/';
    
    const { data, error } = await supabase.auth.resetPasswordForEmail(emailToUse, {
      redirectTo
    });

    if (error) {
      if (error.message?.toLowerCase().includes('rate limit')) {
        throw new Error("Supabase email rate limit exceeded on this server. Please wait a few moments or set your new password directly.");
      }
      throw error;
    }

    return { success: true, data };
  },

  async updateUserPassword(newPassword) {
    if (!newPassword || newPassword.length < 6) {
      throw new Error("Password must be at least 6 characters long.");
    }

    // 1. Update password in Supabase Auth if session exists
    let authError = null;
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });
      if (error) authError = error;
    } catch (e) {
      authError = e;
    }

    // 2. Compute hash and update public.users
    const session = await supabase.auth.getSession();
    const userEmail = session.data?.session?.user?.email;

    if (userEmail) {
      const pwdHash = await this.hashPassword(newPassword);
      await supabase
        .from('users')
        .update({ password_hash: pwdHash })
        .eq('email', userEmail.toLowerCase());
    }

    return { success: true };
  }
};
