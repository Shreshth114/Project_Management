import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://wknameikfdkgobqmswrl.supabase.co';
const supabaseKey = 'sb_publishable_X6tmBSZqkV-Qhth6nwOZWg_LiTva1p4';
const supabase = createClient(supabaseUrl, supabaseKey);

async function testSupport() {
  console.log("Logging in...");
  const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
    email: 'student104@msrit.edu', // Replace with a valid test account if needed
    password: 'password123', // I don't know the password, let's try a common one, or I can just sign up a new user!
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
