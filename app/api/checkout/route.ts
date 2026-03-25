/**
 * POST /api/checkout
 *
 * Creates a Stripe Checkout Session and returns the redirect URL.
 * The client redirects the browser to Stripe's hosted payment page.
 *
 * On success → Stripe redirects to /dashboard?success=true
 * On cancel  → Stripe redirects to /#pricing
 *
 * After payment, Stripe fires a webhook to /api/webhook which
 * updates the hotel's plan in the database.
 */

import { NextRequest, NextResponse } from 'next/server';
import { stripe, PLANS } from '@/lib/stripe';
import { createServerSupabaseClient } from '@/lib/supabase/server';

export async function POST(req: NextRequest) {
  try {
    const { plan } = await req.json() as { plan: 'starter' | 'pro' };

    if (!PLANS[plan]) {
      return NextResponse.json({ error: 'Invalid plan' }, { status: 400 });
    }

    // Get the authenticated user
    const supabase = await createServerSupabaseClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    // Get the hotel linked to this user
    const { data: profile } = await supabase
      .from('profiles')
      .select('hotel_id, hotels(stripe_customer_id, name)')
      .eq('id', user.id)
      .single();

    if (!profile?.hotel_id) {
      return NextResponse.json({ error: 'No hotel found for this account' }, { status: 404 });
    }

    const hotel = (profile.hotels as unknown) as { stripe_customer_id: string | null; name: string } | null;
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://stayopshq.com';

    // Create or reuse Stripe customer
    let customerId = hotel?.stripe_customer_id;
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        name: hotel?.name,
        metadata: { hotel_id: profile.hotel_id },
      });
      customerId = customer.id;

      // Save the Stripe customer ID
      await supabase
        .from('hotels')
        .update({ stripe_customer_id: customerId })
        .eq('id', profile.hotel_id);
    }

    // Create the checkout session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price: PLANS[plan].priceId,
          quantity: 1,
        },
      ],
      // 14-day free trial
      subscription_data: {
        trial_period_days: 14,
        metadata: { hotel_id: profile.hotel_id, plan },
      },
      // Where to go after payment
      success_url: `${baseUrl}/dashboard?success=true&plan=${plan}`,
      cancel_url: `${baseUrl}/#pricing`,
      // Pre-fill their email
      customer_email: customerId ? undefined : user.email,
      // Allow promo codes
      allow_promotion_codes: true,
    });

    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error('[/api/checkout]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
