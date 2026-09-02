import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || import.meta.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey =
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
  import.meta.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
  import.meta.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Missing Supabase environment variables. Please check your frontend/.env file.');
}

// Create a single supabase client for interacting with your database
export const supabase = createClient(supabaseUrl || '', supabaseAnonKey || '');

/**
 * A simple utility to verify the Supabase connection by fetching a single user.
 * This does not modify the database.
 */
export const verifySupabaseConnection = async () => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('user_id')
      .limit(1);
    
    if (error) {
      console.error('Supabase connection test failed:', error.message);
      return { success: false, error: error.message };
    }
    
    console.log('Supabase connection test succeeded!', data);
    return { success: true, data };
  } catch (err) {
    console.error('Supabase connection test encountered an exception:', err);
    return { success: false, error: err.message };
  }
};
