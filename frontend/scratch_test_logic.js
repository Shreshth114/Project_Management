import { createClient } from '@supabase/supabase-js';

const VITE_SUPABASE_URL = 'https://wknameikfdkgobqmswrl.supabase.co';
const VITE_SUPABASE_ANON_KEY = 'sb_publishable_X6tmBSZqkV-Qhth6nwOZWg_LiTva1p4';
const supabase = createClient(VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY);

const accounts = [
  'admin_test@msrit.edu',
  'coord_test@msrit.edu',
  'faculty_test@msrit.edu',
  'student1@msrit.edu',
  'student2@msrit.edu'
];

async function getUserProfile(email) {
  const { data: userRecord, error: userError } = await supabase
    .from('users')
    .select('*')
    .eq('email', email)
    .single();

  if (userError || !userRecord) {
    throw new Error("Application profile not found for this email in the database.");
  }

  const role = userRecord.role;
  const dbUserId = userRecord.user_id;
  let profile = { ...userRecord };

  if (role === 'STUDENT') {
    const { data: studentRecord } = await supabase.from('student').select('*').eq('user_id', dbUserId).single();
    if (studentRecord) profile = { ...profile, ...studentRecord };
  } else if (role === 'FACULTY') {
    const { data: facultyRecord } = await supabase.from('faculty').select('*').eq('user_id', dbUserId).single();
    if (facultyRecord) profile = { ...profile, ...facultyRecord };
    profile.teacherRoles = ['FACULTY'];
    if (profile.is_coordinator) {
      profile.teacherRoles.push('COORDINATOR');
    }
  } else if (role === 'ADMIN') {
    const { data: adminRecord } = await supabase.from('admin').select('*').eq('user_id', dbUserId).single();
    if (adminRecord) profile = { ...profile, ...adminRecord };
  }
  return { profile, rawRole: role, dbUserId };
}

async function runTest() {
  for (const email of accounts) {
    console.log(`\n================================`);
    console.log(`Testing Account: ${email}`);
    
    // 1. Test Login
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password: 'Password123!'
    });
    
    if (error) {
      console.error(`❌ Login failed: ${error.message}`);
      continue;
    }
    
    console.log(`✅ Login Succeeded (Session active: ${!!data.session})`);
    
    // 2. Test Profile Resolution
    try {
      const { profile, rawRole, dbUserId } = await getUserProfile(email);
      console.log(`✅ auth.users mapped to public.users (user_id: ${dbUserId})`);
      console.log(`✅ Base Role retrieved: ${rawRole}`);
      
      if (rawRole === 'STUDENT') {
        console.log(`✅ Student Profile fetched. USN: ${profile.usn}, Team ID: ${profile.team_id}`);
      } else if (rawRole === 'FACULTY') {
        console.log(`✅ Faculty Profile fetched. Name: ${profile.name}`);
        if (profile.is_coordinator) {
          console.log(`✅ Coordinator detected! teacherRoles: ${profile.teacherRoles.join(', ')}`);
        } else {
          console.log(`✅ Standard Faculty detected. teacherRoles: ${profile.teacherRoles.join(', ')}`);
        }
      } else if (rawRole === 'ADMIN') {
        console.log(`✅ Admin Profile fetched. ID: ${profile.admin_id}`);
      }
      
    } catch (err) {
      console.error(`❌ Profile fetch failed: ${err.message}`);
    }
    
    // 3. Test Logout
    const { error: logoutError } = await supabase.auth.signOut();
    if (logoutError) {
      console.error(`❌ Logout failed: ${logoutError.message}`);
    } else {
      console.log(`✅ Logout succeeded`);
    }
  }
}

runTest();
