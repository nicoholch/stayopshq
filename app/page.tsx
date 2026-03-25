/**
 * / — Landing page
 * Server Component — fully rendered HTML sent to the browser and crawlers.
 */

import Link from 'next/link';
import {
  Zap, X, Check, MessageSquare, Clock, TrendingDown, CheckCircle2,
  AlertTriangle, Activity, Building2, Bell, Sparkles, Star,
} from 'lucide-react';

const STAT_CARDS = [
  { Icon: MessageSquare, value: '67%',      desc: 'Of guest issues are reported verbally and never logged',          positive: false },
  { Icon: Clock,         value: '3–7 days', desc: 'Average delay before management learns of a serious issue',       positive: false },
  { Icon: TrendingDown,  value: '2–3 stars', desc: 'The review score when an issue goes unresolved at checkout',     positive: false },
  { Icon: CheckCircle2,  value: '92%+',     desc: 'Resolution rate when issues are logged and tracked in real time', positive: true  },
];

const FEATURES = [
  { Icon: Zap,           title: '30-Second Logging',       body: 'Staff log a guest opportunity in under 30 seconds. Department, category, description, severity — one screen, no friction.' },
  { Icon: AlertTriangle, title: 'Severity Triage',         body: 'Four levels — Low, Medium, High, Critical — so management always knows what to tackle first and can respond proportionally.' },
  { Icon: Activity,      title: 'Real-Time Dashboard',     body: 'Every issue appears on the management dashboard the moment it is submitted, with live status tracking from open to resolved.' },
  { Icon: Building2,     title: 'By-Department Breakdown', body: 'Instantly see which departments are generating the most open issues, so you can spot systemic problems and intervene early.' },
  { Icon: Bell,          title: 'Instant Manager Alerts',  body: 'High and critical issues trigger an immediate toast alert to management — no more waiting to find out about serious problems.' },
  { Icon: Sparkles,      title: 'AI Pattern Detection',    body: 'Pro plan: AI identifies recurring patterns, repeat issues by room or department, and surfaces prioritised recommendations.' },
];

const TESTIMONIALS = [
  {
    quote: "We used to run the morning briefing from memory and WhatsApp screenshots. Now we run it from PulseStay. Every issue from the night before is logged, assigned, and either resolved or escalating. It changed how we start every single day.",
    name: 'James Whitfield',
    title: 'General Manager',
    property: 'Private Island Resort, Indian Ocean',
    stars: 5,
  },
  {
    quote: "The 30-second logging is real. Our beach staff are not tech people — they log an issue between guest interactions without thinking about it. Before PulseStay we were losing at least three issues per shift to verbal handoffs that never reached management.",
    name: 'Elena Marchetti',
    title: 'Director of Operations',
    property: 'Boutique Coastal Collection, Amalfi',
    stars: 5,
  },
  {
    quote: "What convinced me was the severity triage. A broken safe and a noisy AC are not the same problem, but our old system treated them identically. Now my team knows exactly what to drop everything for and what can wait until after service.",
    name: 'David Osei',
    title: 'Front Office Manager',
    property: 'Luxury Safari Lodge, Kenya',
    stars: 5,
  },
];

const COMPARISON = [
  { feature: 'Issues logged in under 30 seconds', pulsestay: true,  paper: false, spreadsheet: false, whatsapp: false },
  { feature: 'Real-time manager alerts',           pulsestay: true,  paper: false, spreadsheet: false, whatsapp: 'partial' },
  { feature: 'Severity triage',                    pulsestay: true,  paper: false, spreadsheet: false, whatsapp: false },
  { feature: 'Resolution tracking',                pulsestay: true,  paper: false, spreadsheet: 'partial', whatsapp: false },
  { feature: 'By-department analytics',            pulsestay: true,  paper: false, spreadsheet: 'partial', whatsapp: false },
  { feature: 'Works on any phone',                 pulsestay: true,  paper: true,  spreadsheet: 'partial', whatsapp: true },
  { feature: 'No training required',               pulsestay: true,  paper: true,  spreadsheet: false, whatsapp: true },
  { feature: 'Post-resolution satisfaction score', pulsestay: true,  paper: false, spreadsheet: false, whatsapp: false },
];

