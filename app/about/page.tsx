import type { Metadata } from 'next';
import Link from 'next/link';
import { ConciergeBell } from 'lucide-react';

export const metadata: Metadata = {
  title: 'About',
  description: 'Learn about StayOps HQ and our mission to help luxury hotels resolve guest issues in real time.',
  alternates: { canonical: 'https://stayopshq.com/about' },
};

export default function AboutPage() {
  return (
    <div style={{ minHeight: '100vh', background: '#0B1A2B', color: 'white', fontFamily: 'var(--font-sans)' }}>

      {/* Nav */}
      <nav style={{ borderBottom: '1px solid rgba(255,255,255,0.08)', padding: '0 24px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', height: 64, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Link href="/" style={{ fontWeight: 800, fontSize: '1.1rem', color: 'white', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ width: 34, height: 34, background: '#F5C451', borderRadius: 8, display: 'grid', placeItems: 'center' }}><ConciergeBell size={16} color="#0B1A2B" strokeWidth={2.5} /></span>
            StayOps HQ
          </Link>
          <Link href="/login" style={{ padding: '9px 18px', background: '#F5C451', color: '#0B1A2B', borderRadius: 8, fontSize: 13, fontWeight: 700, textDecoration: 'none' }}>
            Get Started
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section style={{ maxWidth: 760, margin: '0 auto', padding: '96px 24px 64px', textAlign: 'center' }}>
        <div style={{ display: 'inline-block', background: 'rgba(201,168,76,0.12)', border: '1px solid rgba(201,168,76,0.25)', borderRadius: 20, padding: '6px 16px', fontSize: 13, color: '#F5C451', fontWeight: 600, marginBottom: 28 }}>
          About Us
        </div>
        <h1 style={{ fontSize: 'clamp(2rem, 5vw, 3rem)', fontWeight: 800, lineHeight: 1.15, margin: '0 0 24px', fontFamily: 'var(--font-serif)' }}>
          Our Mission
        </h1>
        <p style={{ fontSize: 18, color: 'rgba(255,255,255,0.6)', lineHeight: 1.8, margin: 0 }}>
          {/* Replace with your mission statement */}
          We help luxury hotels capture and resolve guest issues in real time — before they become negative reviews.
        </p>
      </section>

      {/* Story */}
      <section style={{ maxWidth: 760, margin: '0 auto', padding: '0 24px 80px' }}>
        <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 16, padding: '48px' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: 20, fontFamily: 'var(--font-serif)' }}>Our Story</h2>
          <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.55)', lineHeight: 1.9, margin: '0 0 20px' }}>
            {/* Replace with your story */}
            Coming soon.
          </p>
        </div>
      </section>

      {/* Values */}
      <section style={{ maxWidth: 1100, margin: '0 auto', padding: '0 24px 96px' }}>
        <h2 style={{ fontSize: '1.6rem', fontWeight: 700, textAlign: 'center', marginBottom: 48, fontFamily: 'var(--font-serif)' }}>What We Believe</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 24 }}>
          {[
            { title: 'Speed matters', body: 'A complaint resolved in 10 minutes leaves a very different impression than one resolved the next day.' },
            { title: 'Data beats guesswork', body: 'Patterns in complaints reveal systemic issues. We surface those patterns so you can fix root causes.' },
            { title: 'Staff deserve better tools', body: 'Logging issues should take 30 seconds, not 5 minutes. We built the capture form around that constraint.' },
          ].map(v => (
            <div key={v.title} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, padding: 32 }}>
              <div style={{ width: 10, height: 10, background: '#F5C451', borderRadius: '50%', marginBottom: 16 }} />
              <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: 10 }}>{v.title}</h3>
              <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.5)', lineHeight: 1.8, margin: 0 }}>{v.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section style={{ borderTop: '1px solid rgba(255,255,255,0.08)', padding: '64px 24px', textAlign: 'center' }}>
        <h2 style={{ fontSize: '1.6rem', fontWeight: 700, marginBottom: 16, fontFamily: 'var(--font-serif)' }}>Ready to get started?</h2>
        <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.5)', marginBottom: 32 }}>Start your 14-day free trial. No credit card required.</p>
        <Link href="/login" style={{ padding: '14px 32px', background: '#F5C451', color: '#0B1A2B', borderRadius: 8, fontWeight: 700, fontSize: 15, textDecoration: 'none' }}>
          Start Free Trial
        </Link>
      </section>

    </div>
  );
}
