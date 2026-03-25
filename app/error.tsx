'use client';

import Link from 'next/link';
import { Zap } from 'lucide-react';

export default function Error({ reset }: { reset: () => void }) {
  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #0B1A2B 0%, #162436 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, textAlign: 'center' }}>
      <div style={{ maxWidth: 480 }}>
        <Link href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 10, fontWeight: 800, fontSize: '1.3rem', color: 'white', textDecoration: 'none', marginBottom: 48 }}>
          <span style={{ width: 36, height: 36, background: '#F5C451', borderRadius: 8, display: 'grid', placeItems: 'center' }}>
            <Zap size={18} color="#0B1A2B" strokeWidth={2.5} />
          </span>
          StayOps HQ
        </Link>
        <div style={{ fontSize: '5rem', fontWeight: 800, color: '#F5C451', lineHeight: 1, marginBottom: 16 }}>Oops</div>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'white', marginBottom: 12 }}>Something went wrong</h1>
        <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: 15, lineHeight: 1.7, marginBottom: 40 }}>
          An unexpected error occurred. Try refreshing the page or head back to the dashboard.
        </p>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
          <button
            onClick={reset}
            style={{ padding: '14px 32px', background: '#F5C451', color: '#0B1A2B', border: 'none', borderRadius: 8, fontWeight: 700, fontSize: 15, cursor: 'pointer', fontFamily: 'inherit' }}
          >
            Try Again
          </button>
          <Link href="/dashboard" style={{ display: 'inline-block', padding: '14px 32px', border: '2px solid rgba(255,255,255,0.2)', color: 'white', borderRadius: 8, fontWeight: 700, fontSize: 15, textDecoration: 'none' }}>
            Go to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
