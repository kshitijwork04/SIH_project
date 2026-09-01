import { createClient } from "@supabase/supabase-js";

// Supabase client (section 11.2). Credentials come from Vite env vars.
// The anon/publishable key is safe to ship client-side; access is controlled by
// RLS policies, not by hiding this key.
const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

export const supabase =
  url && anonKey ? createClient(url, anonKey) : null;

export function isSupabaseConfigured(): boolean {
  return supabase !== null;
}
