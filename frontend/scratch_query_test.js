import { createClient } from '@supabase/supabase-js';

const VITE_SUPABASE_URL = 'https://wknameikfdkgobqmswrl.supabase.co';
const VITE_SUPABASE_ANON_KEY = 'sb_publishable_X6tmBSZqkV-Qhth6nwOZWg_LiTva1p4';
const supabase = createClient(VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY);

async function testQuery() {
  // Test relational query for teams
  const { data, error } = await supabase
    .from('team')
    .select(`
      team_id,
      team_code,
      subject_id,
      faculty(name),
      student(student_id, usn, name)
    `);

  console.log("Teams Data:", JSON.stringify(data, null, 2));
  console.log("Error:", error);
}

testQuery();
