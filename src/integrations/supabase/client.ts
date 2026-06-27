import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL ?? "https://qufangvcqagtdxacarnt.supabase.co";
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY ?? "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF1ZmFuZ3ZjcWFndGR4YWNhcm50Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI1NzA4MzgsImV4cCI6MjA5ODE0NjgzOH0.COVKa-kUuyO0yeOpC1VWBFtf3YRTKLYOOEEWRiW9Z0M";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: typeof window !== 'undefined' ? localStorage : undefined,
    persistSession: true,
    autoRefreshToken: true,
  }
});

