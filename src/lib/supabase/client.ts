import { createClient } from "@supabase/supabase-js";

import { hasSupabaseEnv, publicEnv } from "@/lib/env";

export const supabase = hasSupabaseEnv
  ? createClient(publicEnv.supabaseUrl, publicEnv.supabasePublishableKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    })
  : null;

export const isSupabaseConfigured = hasSupabaseEnv;
