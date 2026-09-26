import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://wknameikfdkgobqmswrl.supabase.co';
const supabaseKey = 'sb_publishable_X6tmBSZqkV-Qhth6nwOZWg_LiTva1p4';
const supabase = createClient(supabaseUrl, supabaseKey);

async function test() {
  const largeString = 'a'.repeat(4 * 1024 * 1024);
  console.log("Invoking with 4MB payload...");
  const { data, error } = await supabase.functions.invoke('support', {
    body: {
      issueType: 'Bug',
      subject: 'Test Payload',
      description: 'Testing if Edge Function allows 4MB payload.',
      role: 'STUDENT',
      attachments: [{ name: "test.png", content: largeString }]
    }
  });
  console.log("Error:", error);
  console.log("Data:", data);
}
test();
