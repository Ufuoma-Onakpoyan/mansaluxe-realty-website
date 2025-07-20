import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://eufxcilctdpitojlimvj.supabase.co";
// Use anon key since service role key is not available
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV1ZnhjaWxjdGRwaXRvamxpbXZqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI3OTE4NzcsImV4cCI6MjA2ODM2Nzg3N30._rawsW32arUMBh32SIZPgHpTDInFfw8fvHUGGQBueBE";

// Admin client for admin operations (using anon key for now)
export const adminSupabase = createClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: localStorage,
    persistSession: false,
    autoRefreshToken: false,
  }
});