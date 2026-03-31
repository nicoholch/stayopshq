import Stripe from 'stripe';

// Server-side Stripe instance — never import this in Client Components
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-06-20',
  typescript: true,
});

export const PLANS = {
  starter: {
    name: 'Starter',
    priceId: process.env.STRIPE_PRICE_STARTER!,
    price: 49,
    features: ['Unlimited issue logging', 'Up to 3 managers', 'Full analytics & KPIs', 'Continuous improvement tracking', 'Guest follow-up emails'],
  },
  pro: {
    name: 'Pro',
    priceId: process.env.STRIPE_PRICE_PRO!,
    price: 149,
    features: ['Everything in Starter', 'AI pattern detection', 'Unlimited managers', 'Priority support'],
  },
} as const;
