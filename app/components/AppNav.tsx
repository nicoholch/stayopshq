'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ConciergeBell } from 'lucide-react';

const NAV_LINKS = [
  { label: 'Dashboard',            href: '/dashboard' },
  { label: 'Guest Opportunities',  href: '/complaints' },
  { label: 'Analytics',            href: '/analytics' },
  { label: 'Improvements',         href: '/improvements' },
  { label: 'Settings',             href: '/settings' },
];

export default function AppNav() {
  const path = usePathname();

  return (
    <nav style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
      height: 64,
      background: 'rgba(11,26,43,0.97)', backdropFilter: 'blur(12px)',
      borderBottom: '1px solid rgba(255,255,255,0.08)',
      display: 'flex', alignItems: 'center', padding: '0 24px',
      justifyContent: 'space-between', gap: 16,
    }}>

      {/* Logo */}
      <Link href="/dashboard" style={{
        display: 'flex', alignItems: 'center', gap: 9,
        fontWeight: 700, fontSize: '1rem', color: 'white',
        textDecoration: 'none', flexShrink: 0,
      }}>
        <span style={{ width: 32, height: 32, background: '#F5C451', borderRadius: 7, display: 'grid', placeItems: 'center' }}>
          <ConciergeBell size={16} color="#0B1A2B" strokeWidth={2.5} />
        </span>
        StayOps HQ
      </Link>

      {/* Nav links */}
      <div style={{ display: 'flex', gap: 4, alignItems: 'center', flex: 1, justifyContent: 'center' }}>
        {NAV_LINKS.map(link => {
          const active = path === link.href || (link.href !== '/dashboard' && path.startsWith(link.href));
          return (
            <Link
              key={link.href}
              href={link.href}
              style={{
                padding: '6px 14px', borderRadius: 7, fontSize: 13, fontWeight: 600,
                textDecoration: 'none', transition: 'all 0.15s',
                background: active ? 'rgba(245,196,81,0.15)' : 'transparent',
                color: active ? '#F5C451' : 'rgba(255,255,255,0.6)',
                border: active ? '1px solid rgba(245,196,81,0.25)' : '1px solid transparent',
              }}
            >
              {link.label}
            </Link>
          );
        })}
      </div>

      {/* CTA */}
      <Link href="/capture" style={{
        padding: '8px 16px', background: '#F5C451', color: '#0B1A2B',
        borderRadius: 7, fontWeight: 700, fontSize: 13,
        textDecoration: 'none', flexShrink: 0, whiteSpace: 'nowrap',
      }}>
        + Log Guest Opportunity
      </Link>
    </nav>
  );
}
