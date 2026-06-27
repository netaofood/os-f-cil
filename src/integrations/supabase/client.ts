import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

export const supabase = createClient<Database>(
  "https://qufangvcqagtdxacarnt.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF1ZmFuZ3ZjcWFndGR4YWNhcm50Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI1NzA4MzgsImV4cCI6MjA5ODE0NjgzOH0.COVKa-kUuyO0yeOpC1VWBFtf3YRTKLYOOEEWRiW9Z0M",
  {
    auth: {
      storage: typeof window !== 'undefined' ? localStorage : undefined,
      persistSession: true,
      autoRefreshToken: true,
    }
  }
);

