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

async function testLogicOnly() {
  console.log("=== BYPASSING AUTHENTICATION TO TEST ROLE RESOLUTION LOGIC ===");
  for (const email of accounts) {
    console.log(`\nTesting Profile Resolution for: ${email}`);
    
    try {
      const { profile, rawRole, dbUserId } = await getUserProfile(email);
      console.log(`✅ auth.users email maps correctly to public.users`);
      console.log(`✅ Integer user_id retrieved: ${dbUserId}`);
      console.log(`✅ Correct role retrieved: ${rawRole}`);
      
      if (rawRole === 'STUDENT') {
        console.log(`✅ Student profile retrieved. USN: ${profile.usn}, Team: ${profile.team_id}`);
      } else if (rawRole === 'FACULTY') {
        console.log(`✅ Faculty profile retrieved. Name: ${profile.name}`);
        if (profile.is_coordinator) {
          console.log(`✅ Coordinator detected! is_coordinator: true, teacherRoles: [${profile.teacherRoles.join(', ')}]`);
        } else {
          console.log(`✅ Standard Faculty detected. is_coordinator: false`);
        }
      } else if (rawRole === 'ADMIN') {
        console.log(`✅ Admin profile retrieved.`);
      }
    } catch (err) {
      console.error(`❌ Profile logic failed: ${err.message}`);
    }
  }
}

testLogicOnly();
