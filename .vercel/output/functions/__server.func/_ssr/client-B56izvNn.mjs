import { c as createClient } from "../_libs/supabase__supabase-js.mjs";
const SUPABASE_URL = "https://rwruutmbjirfturritdg.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF1ZmFuZ3ZjcWFndGR4YWNhcm50Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI1NzA4MzgsImV4cCI6MjA5ODE0NjgzOH0.COVKa-kUuyO0yeOpC1VWBFtf3YRTKLYOOEEWRiW9Z0M";
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: typeof window !== "undefined" ? localStorage : void 0,
    persistSession: true,
    autoRefreshToken: true
  }
});
export {
  supabase as s
};
