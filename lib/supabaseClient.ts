import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// This uses the ANON key only — safe for the browser. RLS policies in
// supabase/schema.sql control exactly what this client can read/write.
export const supabase = createClient(supabaseUrl, supabaseAnonKey);
