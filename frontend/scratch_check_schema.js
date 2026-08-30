import { createClient } from '@supabase/supabase-js';

const VITE_SUPABASE_URL = 'https://wknameikfdkgobqmswrl.supabase.co';
const VITE_SUPABASE_ANON_KEY = 'sb_publishable_X6tmBSZqkV-Qhth6nwOZWg_LiTva1p4';
const supabase = createClient(VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY);

async function checkSchema() {
  const { data, error } = await supabase.from('users').select('*').limit(1);
  console.log("Users Error:", error);
  console.log("Users Data:", data);
  
  // also check other tables just in case they are completely empty
  const { data: d2 } = await supabase.from('student').select('*').limit(1);
  console.log("Student Data:", d2);
}
checkSchema();
