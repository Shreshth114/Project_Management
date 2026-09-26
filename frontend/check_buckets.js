import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://wknameikfdkgobqmswrl.supabase.co';
const supabaseKey = 'sb_publishable_X6tmBSZqkV-Qhth6nwOZWg_LiTva1p4';
const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
  const { data, error } = await supabase.storage.listBuckets();
  console.log("Buckets:", data);
  console.log("Error:", error);
}
check();