const FAQS = [
  {
    q: 'How long does setup take?',
    a: 'Under 10 minutes. Create an account, name your property, select your departments, and share the capture link with your team. There is no hardware, no installation, and no IT department required.',
  },
  {
    q: 'Do my staff need training?',
    a: 'No. The capture form is four taps and a short description. Staff who have never used it before can log their first issue in under a minute. We designed it specifically for hospitality staff who are on the move.',
  },
  {
    q: 'What devices does PulseStay work on?',
    a: 'Any device with a browser — iPhone, Android, tablet, or desktop. No app download required. The capture form is optimised for mobile and works on poor connections common in remote resort environments.',
  },
  {
    q: 'Is our guest data secure?',
    a: 'Yes. All data is encrypted at rest and in transit. PulseStay is built on Supabase, which runs on AWS infrastructure with SOC 2-compliant controls. Guest data is never shared with third parties or used to train AI models.',
  },
  {
    q: 'Can I add more departments or staff accounts later?',
    a: 'Yes, at any time. Starter supports up to 3 departments and 5 staff accounts. Upgrade to Pro for unlimited departments and up to 25 accounts. Enterprise supports unlimited properties and accounts.',
  },
  {
    q: 'What happens after the 14-day trial ends?',
    a: 'You will be prompted to choose a plan. If you do nothing, your account moves to read-only — you can view historical data but cannot log new issues. No data is deleted. You can upgrade at any time to resume full access.',
  },
];

// ── Small helper components ────────────────────────────────────────────────────

