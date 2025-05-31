import { createClient } from '@supabase/supabase-js';
import type { Database } from '../types/supabase';

const supabaseUrl = 'https://xyjecnvjulqcethppykf.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh5amVjbnZqdWxxY2V0aHBweWtmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc4MzU3NzUsImV4cCI6MjA2MzQxMTc3NX0.6hxJ36pbJqzF4poQskefsIQjV9tspsvA3Tquh7cBiJc';

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase URL or Anonymous Key');
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true
  }
});