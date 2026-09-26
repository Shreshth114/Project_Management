import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://wknameikfdkgobqmswrl.supabase.co';
const supabaseKey = 'sb_publishable_X6tmBSZqkV-Qhth6nwOZWg_LiTva1p4';
const supabase = createClient(supabaseUrl, supabaseKey);

async function test() {
  console.log("Attempting upload to support-attachments...");
  const { data, error } = await supabase.storage.from('support-attachments').upload('test/test.txt', 'hello');
  if (error) {
    console.error("Upload Error:", error);
  } else {
    console.log("Upload Success:", data);
  }
}
test();
