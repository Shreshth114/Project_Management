import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

// Try to parse .env file manually since dotenv might not be installed in the root
let envStr;
try {
  envStr = fs.readFileSync('.env', 'utf8');
} catch (e) {
  console.log("No .env found, skipping");
}

let VITE_SUPABASE_URL = '';
let VITE_SUPABASE_ANON_KEY = '';

if (envStr) {
  envStr.split('\n').forEach(line => {
    const parts = line.split('=');
    if (parts.length >= 2) {
      if (parts[0].trim() === 'VITE_SUPABASE_URL') VITE_SUPABASE_URL = parts.slice(1).join('=').trim();
      if (parts[0].trim() === 'VITE_SUPABASE_ANON_KEY') VITE_SUPABASE_ANON_KEY = parts.slice(1).join('=').trim();
    }
  });
}

const supabase = createClient(VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY);

async function testSignup() {
  const email = `test_${Date.now()}@test.com`;
  const { data, error } = await supabase.auth.signUp({
    email,
    password: 'Password123!',
  });
  
  if (error) {
    console.error("SignUp Error:", error);
  } else {
    console.log("SignUp Success!");
    console.log("User ID:", data.user?.id);
    console.log("Session:", !!data.session);
    console.log("Identities:", data.user?.identities?.length);
  }
}
testSignup();
