/**
 * POST /api/webhook
 *
 * Stripe sends signed events here after payments.
 * We verify the signature (prevents spoofing), then update the database.
 *
 * Key events handled:
 *  - checkout.session.completed  → activate subscription
 *  - customer.subscription.updated → plan change / renewal
 *  - customer.subscription.deleted → downgrade to free
 *  - invoice.payment_failed        → notify user
 *
 * To test locally:
 *   stripe listen --forward-to localhost:3000/api/webhook
 */

import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { createAdminClient } from '@/lib/supabase/admin';
import type Stripe from 'stripe';

// Next.js must receive the raw body to verify Stripe's signature
export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  const body = await req.text();
  const signature = req.headers.get('stripe-signature');

  if (!signature) {
    return NextResponse.json({ error: 'Missing stripe-signature header' }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch (err) {
    console.error('[webhook] Signature verification failed:', err);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  const supabase = createAdminClient();   // bypasses RLS — safe here, server-only

  try {
    switch (event.type) {

      // ── Payment completed → activate plan ───────────────────────────
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        const hotelId = session.subscription_data?.metadata?.hotel_id
          ?? session.metadata?.hotel_id;
        const plan = session.subscription_data?.metadata?.plan ?? 'starter';

        if (hotelId) {
          await supabase.from('hotels').update({
            plan,
            stripe_subscription_id: session.subscription as string,
          }).eq('id', hotelId);
        }
        break;
      }

      // ── Subscription updated (upgrade / downgrade / renewal) ─────────
      case 'customer.subscription.updated': {
        const sub = event.data.object as Stripe.Subscription;
        const hotelId = sub.metadata?.hotel_id;
        const priceId = sub.items.data[0]?.price.id;

        if (hotelId && priceId) {
          const plan = priceId === process.env.STRIPE_PRICE_PRO ? 'pro' : 'starter';
          await supabase.from('hotels').update({ plan }).eq('id', hotelId);
        }
        break;
      }

      // ── Subscription cancelled → revert to free ──────────────────────
      case 'customer.subscription.deleted': {
        const sub = event.data.object as Stripe.Subscription;
        const hotelId = sub.metadata?.hotel_id;
        if (hotelId) {
          await supabase.from('hotels').update({
            plan: 'starter',
            stripe_subscription_id: null,
          }).eq('id', hotelId);
        }
        break;
      }

      // ── Payment failed → you could email the hotel manager here ──────
      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice;
        console.warn('[webhook] Payment failed for customer:', invoice.customer);
        // TODO: send email via Resend / SendGrid
        break;
      }
    }
  } catch (err) {
    console.error('[webhook] Handler error:', err);
    return NextResponse.json({ error: 'Handler failed' }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
