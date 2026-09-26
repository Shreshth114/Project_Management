import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://wknameikfdkgobqmswrl.supabase.co';
const supabaseKey = 'sb_publishable_X6tmBSZqkV-Qhth6nwOZWg_LiTva1p4';
const supabase = createClient(supabaseUrl, supabaseKey);

async function test() {
  console.log("Invoking edge function without required fields...");
  const { data, error } = await supabase.functions.invoke('support', {
    body: {}
  });
  console.log("Error:", error);
  console.log("Data:", data);
}
test();
