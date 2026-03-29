'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Menu, X } from 'lucide-react';

export default function NavMobile() {
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);

  return (
    <>
      <button
        onClick={() => setOpen(o => !o)}
        aria-label={open ? 'Close menu' : 'Open menu'}
        style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 8, color: 'white', display: 'flex', alignItems: 'center' }}
      >
        {open ? <X size={26} strokeWidth={2} /> : <Menu size={26} strokeWidth={2} />}
      </button>

      {open && (
        <div style={{
          position: 'fixed', top: 72, left: 0, right: 0, bottom: 0, zIndex: 99,
          background: 'rgba(11,26,43,0.99)', backdropFilter: 'blur(16px)',
          display: 'flex', flexDirection: 'column', padding: '24px 24px 40px',
          overflowY: 'auto',
        }}>
          {/* Nav links */}
          {[
            { label: 'How It Works', href: '#how-it-works' },
            { label: 'Features',     href: '#features' },
            { label: 'Pricing',      href: '#pricing' },
          ].map(link => (
            <a
              key={link.label}
              href={link.href}
              onClick={close}
              style={{
                fontSize: 20, fontWeight: 600, color: 'white',
                padding: '18px 0', borderBottom: '1px solid rgba(255,255,255,0.08)',
                textDecoration: 'none',
              }}
            >
              {link.label}
            </a>
          ))}

          {/* CTAs */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 32 }}>
            <Link
              href="/dashboard"
              onClick={close}
              style={{
                padding: '16px', textAlign: 'center',
                border: '2px solid rgba(255,255,255,0.25)',
                color: 'white', borderRadius: 8, fontWeight: 600,
                fontSize: 15, textDecoration: 'none',
              }}
            >
              Dashboard Demo
            </Link>
            <a
              href="/login"
              onClick={close}
              style={{
                padding: '16px', textAlign: 'center',
                background: '#F5C451', color: '#0B1A2B',
                borderRadius: 8, fontWeight: 700,
                fontSize: 15, textDecoration: 'none',
              }}
            >
              Get Started
            </a>
          </div>
        </div>
      )}
    </>
  );
}