function CheckCell({ value }: { value: boolean | 'partial' }) {
  if (value === true)      return <span style={{ color: '#10B981', fontWeight: 700, fontSize: 18 }}>✓</span>;
  if (value === 'partial') return <span style={{ color: '#D97706', fontWeight: 700, fontSize: 15 }}>~</span>;
  return                          <span style={{ color: '#EF4444', fontWeight: 700, fontSize: 18 }}>✕</span>;
}

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
            <a href="#features"     style={{ color: 'rgba(255,255,255,0.7)', fontSize: 14, fontWeight: 500 }}>Features</a>
            <a href="#pricing"      style={{ color: 'rgba(255,255,255,0.7)', fontSize: 14, fontWeight: 500 }}>Pricing</a>
            <Link href="/dashboard" style={{ padding: '9px 18px', border: '2px solid rgba(255,255,255,0.25)', color: 'white', borderRadius: 8, fontSize: 13, fontWeight: 600, textDecoration: 'none' }}>
              Dashboard Demo
            </Link>
            <a href="/login" style={{ padding: '9px 18px', background: '#C9A84C', color: '#0D1B2A', borderRadius: 8, fontSize: 13, fontWeight: 700, textDecoration: 'none' }}>
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
        <div style={{ position: 'absolute', inset: 0, opacity: 1, backgroundImage: 'linear-gradient(rgba(201,168,76,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(201,168,76,0.04) 1px, transparent 1px)', backgroundSize: '60px 60px' }} />
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 70% 50%, rgba(201,168,76,0.07) 0%, transparent 60%)' }} />

        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '80px 24px', position: 'relative', zIndex: 1, width: '100%', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 64, alignItems: 'center' }}>

          {/* Left: copy */}
          <div>
            <span style={{ display: 'inline-block', padding: '6px 16px', borderRadius: 999, fontSize: 12, fontWeight: 700, textTransform: 'uppercase' as const, letterSpacing: '0.05em', background: 'rgba(201,168,76,0.15)', color: '#9A7A2E', border: '1px solid rgba(201,168,76,0.3)', marginBottom: 24 }}>
              Built for 5-Star Resorts
            </span>
            <h1 style={{ fontSize: 'clamp(2.4rem, 4vw, 3.6rem)', fontWeight: 400, fontFamily: 'var(--font-display)', color: 'white', lineHeight: 1.1, letterSpacing: '-0.03em', marginBottom: 24 }}>
              Resolve Every Guest Issue{' '}
              <span style={{ color: '#C9A84C' }}>Before They Check Out</span>
            </h1>
            <p style={{ fontSize: '1.1rem', color: 'rgba(255,255,255,0.6)', lineHeight: 1.7, marginBottom: 40, maxWidth: 520 }}>
              Staff log any guest issue in 30 seconds. Management sees it instantly and tracks it to resolution — before the guest writes a review.
            </p>
            <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' as const }}>
              <a href="/login" style={{ padding: '16px 32px', background: '#C9A84C', color: '#0D1B2A', borderRadius: 8, fontWeight: 700, fontSize: 16, textDecoration: 'none' }}>
                Start Free Trial
              </a>
              <Link href="/dashboard" style={{ padding: '16px 32px', border: '2px solid rgba(255,255,255,0.25)', color: 'white', borderRadius: 8, fontWeight: 700, fontSize: 16, textDecoration: 'none' }}>
                View Live Demo
              </Link>
            </div>
            <div style={{ display: 'flex', gap: 40, marginTop: 48, paddingTop: 40, borderTop: '1px solid rgba(255,255,255,0.1)', flexWrap: 'wrap' as const }}>
              {[
                { value: '< 30s',  label: 'To log any issue' },
                { value: '92%',    label: 'Resolved before checkout' },
                { value: '4×',     label: 'Fewer negative reviews' },
              ].map(s => (
                <div key={s.label}>
                  <div style={{ fontSize: '2rem', fontWeight: 800, color: '#C9A84C', fontFamily: 'var(--font-display)', letterSpacing: '-0.02em' }}>{s.value}</div>
                  <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.45)', marginTop: 2 }}>{s.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Right: product mockup */}
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <div style={{ width: '100%', maxWidth: 420, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 16, overflow: 'hidden', boxShadow: '0 32px 80px rgba(0,0,0,0.5)' }}>
              {/* Mockup header */}
              <div style={{ padding: '14px 18px', borderBottom: '1px solid rgba(255,255,255,0.08)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ width: 24, height: 24, background: '#C9A84C', borderRadius: 5, display: 'grid', placeItems: 'center' }}><Zap size={12} color="#0D1B2A" strokeWidth={2.5} /></span>
                  <span style={{ fontSize: 13, fontWeight: 700, color: 'white' }}>Live Dashboard</span>
                </div>
                <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, fontWeight: 700, color: '#10B981' }}>
                  <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#10B981', display: 'inline-block' }} />
                  Live
                </span>
              </div>
              {/* KPI strip */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 1, background: 'rgba(255,255,255,0.06)', margin: '14px 14px 0' , borderRadius: 10, overflow: 'hidden' }}>
                {[
                  { label: 'Open',          value: '4', color: '#EF4444' },
                  { label: 'Critical',      value: '1', color: '#7C3AED' },
                  { label: 'Resolved Today',value: '7', color: '#10B981' },
                ].map(k => (
                  <div key={k.label} style={{ background: 'rgba(255,255,255,0.03)', padding: '12px 10px', textAlign: 'center' as const }}>
                    <div style={{ fontSize: '1.5rem', fontWeight: 800, color: k.color }}>{k.value}</div>
                    <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)', marginTop: 2 }}>{k.label}</div>
                  </div>
                ))}
              </div>
              {/* Live feed */}
              <div style={{ padding: 14, display: 'flex', flexDirection: 'column' as const, gap: 8 }}>
                {[
                  { dept: 'Housekeeping', room: '412', sev: 'CRITICAL', sevColor: '#7C3AED', sevBg: 'rgba(124,58,237,0.15)', desc: 'A/C unit loud buzzing — guest cannot sleep', time: '2 min ago', status: 'open' },
                  { dept: 'Food & Beverage', room: '—', sev: 'HIGH', sevColor: '#EF4444', sevBg: 'rgba(239,68,68,0.12)', desc: 'Breakfast wait over 40 minutes, table still not ready', time: '11 min ago', status: 'in progress' },
                  { dept: 'Front Desk', room: '208', sev: 'LOW', sevColor: '#6B7280', sevBg: 'rgba(107,114,128,0.12)', desc: 'Extra pillows and blanket requested', time: '18 min ago', status: 'resolved' },
                ].map((item, i) => (
                  <div key={i} style={{ background: 'rgba(255,255,255,0.04)', borderRadius: 8, padding: '10px 12px', borderLeft: `3px solid ${item.sevColor}` }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                      <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                        <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 6px', borderRadius: 4, background: item.sevBg, color: item.sevColor }}>{item.sev}</span>
                        <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)' }}>{item.dept}{item.room !== '—' ? ` · Rm ${item.room}` : ''}</span>
                      </div>
                      <span style={{ fontSize: 10, color: item.status === 'resolved' ? '#10B981' : 'rgba(255,255,255,0.3)', fontWeight: item.status === 'resolved' ? 700 : 400 }}>
                        {item.status === 'resolved' ? '✓ Resolved' : item.time}
                      </span>
                    </div>
                    <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.65)', lineHeight: 1.4 }}>{item.desc}</div>
                  </div>
                ))}
              </div>
              <div style={{ padding: '0 14px 14px' }}>
                <div style={{ background: 'rgba(201,168,76,0.08)', border: '1px solid rgba(201,168,76,0.2)', borderRadius: 8, padding: '10px 14px', display: 'flex', alignItems: 'center', gap: 10 }}>
                  <Bell size={14} color="#C9A84C" strokeWidth={2} />
                  <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)' }}><strong style={{ color: '#C9A84C' }}>Alert sent</strong> — Critical issue in Room 412 escalated to GM</span>
                </div>
              </div>
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
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.8rem, 3vw, 2.6rem)', fontWeight: 400, letterSpacing: '-0.02em', marginBottom: 20 }}>Guest Issues Get Lost. Then They Go Public.</h2>
              <p style={{ color: '#6B7280', lineHeight: 1.8, marginBottom: 16 }}>
                A guest mentions a broken AC at breakfast. The server passes it on verbally. By afternoon nothing has been done — and by checkout, they're writing a 2-star TripAdvisor review.
              </p>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column' as const, gap: 12, marginTop: 24 }}>
                {[
                  'Verbal handoffs mean issues vanish between shifts',
                  'No record = no accountability = no fix',
                  'Management only hears about issues after the guest has left',
                  'One unresolved issue can cost 10 future bookings',
                  'Staff have no simple, fast tool to escalate on the spot',
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
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.8rem, 3vw, 2.6rem)', fontWeight: 400, letterSpacing: '-0.02em', marginBottom: 12 }}>From Issue to Resolution in Minutes</h2>
          <p style={{ color: '#6B7280', fontSize: '1.05rem', maxWidth: 560, margin: '0 auto 64px' }}>A simple four-step loop that ensures no guest issue slips through the cracks.</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 32 }}>
            {[
              { n: '1', title: 'Guest Reports an Issue',      body: 'A guest mentions a problem to any staff member — at the pool, in the restaurant, or at the front desk.' },
              { n: '2', title: 'Staff Logs It in 30s',        body: 'The employee opens PulseStay, selects department and category, describes the issue, sets severity, and submits.' },
              { n: '3', title: 'Manager Is Alerted Instantly', body: 'High and critical issues trigger a real-time alert. The issue appears live on the dashboard within seconds.' },
              { n: '4', title: 'Issue Tracked to Resolution', body: 'Management assigns, marks in progress, and closes it when resolved — all before the guest checks out.' },
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
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.8rem, 3vw, 2.6rem)', fontWeight: 400, letterSpacing: '-0.02em', marginBottom: 12 }}>Everything You Need to Close Every Issue</h2>
            <p style={{ color: '#6B7280', fontSize: '1.05rem', maxWidth: 560, margin: '0 auto' }}>Built for the operational pace of a luxury hospitality environment.</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24 }}>
            {FEATURES.map(f => (
              <div key={f.title} style={{ background: 'white', borderRadius: 12, padding: '32px 28px', boxShadow: '0 4px 24px rgba(0,0,0,0.06)' }}>
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

      {/* ── Testimonials ── */}
      <section style={{ padding: '96px 0', background: '#0D1B2A' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px' }}>
          <div style={{ textAlign: 'center' as const, marginBottom: 56 }}>
            <span style={{ display: 'inline-block', padding: '6px 16px', borderRadius: 999, fontSize: 12, fontWeight: 700, textTransform: 'uppercase' as const, letterSpacing: '0.05em', background: 'rgba(201,168,76,0.15)', color: '#C9A84C', border: '1px solid rgba(201,168,76,0.3)', marginBottom: 16 }}>
              Early Access
            </span>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.8rem, 3vw, 2.6rem)', fontWeight: 400, letterSpacing: '-0.02em', color: 'white', marginBottom: 12 }}>What Hospitality Leaders Are Saying</h2>
            <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '1.05rem' }}>From GMs and operations directors who ran the pilot programme.</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24 }}>
            {TESTIMONIALS.map(t => (
              <div key={t.name} style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 16, padding: 32, display: 'flex', flexDirection: 'column' as const, gap: 24 }}>
                <div style={{ display: 'flex', gap: 4 }}>
                  {Array.from({ length: t.stars }).map((_, i) => (
                    <Star key={i} size={16} color="#C9A84C" fill="#C9A84C" strokeWidth={0} />
                  ))}
                </div>
                <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.75)', lineHeight: 1.75, fontStyle: 'italic', flexGrow: 1 }}>"{t.quote}"</p>
                <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: 20 }}>
                  <div style={{ fontWeight: 700, color: 'white', fontSize: 14 }}>{t.name}</div>
                  <div style={{ fontSize: 13, color: '#C9A84C', marginTop: 2 }}>{t.title}</div>
                  <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)', marginTop: 2 }}>{t.property}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Comparison ── */}
      <section style={{ padding: '96px 0', background: '#F8F6F2' }}>
        <div style={{ maxWidth: 960, margin: '0 auto', padding: '0 24px' }}>
          <div style={{ textAlign: 'center' as const, marginBottom: 56 }}>
            <span style={{ display: 'inline-block', padding: '6px 16px', borderRadius: 999, fontSize: 12, fontWeight: 700, textTransform: 'uppercase' as const, letterSpacing: '0.05em', background: 'rgba(201,168,76,0.15)', color: '#9A7A2E', border: '1px solid rgba(201,168,76,0.3)', marginBottom: 16 }}>
              Why PulseStay
            </span>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.8rem, 3vw, 2.6rem)', fontWeight: 400, letterSpacing: '-0.02em', marginBottom: 12 }}>Built for This. Not Bolted On.</h2>
            <p style={{ color: '#6B7280', fontSize: '1.05rem', maxWidth: 520, margin: '0 auto' }}>Most hotels track issues with paper, spreadsheets, or WhatsApp. Here is how that compares.</p>
          </div>
          <div style={{ background: 'white', borderRadius: 16, overflow: 'hidden', boxShadow: '0 4px 40px rgba(0,0,0,0.08)' }}>
            {/* Table header */}
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr', background: '#0D1B2A', padding: '16px 24px' }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase' as const, letterSpacing: '0.05em' }}>Feature</div>
              {['PulseStay', 'Paper / Verbal', 'Spreadsheet', 'WhatsApp'].map(col => (
                <div key={col} style={{ fontSize: 12, fontWeight: 700, color: col === 'PulseStay' ? '#C9A84C' : 'rgba(255,255,255,0.5)', textAlign: 'center' as const, textTransform: 'uppercase' as const, letterSpacing: '0.05em' }}>{col}</div>
              ))}
            </div>
            {COMPARISON.map((row, i) => (
              <div key={row.feature} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr', padding: '14px 24px', alignItems: 'center', background: i % 2 === 0 ? 'white' : '#FAFAF8', borderBottom: '1px solid #F0EDE8' }}>
                <div style={{ fontSize: 14, color: '#374151', fontWeight: 500 }}>{row.feature}</div>
                <div style={{ textAlign: 'center' as const }}><CheckCell value={row.pulsestay} /></div>
                <div style={{ textAlign: 'center' as const }}><CheckCell value={row.paper} /></div>
                <div style={{ textAlign: 'center' as const }}><CheckCell value={row.spreadsheet} /></div>
                <div style={{ textAlign: 'center' as const }}><CheckCell value={row.whatsapp} /></div>
              </div>
            ))}
            <div style={{ padding: '12px 24px', background: '#FAFAF8', borderTop: '1px solid #F0EDE8' }}>
              <span style={{ fontSize: 12, color: '#9CA3AF' }}>~ = partially supported with significant manual effort</span>
            </div>
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
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.8rem, 3vw, 2.6rem)', fontWeight: 400, letterSpacing: '-0.02em', color: 'white', marginBottom: 12 }}>Start Resolving Issues in Minutes</h2>
            <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '1.05rem' }}>No setup fees. No long-term contracts. 14-day free trial on all plans.</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24, maxWidth: 960, margin: '0 auto' }}>
            {[
              {
                name: 'Starter', price: '$149', period: 'per month / per property', featured: false,
                features: ['Up to 3 departments', 'Real-time issue logging', 'Live management dashboard', 'Severity triage', 'Up to 5 staff accounts'],
                cta: 'Get Started Free', ctaStyle: { border: '2px solid #C9A84C', color: '#C9A84C', background: 'transparent' },
              },
              {
                name: 'Pro', price: '$349', period: 'per month / per property', featured: true,
                features: ['Unlimited departments', 'AI pattern detection', 'Instant alert system', 'Issue assignment', 'Up to 25 staff accounts', 'Priority support'],
                cta: 'Start 14-Day Trial', ctaStyle: { background: '#0D1B2A', color: 'white', border: 'none' },
              },
              {
                name: 'Enterprise', price: 'Custom', period: 'multi-property / chain', featured: false,
                features: ['Unlimited properties', 'Cross-property benchmarking', 'Custom AI fine-tuning', 'PMS / POS integrations', 'Dedicated success manager', 'White-label option'],
                cta: 'Talk to Sales', ctaStyle: { border: '2px solid #C9A84C', color: '#C9A84C', background: 'transparent' },
              },
            ].map(plan => (
              <div key={plan.name} style={{ background: plan.featured ? '#C9A84C' : 'rgba(255,255,255,0.04)', border: `1px solid ${plan.featured ? '#C9A84C' : 'rgba(255,255,255,0.08)'}`, borderRadius: 12, padding: 36, transform: plan.featured ? 'scale(1.03)' : 'none', position: 'relative' as const }}>
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
                  <a href="mailto:hello@pulsestay.com" style={{ display: 'block', textAlign: 'center' as const, width: '100%', padding: '14px', borderRadius: 8, fontWeight: 700, fontSize: 14, textDecoration: 'none', boxSizing: 'border-box' as const, ...plan.ctaStyle }}>{plan.cta}</a>
                ) : (
                  <a href="/login" style={{ display: 'block', textAlign: 'center' as const, width: '100%', padding: '14px', borderRadius: 8, fontWeight: 700, fontSize: 14, textDecoration: 'none', boxSizing: 'border-box' as const, ...plan.ctaStyle }}>{plan.cta}</a>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section style={{ padding: '96px 0', background: '#F8F6F2' }}>
        <div style={{ maxWidth: 720, margin: '0 auto', padding: '0 24px' }}>
          <div style={{ textAlign: 'center' as const, marginBottom: 56 }}>
            <span style={{ display: 'inline-block', padding: '6px 16px', borderRadius: 999, fontSize: 12, fontWeight: 700, textTransform: 'uppercase' as const, letterSpacing: '0.05em', background: 'rgba(201,168,76,0.15)', color: '#9A7A2E', border: '1px solid rgba(201,168,76,0.3)', marginBottom: 16 }}>
              FAQ
            </span>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.8rem, 3vw, 2.6rem)', fontWeight: 400, letterSpacing: '-0.02em', marginBottom: 12 }}>Common Questions</h2>
            <p style={{ color: '#6B7280', fontSize: '1.05rem' }}>Everything you need to know before getting started.</p>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' as const, gap: 12 }}>
            {FAQS.map((faq, i) => (
              <details key={i} style={{ background: 'white', borderRadius: 12, boxShadow: '0 2px 12px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
                <summary style={{ padding: '20px 24px', fontWeight: 700, fontSize: 15, cursor: 'pointer', listStyle: 'none', display: 'flex', justifyContent: 'space-between', alignItems: 'center', userSelect: 'none' as const }}>
                  {faq.q}
                  <span style={{ fontSize: 20, color: '#C9A84C', flexShrink: 0, marginLeft: 16 }}>+</span>
                </summary>
                <div style={{ padding: '0 24px 20px', color: '#6B7280', fontSize: 15, lineHeight: 1.75 }}>
                  {faq.a}
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section style={{ padding: '96px 0', background: '#162436', textAlign: 'center' as const }}>
        <div style={{ maxWidth: 700, margin: '0 auto', padding: '0 24px' }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.8rem, 3vw, 2.6rem)', fontWeight: 400, letterSpacing: '-0.02em', color: 'white', marginBottom: 20 }}>
            Stop Letting Guest Issues{' '}
            <span style={{ color: '#C9A84C' }}>Turn Into Bad Reviews</span>
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: '1.05rem', marginBottom: 40 }}>
            Give your team the tools to capture every issue in real time — and give your managers the clarity to fix them before the guest checks out.
          </p>
          <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' as const }}>
            <a href="/login" style={{ padding: '16px 32px', background: '#C9A84C', color: '#0D1B2A', borderRadius: 8, fontWeight: 700, fontSize: 16, textDecoration: 'none' }}>
              Start Free Trial
            </a>
            <Link href="/dashboard" style={{ padding: '16px 32px', border: '2px solid rgba(255,255,255,0.25)', color: 'white', borderRadius: 8, fontWeight: 700, fontSize: 16, textDecoration: 'none' }}>
              Explore the Dashboard
            </Link>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer style={{ background: '#070E16', padding: '64px 0 32px' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: 48, marginBottom: 48 }}>

            {/* Brand */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontFamily: 'var(--font-display)', fontWeight: 400, fontSize: '1.2rem', color: 'white', letterSpacing: '-0.02em', marginBottom: 16 }}>
                <span style={{ width: 30, height: 30, background: '#C9A84C', borderRadius: 6, display: 'grid', placeItems: 'center' }}>
                  <Zap size={15} color="#0D1B2A" strokeWidth={2.5} />
                </span>
                PulseStay
              </div>
              <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.35)', lineHeight: 1.7, maxWidth: 280 }}>
                Real-time guest issue management for luxury hotels and resorts. Log it, track it, close it — before checkout.
              </p>
            </div>

            {/* Product */}
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase' as const, letterSpacing: '0.08em', color: 'rgba(255,255,255,0.3)', marginBottom: 16 }}>Product</div>
              <div style={{ display: 'flex', flexDirection: 'column' as const, gap: 10 }}>
                {[
                  { label: 'Dashboard Demo', href: '/dashboard' },
                  { label: 'Employee App',   href: '/capture' },
                  { label: 'Pricing',        href: '#pricing' },
                  { label: 'Sign In',        href: '/login' },
                ].map(l => (
                  <a key={l.label} href={l.href} style={{ fontSize: 14, color: 'rgba(255,255,255,0.45)', textDecoration: 'none' }}>{l.label}</a>
                ))}
              </div>
            </div>

            {/* Company */}
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase' as const, letterSpacing: '0.08em', color: 'rgba(255,255,255,0.3)', marginBottom: 16 }}>Company</div>
              <div style={{ display: 'flex', flexDirection: 'column' as const, gap: 10 }}>
                {[
                  { label: 'About',   href: '#' },
                  { label: 'Blog',    href: '#' },
                  { label: 'Careers', href: '#' },
                  { label: 'Contact', href: 'mailto:hello@pulsestay.com' },
                ].map(l => (
                  <a key={l.label} href={l.href} style={{ fontSize: 14, color: 'rgba(255,255,255,0.45)', textDecoration: 'none' }}>{l.label}</a>
                ))}
              </div>
            </div>

            {/* Legal */}
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase' as const, letterSpacing: '0.08em', color: 'rgba(255,255,255,0.3)', marginBottom: 16 }}>Legal</div>
              <div style={{ display: 'flex', flexDirection: 'column' as const, gap: 10 }}>
                {[
                  { label: 'Privacy Policy',    href: '#' },
                  { label: 'Terms of Service',  href: '#' },
                  { label: 'Security',          href: '#' },
                  { label: 'GDPR',              href: '#' },
                ].map(l => (
                  <a key={l.label} href={l.href} style={{ fontSize: 14, color: 'rgba(255,255,255,0.45)', textDecoration: 'none' }}>{l.label}</a>
                ))}
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 32, borderTop: '1px solid rgba(255,255,255,0.06)', flexWrap: 'wrap' as const, gap: 12 }}>
            <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.25)' }}>© 2026 PulseStay Inc. All rights reserved.</p>
            <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.25)' }}>Built for luxury hospitality · Powered by real-time data</p>
          </div>
        </div>
      </footer>

    </main>
  );
}
