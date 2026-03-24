/**
 * / — Landing page
 * Server Component — fully rendered HTML sent to the browser and crawlers.
 */

import Link from 'next/link';
import CheckoutButton from '@/components/CheckoutButton';
import {
  Zap, X, Check, MessageSquare, Clock, TrendingDown, CheckCircle2,
  AlertTriangle, Activity, Building2, Bell, Sparkles,
} from 'lucide-react';

const STAT_CARDS = [
  { Icon: MessageSquare, value: '67%',    desc: 'Of guest opportunities are reported verbally and never logged',            positive: false },
  { Icon: Clock,         value: '3–7 days', desc: 'Average delay before management learns of a serious issue',     positive: false },
  { Icon: TrendingDown,  value: '2–3 stars', desc: 'The review score when a guest opportunity goes unresolved',            positive: false },
  { Icon: CheckCircle2,  value: '92%+',   desc: 'Resolution rate when guest opportunities are logged in real time',         positive: true  },
];

const FEATURES = [
  { Icon: Zap,           title: '30-Second Logging',         body: 'Staff log a guest opportunity in under 30 seconds. Department, category, description, severity — one screen, no friction.' },
  { Icon: AlertTriangle, title: 'Severity Triage',           body: 'Four levels — Low, Medium, High, Critical — so management always knows what to tackle first and can respond proportionally.' },
  { Icon: Activity,      title: 'Real-Time Dashboard',       body: 'Every guest opportunity appears on the management dashboard the moment it is submitted, with live status tracking from open to resolved.' },
  { Icon: Building2,     title: 'By-Department Breakdown',   body: 'Instantly see which departments are generating the most open guest opportunities, so you can spot systemic issues and intervene early.' },
  { Icon: Bell,          title: 'Instant Manager Alerts',    body: 'High and critical guest opportunities trigger an immediate toast alert to management — no more waiting to find out about serious issues.' },
  { Icon: Sparkles,      title: 'AI Pattern Detection',      body: 'Pro plan: AI identifies recurring guest opportunity patterns, repeat issues by room or department, and surfaces prioritized recommendations.' },
];

