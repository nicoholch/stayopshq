/**
 * GET /auth/callback
 *
 * Supabase redirects here after a user confirms their email.
 * We exchange the one-time code for a session, then send them
 * to onboarding (first time) or the dashboard (returning user).
 */

import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const next = searchParams.get('next') ?? '/onboarding';

  if (code) {
    const supabase = await createServerSupabaseClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      // Check if this user has already completed onboarding
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from('profiles').select('hotel_id').eq('id', user.id).single();
        const destination = profile?.hotel_id ? '/dashboard' : '/onboarding';
        return NextResponse.redirect(`${origin}${destination}`);
      }
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  // Something went wrong — send to login with an error message
  return NextResponse.redirect(`${origin}/login?error=confirmation_failed`);
}
