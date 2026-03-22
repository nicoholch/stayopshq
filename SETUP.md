# PulseStay — Next.js Setup Guide

## Prerequisites
- Node.js 18+
- A [Supabase](https://supabase.com) account (free)
- A [Stripe](https://stripe.com) account (free to create)
- A [Vercel](https://vercel.com) account (free)

---

## 1. Install dependencies

```bash
cd nextjs-app
npm install
```

---

## 2. Set up Supabase

1. Create a new project at supabase.com
2. Go to **SQL Editor → New Query**, paste the contents of `supabase-schema.sql`, and run it
3. Go to **Project Settings → API** and copy:
   - Project URL
   - `anon` public key
   - `service_role` secret key (keep this private)
4. Go to **Authentication → Settings** and set your Site URL to `http://localhost:3000`

---

## 3. Set up Stripe

1. Create a Stripe account at stripe.com
2. In **Products**, create two products:
   - **PulseStay Starter** — $149/month recurring → copy the Price ID
   - **PulseStay Pro** — $349/month recurring → copy the Price ID
3. Go to **Developers → API Keys** and copy your secret and publishable keys

---

## 4. Configure environment variables

```bash
cp .env.example .env.local
```

Fill in all values in `.env.local` (never commit this file).

---

## 5. Run locally

```bash
npm run dev
```

Open http://localhost:3000

### Test Stripe webhooks locally

```bash
# Install Stripe CLI: https://stripe.com/docs/stripe-cli
stripe login
stripe listen --forward-to localhost:3000/api/webhook
```

The CLI will print a webhook signing secret — paste it into `STRIPE_WEBHOOK_SECRET` in `.env.local`.

Use Stripe test card: `4242 4242 4242 4242` / any future date / any CVC.

---

## 6. Deploy to Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

Or connect your GitHub repo to Vercel at vercel.com for automatic deploys on every push.

**Add environment variables in Vercel:**
- Go to your project → Settings → Environment Variables
- Add all variables from `.env.local` (use production Stripe keys, not test keys)

**Register your Stripe webhook for production:**
- Stripe Dashboard → Developers → Webhooks → Add endpoint
- URL: `https://yourdomain.com/api/webhook`
- Events to listen for:
  - `checkout.session.completed`
  - `customer.subscription.updated`
  - `customer.subscription.deleted`
  - `invoice.payment_failed`

---

## 7. Connect your domain

1. Buy a domain (Cloudflare Registrar: ~$9/yr, or Namecheap)
2. In Vercel: project → Settings → Domains → Add your domain
3. Vercel gives you two DNS records to add in your registrar's dashboard
4. SSL certificate is issued automatically (free, via Let's Encrypt)

---

## Project structure

```
nextjs-app/
├── app/
│   ├── layout.tsx          ← Root layout + global SEO metadata
│   ├── globals.css
│   ├── page.tsx            ← Landing page (add this next)
│   ├── dashboard/
│   │   ├── page.tsx        ← Server component (data fetch)
│   │   └── DashboardClient.tsx ← Real-time UI
│   ├── capture/
│   │   └── page.tsx        ← Employee feedback form
│   ├── [slug]/
│   │   ├── page.tsx        ← Public hotel page (SEO + SSR)
│   │   └── PublicPageClient.tsx
│   ├── api/
│   │   ├── checkout/route.ts ← Creates Stripe checkout session
│   │   └── webhook/route.ts  ← Handles Stripe payment events
│   ├── sitemap.ts          ← Auto-generates /sitemap.xml
│   └── robots.ts           ← Auto-generates /robots.txt
├── lib/
│   ├── supabase.ts         ← Browser + server + admin clients
│   └── stripe.ts           ← Stripe instance + plan config
├── middleware.ts            ← Auth protection + session refresh
├── types/index.ts           ← Shared TypeScript types
├── supabase-schema.sql      ← Run this in Supabase SQL editor
└── .env.example             ← Copy to .env.local
```

---

## SEO checklist before launch

- [ ] Add a 1200×630px `og-image.png` to `/public`
- [ ] Add `favicon.ico` and `apple-touch-icon.png` to `/public`
- [ ] Submit `https://yourdomain.com/sitemap.xml` to Google Search Console
- [ ] Add your domain to Google Search Console for ranking monitoring
- [ ] Set `NEXT_PUBLIC_APP_URL` to your real domain in Vercel env vars
