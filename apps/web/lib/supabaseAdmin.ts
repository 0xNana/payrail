import { createClient } from "@supabase/supabase-js";
import type { Database } from "./schema";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Keep module import-safe during build. Route handlers will still fail at request
// time if real Supabase credentials are not configured in the environment.
export const supabaseAdmin = createClient<Database>(
  url ?? "https://placeholder.supabase.invalid",
  serviceKey ?? "placeholder-service-role-key",
  {
  auth: { persistSession: false },
  }
);
