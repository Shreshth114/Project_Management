import { createClient } from '@supabase/supabase-js';

// Credentials must be set in your local .env / .env.local file.
// Never hard-code keys here — this file is tracked by Git.
const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey =
  process.env.VITE_SUPABASE_ANON_KEY ||
  process.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error(
    'Missing Supabase env vars. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in frontend/.env'
  );
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testSupport() {
  console.log("Logging in...");
  const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
    email: 'student104@msrit.edu',
    password: process.env.TEST_USER_PASSWORD || '', // Set TEST_USER_PASSWORD in your local .env
  });

  if (authError) {
    console.log("Login failed, trying to sign up...");
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email: 'testsupportagent@msrit.edu',
      password: 'test1234Secure!',
    });
    if (signUpError) {
      console.error("Signup failed:", signUpError);
      return;
    }
    console.log("Signed up successfully.", signUpData.user?.id);
  } else {
    console.log("Logged in successfully.", authData.user?.id);
  }

  console.log("Invoking edge function...");
  const { data, error } = await supabase.functions.invoke('support', {
    body: {
      issueType: 'Test',
      subject: 'Test Subject',
      description: 'This is a test description.',
      role: 'STUDENT'
    }
  });

  console.log("Response Data:", data);
  console.log("Response Error:", error);
}

testSupport();
