import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://eufxcilctdpitojlimvj.supabase.co";
// Service role key bypasses RLS for admin operations
const SUPABASE_SERVICE_ROLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV1ZnhjaWxjdGRwaXRvamxpbXZqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1Mjc5MTg3NywiZXhwIjoyMDY4MzY3ODc3fQ.UIID_F7ZrJ0nA2z9vGnL8OBrW77c5zUMjYB9A3UXs5I";

// Admin client with service role key that bypasses RLS
export const adminSupabase = createClient<Database>(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    storage: localStorage,
    persistSession: false,
    autoRefreshToken: false,
  }
});