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
    price: 149,
    features: ['3 departments', 'Real-time capture', 'Basic dashboard', 'Weekly reports'],
  },
  pro: {
    name: 'Pro',
    priceId: process.env.STRIPE_PRICE_PRO!,
    price: 349,
    features: ['Unlimited departments', 'AI analysis', 'Instant alerts', 'Public sentiment page'],
  },
} as const;
