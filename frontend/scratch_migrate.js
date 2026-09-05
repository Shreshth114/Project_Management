import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import fs from 'fs';

const envFile = fs.readFileSync('.env', 'utf-8');
const envUrl = envFile.match(/VITE_SUPABASE_URL=(.*)/)[1].trim().replace(/"/g, '');
const envKey = envFile.match(/VITE_SUPABASE_ANON_KEY=(.*)/)[1].trim().replace(/"/g, '');
// Note: We need service_role key to execute arbitrary SQL or update protected schema if we don't use the Supabase dashboard.
// But we might be able to use rpc or just standard queries.
