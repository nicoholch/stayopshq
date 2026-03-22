import { createClient } from '@supabase/supabase-js';

// Admin client — bypasses Row Level Security. Server-only, never import in client components.
// Get SUPABASE_SERVICE_ROLE_KEY from: Supabase Dashboard → Project Settings → API → service_role
export function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}
