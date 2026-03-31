/**
 * GET /auth/callback
 *
 * Supabase redirects here after a user confirms their email.
 * We exchange the one-time code for a session, then send them
 * to onboarding (first time) or the dashboard (returning user).
 */

import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const next = searchParams.get('next') ?? '/onboarding';

  if (code) {
    const supabase = await createServerSupabaseClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from('profiles').select('hotel_id').eq('id', user.id).single();

        if (profile?.hotel_id) {
          return NextResponse.redirect(`${origin}/dashboard`);
        }

        // Invited user: hotel_id is stored in user_metadata by /api/invite
        const hotelId = user.user_metadata?.hotel_id as string | undefined;
        const role    = (user.user_metadata?.role as string) ?? 'manager';

        if (hotelId) {
          const admin = createAdminClient();
          await admin.from('profiles').insert({
            id:        user.id,
            hotel_id:  hotelId,
            full_name: user.email?.split('@')[0] ?? 'Team Member',
            role,
          });
          return NextResponse.redirect(`${origin}/dashboard`);
        }

        return NextResponse.redirect(`${origin}/onboarding`);
      }
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  // Something went wrong — send to login with an error message
  return NextResponse.redirect(`${origin}/login?error=confirmation_failed`);
}
