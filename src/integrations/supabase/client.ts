import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

export const supabase = createClient<Database>(
  "https://yzwqqljfbbfsalplhdmw.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl6d3FxbGpmYmJmc2FscGxoZG13Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODMwOTU1OTgsImV4cCI6MjA5ODY3MTU5OH0.rRa7hKec1pS41LhD3u2Ce3QuF2N9VHK2Fg0ZKOFPCS8",
  {
    auth: {
      storage: typeof window !== 'undefined' ? localStorage : undefined,
      persistSession: true,
      autoRefreshToken: true,
    }
  }
);

