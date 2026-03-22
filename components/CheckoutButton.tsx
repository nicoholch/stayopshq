'use client';

import React from 'react';

export default function CheckoutButton({
  plan,
  label,
  style,
}: {
  plan: 'starter' | 'pro';
  label: string;
  style: React.CSSProperties;
}) {
  async function handleClick() {
    const res = await fetch('/api/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ plan }),
    });
    const data = await res.json();
    if (data.url) window.location.href = data.url;
    else if (data.error === 'Not authenticated') window.location.href = '/login';
  }

  return (
    <button onClick={handleClick} style={style}>
      {label}
    </button>
  );
}
