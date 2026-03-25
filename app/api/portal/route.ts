/**
 * POST /api/portal
 *
 * Creates a Stripe Billing Portal session so subscribers can manage
 * their payment method, view invoices, or cancel their subscription.
 *
 * Returns { url } — client redirects browser to that URL.
 * Stripe redirects back to /dashboard when the user is done.
 */

import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { createServerSupabaseClient } from '@/lib/supabase/server';

export async function POST(req: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('hotel_id, hotels(stripe_customer_id)')
      .eq('id', user.id)
      .single();

    const hotel = (profile?.hotels as unknown) as { stripe_customer_id: string | null } | null;

    if (!hotel?.stripe_customer_id) {
      return NextResponse.json({ error: 'No billing account found' }, { status: 404 });
    }

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://stayopshq.com';

    const portalSession = await stripe.billingPortal.sessions.create({
      customer: hotel.stripe_customer_id,
      return_url: `${baseUrl}/dashboard`,
    });

    return NextResponse.json({ url: portalSession.url });
  } catch (err) {
    console.error('[/api/portal]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
