import { createClient } from "@supabase/supabase-js";

const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  "https://rdvtoohclywlpbbnfbdd.supabase.co";
const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  "placeholder-key";eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJkdnRvb2hjbHl3bHBiYm5mYmRkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ3MzAzMTQsImV4cCI6MjA4MDMwNjMxNH0.kq-Or1qB_xjmSi8L8S1sysjRvJpprqRJ0jsoNm-xu88

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
