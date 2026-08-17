import { createClient } from "@supabase/supabase-js";

const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL || "https://mfgywkdbollxzbbtpkig.supabase.co";
const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "sb_publishable_TZic-mhvAyh35i6PMWj1Ng_lbp8M2ma";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);