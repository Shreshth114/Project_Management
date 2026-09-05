import { createClient } from '@supabase/supabase-js';

const VITE_SUPABASE_URL = 'https://wknameikfdkgobqmswrl.supabase.co';
const VITE_SUPABASE_ANON_KEY = 'sb_publishable_X6tmBSZqkV-Qhth6nwOZWg_LiTva1p4';
const supabase = createClient(VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY);

async function dumpSchema() {
  const tables = ['subject', 'team', 'task', 'evaluation_criteria', 'faculty'];
  for (const table of tables) {
    console.log(`\n--- TABLE: ${table} ---`);
    // fetch 1 row to see keys, or use Postgres RPC if available, but for now just select 1 row
    const { data, error } = await supabase.from(table).select('*').limit(1);
    if (error) {
      console.log("Error:", error.message);
    } else {
      if (data && data.length > 0) {
        console.log("Columns:", Object.keys(data[0]));
      } else {
        // if empty, we can insert a dummy and rollback? No rollback in REST API.
        console.log("Table is empty, cannot infer columns from data.");
      }
    }
  }
}
dumpSchema();