export default function HomePage() {
  return (
    <main style={{ fontFamily: 'var(--font)' }}>

      {/* ── Navbar ── */}
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
        background: 'rgba(13,27,42,0.97)', backdropFilter: 'blur(12px)',
        boxShadow: '0 2px 24px rgba(0,0,0,0.2)',
      }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 72 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontFamily: 'var(--font-display)', fontWeight: 400, fontSize: '1.45rem', color: 'white', letterSpacing: '-0.02em' }}>
            <span style={{ width: 36, height: 36, background: '#C9A84C', borderRadius: 8, display: 'grid', placeItems: 'center' }}>
              <Zap size={18} color="#0D1B2A" strokeWidth={2.5} />
            </span>
            PulseStay
          </div>
          <div style={{ display: 'flex', gap: 24, alignItems: 'center' }}>
            <a href="#how-it-works" style={{ color: 'rgba(255,255,255,0.7)', fontSize: 14, fontWeight: 500 }}>How It Works</a>
            <a href="#features" style={{ color: 'rgba(255,255,255,0.7)', fontSize: 14, fontWeight: 500 }}>Features</a>
            <a href="#pricing" style={{ color: 'rgba(255,255,255,0.7)', fontSize: 14, fontWeight: 500 }}>Pricing</a>
            <Link href="/dashboard" style={{ padding: '9px 18px', border: '2px solid rgba(255,255,255,0.25)', color: 'white', borderRadius: 8, fontSize: 13, fontWeight: 600 }}>
              Dashboard Demo
            </Link>
            <a href="#pricing" style={{ padding: '9px 18px', background: '#C9A84C', color: '#0D1B2A', borderRadius: 8, fontSize: 13, fontWeight: 700 }}>
              Get Started
            </a>
          </div>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #0D1B2A 0%, #162436 50%, #1a2f44 100%)',
        display: 'flex', alignItems: 'center',
        paddingTop: 72, position: 'relative', overflow: 'hidden',
      }}>
        <div style={{
          position: 'absolute', inset: 0, opacity: 1,
          backgroundImage: 'linear-gradient(rgba(201,168,76,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(201,168,76,0.04) 1px, transparent 1px)',
          backgroundSize: '60px 60px',
        }} />
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 70% 50%, rgba(201,168,76,0.07) 0%, transparent 60%)' }} />

        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '80px 24px', position: 'relative', zIndex: 1, width: '100%' }}>
          <div style={{ maxWidth: 700 }}>
            <span style={{ display: 'inline-block', padding: '6px 16px', borderRadius: 999, fontSize: 12, fontWeight: 700, textTransform: 'uppercase' as const, letterSpacing: '0.05em', background: 'rgba(201,168,76,0.15)', color: '#9A7A2E', border: '1px solid rgba(201,168,76,0.3)', marginBottom: 24 }}>
              Built for 5-Star Resorts
            </span>
            <h1 style={{ fontSize: 'clamp(2.4rem, 5vw, 3.8rem)', fontWeight: 400, fontFamily: 'var(--font-display)', color: 'white', lineHeight: 1.1, letterSpacing: '-0.03em', marginBottom: 24 }}>
              Resolve Every Guest Opportunity <span style={{ color: '#C9A84C' }}>Before They Check Out</span>
            </h1>
            <p style={{ fontSize: '1.15rem', color: 'rgba(255,255,255,0.6)', lineHeight: 1.7, marginBottom: 40, maxWidth: 580 }}>
              Guests are specific when they complain — and that specificity is your most actionable data.
              PulseStay gives your staff a 30-second tool to log every guest opportunity in real time, and gives management a live dashboard to assign, track, and close guest opportunities before the guest leaves.
            </p>
            <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' as const }}>
              <Link href="/capture" style={{ padding: '18px 36px', background: '#C9A84C', color: '#0D1B2A', borderRadius: 8, fontWeight: 700, fontSize: 17, display: 'inline-block' }}>
                Try the Employee App
              </Link>
              <Link href="/dashboard" style={{ padding: '18px 36px', border: '2px solid rgba(255,255,255,0.25)', color: 'white', borderRadius: 8, fontWeight: 700, fontSize: 17, display: 'inline-block' }}>
                View Live Dashboard
              </Link>
            </div>

            {/* Stats */}
            <div style={{ display: 'flex', gap: 40, marginTop: 56, paddingTop: 40, borderTop: '1px solid rgba(255,255,255,0.1)', flexWrap: 'wrap' as const }}>
              {[
                { value: '< 30s', label: 'To log a guest opportunity' },
                { value: '92%', label: 'Resolved before checkout' },
                { value: '4×', label: 'Fewer negative reviews' },
              ].map(s => (
                <div key={s.label}>
                  <div style={{ fontSize: '2rem', fontWeight: 800, color: '#C9A84C', fontFamily: 'var(--font-display)', letterSpacing: '-0.02em' }}>{s.value}</div>
                  <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.45)', marginTop: 2 }}>{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Problem ── */}
      <section style={{ padding: '96px 0', background: '#F8F6F2' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 64, alignItems: 'center' }}>
            <div>
              <span style={{ display: 'inline-block', padding: '6px 16px', borderRadius: 999, fontSize: 12, fontWeight: 700, textTransform: 'uppercase' as const, letterSpacing: '0.05em', background: 'rgba(201,168,76,0.15)', color: '#9A7A2E', border: '1px solid rgba(201,168,76,0.3)', marginBottom: 20 }}>
                The Problem
              </span>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.8rem, 3vw, 2.6rem)', fontWeight: 400, letterSpacing: '-0.02em', marginBottom: 20 }}>Guest Opportunities Get Lost. Then They Go Public.</h2>
              <p style={{ color: '#6B7280', lineHeight: 1.8, marginBottom: 16 }}>
                A guest mentions a broken AC at breakfast. The server passes it on verbally. By the afternoon, nothing has been done — and by the time the guest checks out, they're writing a 2-star TripAdvisor review.
              </p>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column' as const, gap: 12, marginTop: 24 }}>
                {[
                  'Verbal handoffs mean guest opportunities vanish between shifts',
                  'No record = no accountability = no fix',
                  'Management only hears about issues after the guest has left',
                  'One unresolved guest opportunity can cost 10 future bookings',
                  'Staff have no simple, fast tool to escalate issues on the spot',
                ].map(item => (
                  <li key={item} style={{ display: 'flex', gap: 12, fontSize: 15, alignItems: 'flex-start' }}>
                    <X size={16} color="#EF4444" strokeWidth={2.5} style={{ flexShrink: 0, marginTop: 2 }} />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column' as const, gap: 16 }}>
              {STAT_CARDS.map(s => (
                <div key={s.value} style={{ background: 'white', borderRadius: 12, padding: 24, boxShadow: '0 4px 24px rgba(0,0,0,0.06)', display: 'flex', alignItems: 'center', gap: 20, borderLeft: `4px solid ${s.positive ? '#10B981' : '#EF4444'}` }}>
                  <span style={{ width: 48, height: 48, borderRadius: 10, background: s.positive ? 'rgba(16,185,129,0.08)' : 'rgba(239,68,68,0.08)', display: 'grid', placeItems: 'center', flexShrink: 0 }}>
                    <s.Icon size={22} color={s.positive ? '#10B981' : '#EF4444'} />
                  </span>
                  <div>
                    <div style={{ fontSize: '2rem', fontWeight: 800, color: s.positive ? '#10B981' : '#EF4444', fontFamily: 'var(--font-display)', letterSpacing: '-0.02em' }}>{s.value}</div>
                    <div style={{ fontSize: 14, color: '#6B7280', marginTop: 4 }}>{s.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── How It Works ── */}
      <section id="how-it-works" style={{ padding: '96px 0' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px', textAlign: 'center' as const }}>
          <span style={{ display: 'inline-block', padding: '6px 16px', borderRadius: 999, fontSize: 12, fontWeight: 700, textTransform: 'uppercase' as const, letterSpacing: '0.05em', background: 'rgba(201,168,76,0.15)', color: '#9A7A2E', border: '1px solid rgba(201,168,76,0.3)', marginBottom: 16 }}>
            How It Works
          </span>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.8rem, 3vw, 2.6rem)', fontWeight: 400, letterSpacing: '-0.02em', marginBottom: 12 }}>From Guest Opportunity to Resolution in Minutes</h2>
          <p style={{ color: '#6B7280', fontSize: '1.05rem', maxWidth: 560, margin: '0 auto 64px' }}>A simple four-step loop that ensures no guest opportunity slips through the cracks.</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 32 }}>
            {[
              { n: '1', title: 'Guest Reports an Issue', body: 'A guest mentions a problem to any staff member — at the pool, in the restaurant, or at the front desk.' },
              { n: '2', title: 'Staff Logs It in 30s', body: 'The employee opens PulseStay, selects department and category, types the guest opportunity, sets severity, and submits.' },
              { n: '3', title: 'Manager Is Alerted Instantly', body: 'High and critical guest opportunities trigger a real-time alert. The issue appears live on the dashboard within seconds.' },
              { n: '4', title: 'Issue Tracked to Resolution', body: 'Management assigns the guest opportunity, marks it in progress, and closes it when resolved — all before checkout.' },
            ].map(step => (
              <div key={step.n} style={{ textAlign: 'center' as const }}>
                <div style={{ width: 56, height: 56, borderRadius: '50%', background: '#C9A84C', color: '#0D1B2A', fontWeight: 800, fontSize: '1.2rem', display: 'grid', placeItems: 'center', margin: '0 auto 24px', boxShadow: '0 4px 16px rgba(201,168,76,0.4)' }}>{step.n}</div>
                <h4 style={{ fontWeight: 700, marginBottom: 10 }}>{step.title}</h4>
                <p style={{ fontSize: 14, color: '#6B7280', lineHeight: 1.6 }}>{step.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section id="features" style={{ padding: '96px 0', background: '#F8F6F2' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px' }}>
          <div style={{ textAlign: 'center' as const, marginBottom: 64 }}>
            <span style={{ display: 'inline-block', padding: '6px 16px', borderRadius: 999, fontSize: 12, fontWeight: 700, textTransform: 'uppercase' as const, letterSpacing: '0.05em', background: 'rgba(201,168,76,0.15)', color: '#9A7A2E', border: '1px solid rgba(201,168,76,0.3)', marginBottom: 16 }}>
              Platform Features
            </span>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.8rem, 3vw, 2.6rem)', fontWeight: 400, letterSpacing: '-0.02em', marginBottom: 12 }}>Everything You Need to Close Every Guest Opportunity</h2>
            <p style={{ color: '#6B7280', fontSize: '1.05rem', maxWidth: 560, margin: '0 auto' }}>Built for the operational pace of a luxury hospitality environment.</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24 }}>
            {FEATURES.map(f => (
              <div key={f.title} style={{ background: 'white', borderRadius: 12, padding: '32px 28px', boxShadow: '0 4px 24px rgba(0,0,0,0.06)', border: '1px solid transparent' }}>
                <div style={{ width: 52, height: 52, borderRadius: 12, background: 'rgba(201,168,76,0.1)', display: 'grid', placeItems: 'center', marginBottom: 20 }}>
                  <f.Icon size={22} color="#9A7A2E" strokeWidth={1.75} />
                </div>
                <h4 style={{ fontWeight: 700, marginBottom: 10 }}>{f.title}</h4>
                <p style={{ fontSize: 14, color: '#6B7280', lineHeight: 1.7 }}>{f.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Pricing ── */}
      <section id="pricing" style={{ padding: '96px 0', background: '#0D1B2A' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px' }}>
          <div style={{ textAlign: 'center' as const, marginBottom: 56 }}>
            <span style={{ display: 'inline-block', padding: '6px 16px', borderRadius: 999, fontSize: 12, fontWeight: 700, textTransform: 'uppercase' as const, letterSpacing: '0.05em', background: 'rgba(201,168,76,0.15)', color: '#C9A84C', border: '1px solid rgba(201,168,76,0.3)', marginBottom: 16 }}>
              Simple Pricing
            </span>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.8rem, 3vw, 2.6rem)', fontWeight: 400, letterSpacing: '-0.02em', color: 'white', marginBottom: 12 }}>Start Resolving Guest Opportunities in Minutes</h2>
            <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '1.05rem' }}>No setup fees. No long-term contracts. 14-day free trial on all plans.</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24, maxWidth: 960, margin: '0 auto' }}>
            {[
              {
                name: 'Starter', price: '$149', period: 'per month / per property', featured: false,
                features: ['Up to 3 departments', 'Real-time guest opportunity logging', 'Live management dashboard', 'Severity triage', 'Up to 5 staff accounts'],
                cta: 'Get Started Free', ctaStyle: { border: '2px solid #C9A84C', color: '#C9A84C', background: 'transparent' },
              },
              {
                name: 'Pro', price: '$349', period: 'per month / per property', featured: true,
                features: ['Unlimited departments', 'AI pattern detection', 'Instant alert system', 'Guest opportunity assignment', 'Up to 25 staff accounts', 'Priority support'],
                cta: 'Start 14-Day Trial', ctaStyle: { background: '#0D1B2A', color: 'white', border: 'none' },
              },
              {
                name: 'Enterprise', price: 'Custom', period: 'multi-property / chain', featured: false,
                features: ['Unlimited properties', 'Cross-property benchmarking', 'Custom AI fine-tuning', 'PMS / POS integrations', 'Dedicated success manager', 'White-label option'],
                cta: 'Talk to Sales', ctaStyle: { border: '2px solid #C9A84C', color: '#C9A84C', background: 'transparent' },
              },
            ].map(plan => (
              <div key={plan.name} style={{
                background: plan.featured ? '#C9A84C' : 'rgba(255,255,255,0.04)',
                border: `1px solid ${plan.featured ? '#C9A84C' : 'rgba(255,255,255,0.08)'}`,
                borderRadius: 12, padding: 36,
                transform: plan.featured ? 'scale(1.03)' : 'none',
                position: 'relative' as const,
              }}>
                {plan.featured && (
                  <span style={{ position: 'absolute', top: -12, left: '50%', transform: 'translateX(-50%)', background: '#0D1B2A', color: '#C9A84C', fontSize: 11, fontWeight: 700, padding: '4px 14px', borderRadius: 999, border: '1px solid #C9A84C', whiteSpace: 'nowrap' as const }}>
                    Most Popular
                  </span>
                )}
                <div style={{ fontSize: 13, fontWeight: 600, color: plan.featured ? 'rgba(13,27,42,0.6)' : 'rgba(255,255,255,0.5)', textTransform: 'uppercase' as const, letterSpacing: '0.05em', marginBottom: 16 }}>{plan.name}</div>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: '2.8rem', fontWeight: 400, letterSpacing: '-0.03em', color: plan.featured ? '#0D1B2A' : 'white' }}>{plan.price}</div>
                <div style={{ fontSize: 13, color: plan.featured ? 'rgba(13,27,42,0.5)' : 'rgba(255,255,255,0.4)', marginBottom: 28 }}>{plan.period}</div>
                <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column' as const, gap: 12, marginBottom: 32 }}>
                  {plan.features.map(f => (
                    <li key={f} style={{ display: 'flex', gap: 10, fontSize: 14, color: plan.featured ? '#0D1B2A' : 'rgba(255,255,255,0.75)', alignItems: 'flex-start' }}>
                      <Check size={15} color={plan.featured ? '#0D1B2A' : '#10B981'} strokeWidth={2.5} style={{ flexShrink: 0, marginTop: 2 }} />
                      {f}
                    </li>
                  ))}
                </ul>
                {plan.name === 'Enterprise' ? (
                  <a href="mailto:sales@pulsestay.com" style={{ display: 'block', textAlign: 'center', width: '100%', padding: '14px', borderRadius: 8, fontWeight: 700, fontSize: 14, textDecoration: 'none', ...plan.ctaStyle }}>{plan.cta}</a>
                ) : (
                  <a href="/login" style={{ display: 'block', textAlign: 'center', width: '100%', padding: '14px', borderRadius: 8, fontWeight: 700, fontSize: 14, textDecoration: 'none', ...plan.ctaStyle }}>{plan.cta}</a>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section style={{ padding: '96px 0', background: '#162436', textAlign: 'center' as const }}>
        <div style={{ maxWidth: 700, margin: '0 auto', padding: '0 24px' }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.8rem, 3vw, 2.6rem)', fontWeight: 400, letterSpacing: '-0.02em', color: 'white', marginBottom: 20 }}>
            Stop Letting Guest Opportunities <span style={{ color: '#C9A84C' }}>Turn Into Bad Reviews</span>
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: '1.05rem', marginBottom: 40 }}>
            Give your team the tools to capture every issue in real time — and give your managers the clarity to fix them before the guest checks out.
          </p>
          <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' as const }}>
            <Link href="/capture" style={{ padding: '16px 32px', background: '#C9A84C', color: '#0D1B2A', borderRadius: 8, fontWeight: 700, fontSize: 16 }}>
              Try Employee App Free
            </Link>
            <Link href="/dashboard" style={{ padding: '16px 32px', border: '2px solid rgba(255,255,255,0.25)', color: 'white', borderRadius: 8, fontWeight: 700, fontSize: 16 }}>
              Explore the Dashboard
            </Link>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer style={{ background: '#070E16', padding: '48px 0 32px' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 32, borderTop: '1px solid rgba(255,255,255,0.06)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontFamily: 'var(--font-display)', fontWeight: 400, fontSize: '1.1rem', color: 'white', letterSpacing: '-0.02em' }}>
              <span style={{ width: 30, height: 30, background: '#C9A84C', borderRadius: 6, display: 'grid', placeItems: 'center' }}>
                <Zap size={15} color="#0D1B2A" strokeWidth={2.5} />
              </span>
              PulseStay
            </div>
            <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.3)' }}>© 2026 PulseStay Inc. All rights reserved.</p>
          </div>
        </div>
      </footer>

    </main>
  );
}
