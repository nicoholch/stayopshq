import type { Metadata } from 'next';
import Link from 'next/link';
import { ConciergeBell } from 'lucide-react';

export const metadata: Metadata = {
  title: 'About',
  description: 'StayOps HQ was built from firsthand experience inside a luxury hotel. Learn why guest issue management needs to happen in real time — during the stay, not after.',
  alternates: { canonical: 'https://stayopshq.com/about' },
};

export default function AboutPage() {
  return (
    <div style={{ minHeight: '100vh', background: '#0B1A2B', color: 'white', fontFamily: 'var(--font-sans)' }}>

      {/* Nav */}
      <nav style={{ borderBottom: '1px solid rgba(255,255,255,0.08)', padding: '0 24px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', height: 64, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Link href="/" style={{ fontWeight: 800, fontSize: '1.1rem', color: 'white', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ width: 34, height: 34, background: '#F5C451', borderRadius: 8, display: 'grid', placeItems: 'center' }}>
              <ConciergeBell size={16} color="#0B1A2B" strokeWidth={2.5} />
            </span>
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
          About StayOps HQ
        </div>
        <h1 style={{ fontSize: 'clamp(2rem, 5vw, 3rem)', fontWeight: 800, lineHeight: 1.15, margin: '0 0 24px', fontFamily: 'var(--font-serif)' }}>
          Built from real operational experience
        </h1>
        <p style={{ fontSize: 18, color: 'rgba(255,255,255,0.6)', lineHeight: 1.8, margin: 0 }}>
          StayOps HQ was created from firsthand experience inside a luxury hotel environment — not from theory, but from working inside real operations.
        </p>
      </section>

      {/* Founder */}
      <section style={{ maxWidth: 760, margin: '0 auto', padding: '0 24px 80px' }}>
        <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 16, padding: '40px 48px' }}>
          <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.65)', lineHeight: 1.9, margin: 0 }}>
            My name is Nicolas, and I am a hospitality student currently completing a six-month internship at a five-star resort in the Florida Keys. Working across departments, I was able to observe how guest experience is managed on a daily basis — and identify where the gaps consistently appear.
          </p>
        </div>
      </section>

      {/* The Problem */}
      <section style={{ maxWidth: 760, margin: '0 auto', padding: '0 24px 80px' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: 20, fontFamily: 'var(--font-serif)' }}>The Problem</h2>
        <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.6)', lineHeight: 1.8, marginBottom: 28 }}>
          One consistent issue stood out: guest complaints are not always captured or resolved within the time they matter most — during the stay.
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {[
            'Issues are communicated verbally and never logged',
            'Information is lost between departments',
            'Resolution happens too late — sometimes after checkout',
            'Smaller issues go unnoticed entirely',
          ].map(item => (
            <div key={item} style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
              <span style={{ width: 8, height: 8, background: '#F5C451', borderRadius: '50%', flexShrink: 0, marginTop: 7 }} />
              <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.6)', lineHeight: 1.7, margin: 0 }}>{item}</p>
            </div>
          ))}
        </div>
        <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.45)', lineHeight: 1.8, marginTop: 28, fontStyle: 'italic' }}>
          This leads to missed opportunities to improve the guest experience — and prevent negative reviews.
        </p>
      </section>

      {/* Why it was built */}
      <section style={{ maxWidth: 1100, margin: '0 auto', padding: '0 24px 80px' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 700, textAlign: 'center', marginBottom: 12, fontFamily: 'var(--font-serif)' }}>Why StayOps HQ Was Built</h2>
        <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.5)', textAlign: 'center', marginBottom: 48 }}>
          To make guest issue management immediate, structured, and visible across all departments.
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 24 }}>
          {[
            { title: 'Immediate', body: 'Every issue is logged the moment it surfaces — not at the end of a shift, not the next morning.' },
            { title: 'Structured', body: 'Department, category, severity, and resolution are all captured in a single 30-second form.' },
            { title: 'Visible', body: 'Management sees everything in real time. No more relying on verbal handoffs or end-of-day reports.' },
          ].map(v => (
            <div key={v.title} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, padding: 32 }}>
              <div style={{ width: 10, height: 10, background: '#F5C451', borderRadius: '50%', marginBottom: 16 }} />
              <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: 10 }}>{v.title}</h3>
              <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.5)', lineHeight: 1.8, margin: 0 }}>{v.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* What it does + Who it's for */}
      <section style={{ maxWidth: 760, margin: '0 auto', padding: '0 24px 80px' }}>
        <div style={{ display: 'grid', gap: 24 }}>

          {/* What */}
          <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 16, padding: '36px 40px' }}>
            <h2 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: 20, fontFamily: 'var(--font-serif)' }}>What the platform does</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {[
                'A fast, simple way for staff to log guest issues in real time',
                'A centralized dashboard for management to monitor all activity',
                'Clear tracking of each issue from log to resolution',
                'Data that highlights recurring problems and operational gaps',
              ].map(item => (
                <div key={item} style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                  <span style={{ width: 7, height: 7, background: '#F5C451', borderRadius: '50%', flexShrink: 0, marginTop: 7 }} />
                  <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.6)', lineHeight: 1.7, margin: 0 }}>{item}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Who */}
          <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 16, padding: '36px 40px' }}>
            <h2 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: 20, fontFamily: 'var(--font-serif)' }}>Who this is for</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {[
                'Boutique and luxury hotels',
                'Properties that prioritize guest experience and reputation',
                'Teams looking for better coordination across departments',
                'Managers who want real-time visibility into operations',
              ].map(item => (
                <div key={item} style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                  <span style={{ width: 7, height: 7, background: '#F5C451', borderRadius: '50%', flexShrink: 0, marginTop: 7 }} />
                  <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.6)', lineHeight: 1.7, margin: 0 }}>{item}</p>
                </div>
              ))}
            </div>
          </div>

          {/* What to expect */}
          <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 16, padding: '36px 40px' }}>
            <h2 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: 12, fontFamily: 'var(--font-serif)' }}>What to expect</h2>
            <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.45)', marginBottom: 20, lineHeight: 1.7 }}>
              A focused operational tool — not a complex system.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {[
                'Fits into existing workflows',
                'Requires minimal training',
                'Delivers immediate visibility and long-term insights',
              ].map(item => (
                <div key={item} style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                  <span style={{ width: 7, height: 7, background: '#F5C451', borderRadius: '50%', flexShrink: 0, marginTop: 7 }} />
                  <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.6)', lineHeight: 1.7, margin: 0 }}>{item}</p>
                </div>
              ))}
            </div>
          </div>

        </div>
      </section>

      {/* Why it matters */}
      <section style={{ maxWidth: 760, margin: '0 auto', padding: '0 24px 96px', textAlign: 'center' }}>
        <p style={{ fontSize: 20, color: 'rgba(255,255,255,0.7)', lineHeight: 1.8, margin: '0 0 16px', fontStyle: 'italic', fontFamily: 'var(--font-serif)' }}>
          "The most valuable opportunity to improve a guest experience is while the guest is still on property."
        </p>
        <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.4)', margin: 0 }}>
          StayOps HQ exists to make sure that opportunity is not missed.
        </p>
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
