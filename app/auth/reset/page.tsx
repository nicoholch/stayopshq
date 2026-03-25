'use client';

export const dynamic = 'force-dynamic';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Zap } from 'lucide-react';

export default function ResetPage() {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    // createClient only called in browser, never during SSR/prerender
    const supabase = createClient();
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') setReady(true);
    });
    return () => subscription.unsubscribe();
  }, []);

  async function handleReset(e: React.FormEvent) {
    e.preventDefault();
    if (password !== confirm) { setError('Passwords do not match'); return; }
    if (password.length < 6) { setError('Password must be at least 6 characters'); return; }
    setLoading(true);
    setError('');
    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({ password });
    if (error) { setError(error.message); setLoading(false); return; }
    router.push('/dashboard');
  }

  const inputStyle = {
    width: '100%', padding: '12px 14px',
    background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)',
    borderRadius: 8, color: 'white', fontSize: 14, fontFamily: 'inherit', outline: 'none',
    boxSizing: 'border-box' as const,
  };

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #0B1A2B 0%, #162436 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div style={{ width: '100%', maxWidth: 420 }}>

        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <Link href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 10, fontWeight: 800, fontSize: '1.4rem', color: 'white', textDecoration: 'none' }}>
            <span style={{ width: 40, height: 40, background: '#F5C451', borderRadius: 10, display: 'grid', placeItems: 'center' }}>
              <Zap size={20} color="#0B1A2B" strokeWidth={2.5} />
            </span>
            StayOps HQ
          </Link>
          <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 14, marginTop: 12 }}>
            Set a new password
          </p>
        </div>

        <div style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 16, padding: 40 }}>
          {!ready ? (
            <p style={{ color: 'rgba(255,255,255,0.5)', textAlign: 'center', fontSize: 14 }}>
              Verifying reset link…
            </p>
          ) : (
            <form onSubmit={handleReset} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {error && (
                <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 8, padding: '12px 16px', color: '#EF4444', fontSize: 13 }}>
                  {error}
                </div>
              )}
              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'rgba(255,255,255,0.7)', marginBottom: 6 }}>New Password</label>
                <input type="password" required value={password} onChange={e => setPassword(e.target.value)} placeholder="Min. 6 characters" style={inputStyle} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'rgba(255,255,255,0.7)', marginBottom: 6 }}>Confirm Password</label>
                <input type="password" required value={confirm} onChange={e => setConfirm(e.target.value)} placeholder="Repeat your new password" style={inputStyle} />
              </div>
              <button
                type="submit" disabled={loading}
                style={{ marginTop: 8, padding: '14px', background: '#F5C451', color: '#0B1A2B', border: 'none', borderRadius: 8, fontWeight: 700, fontSize: 15, cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1, fontFamily: 'inherit' }}
              >
                {loading ? 'Updating…' : 'Set New Password'}
              </button>
            </form>
          )}
        </div>

        <p style={{ textAlign: 'center', fontSize: 13, color: 'rgba(255,255,255,0.3)', marginTop: 24 }}>
          <Link href="/login" style={{ color: 'rgba(255,255,255,0.4)' }}>← Back to sign in</Link>
        </p>
      </div>
    </div>
  );
}
