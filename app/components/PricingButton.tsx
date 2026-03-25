'use client';

import { useState, CSSProperties } from 'react';

interface Props {
  plan: 'starter' | 'pro';
  cta: string;
  ctaStyle: CSSProperties;
}

export default function PricingButton({ plan, cta, ctaStyle }: Props) {
  const [loading, setLoading] = useState(false);

  async function handleClick() {
    setLoading(true);
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan }),
      });

      if (res.status === 401) {
        window.location.href = '/login';
        return;
      }

      const { url } = await res.json();
      if (url) window.location.href = url;
    } catch {
      window.location.href = '/login';
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      style={{
        display: 'block',
        textAlign: 'center',
        width: '100%',
        padding: '14px',
        borderRadius: 8,
        fontWeight: 700,
        fontSize: 14,
        cursor: loading ? 'not-allowed' : 'pointer',
        opacity: loading ? 0.7 : 1,
        boxSizing: 'border-box',
        fontFamily: 'inherit',
        ...ctaStyle,
      }}
    >
      {loading ? 'Loading…' : cta}
    </button>
  );
}
