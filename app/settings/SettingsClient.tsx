'use client';

import { useState } from 'react';
import type { Hotel } from '@/types';
import AppNav from '@/app/components/AppNav';
import { ConciergeBell, Mail, Trash2, Crown, User } from 'lucide-react';

interface TeamMember {
  id: string;
  full_name: string;
  role: string;
  email: string | null;
  created_at: string;
}

const MANAGER_LIMITS: Record<string, number | null> = {
  free: 1,
  starter: 3,
  pro: null,
  enterprise: null,
};

interface Props {
  currentUserId: string;
  hotel: Hotel;
  team: TeamMember[];
}

export default function SettingsClient({ currentUserId, hotel, team: initialTeam }: Props) {
  const plan = hotel.plan ?? 'free';
  const managerLimit = MANAGER_LIMITS[plan] ?? null;
  const managerCount = initialTeam.filter(m => m.role === 'manager').length;
  const [team, setTeam]       = useState<TeamMember[]>(initialTeam);
  const [email, setEmail]     = useState('');
  const [sending, setSending] = useState(false);
  const [sent, setSent]       = useState(false);
  const [inviteErr, setInviteErr] = useState('');
  const [inviteUpgrade, setInviteUpgrade] = useState(false);
  const [removing, setRemoving]   = useState<string | null>(null);

  const captureUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/capture/${hotel.slug}`
    : `https://stayopshq.com/capture/${hotel.slug}`;

  const [copied, setCopied] = useState(false);
  function copyLink() {
    navigator.clipboard.writeText(captureUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  async function sendInvite(e: React.FormEvent) {
    e.preventDefault();
    setSending(true);
    setInviteErr('');
    setInviteUpgrade(false);
    setSent(false);
    try {
      const res = await fetch('/api/invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const body = await res.json();
      if (!res.ok) {
        if (body.upgrade) setInviteUpgrade(true);
        throw new Error(body.error ?? 'Failed to send invite');
      }
      setSent(true);
      setEmail('');
    } catch (err: unknown) {
      setInviteErr(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setSending(false);
    }
  }

  async function removeMember(id: string) {
    setRemoving(id);
    try {
      await fetch(`/api/team?id=${id}`, { method: 'DELETE' });
      setTeam(prev => prev.filter(m => m.id !== id));
    } finally {
      setRemoving(null);
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--off-white)', paddingTop: 72 }}>
      <AppNav />

      <div style={{ maxWidth: 800, margin: '0 auto', padding: '40px 24px 64px' }}>

        <h1 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: 4 }}>Settings</h1>
        <p style={{ fontSize: 14, color: 'var(--text-muted)', marginBottom: 36 }}>
          {hotel.name} — manage your team and staff access
        </p>

        {/* ── Staff capture link ── */}
        <div style={{ background: 'white', borderRadius: 16, padding: 28, boxShadow: 'var(--shadow)', marginBottom: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
            <ConciergeBell size={18} color="var(--gold-dark)" strokeWidth={2} />
            <h2 style={{ fontSize: '1rem', fontWeight: 700 }}>Staff Capture Link</h2>
          </div>
          <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 16 }}>
            Share this link with front-line staff so they can log guest opportunities instantly — no login required.
          </p>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center', background: 'var(--off-white)', borderRadius: 8, padding: '10px 14px' }}>
            <span style={{ fontSize: 13, fontFamily: 'monospace', color: 'var(--text-muted)', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {captureUrl}
            </span>
            <button onClick={copyLink} style={{ padding: '6px 16px', background: copied ? 'var(--success)' : 'var(--gold)', color: copied ? 'white' : 'var(--navy)', border: 'none', borderRadius: 6, fontWeight: 700, fontSize: 12, cursor: 'pointer', fontFamily: 'inherit', flexShrink: 0, transition: 'all 0.2s' }}>
              {copied ? 'Copied!' : 'Copy'}
            </button>
          </div>
        </div>

        {/* ── Invite a manager ── */}
        <div style={{ background: 'white', borderRadius: 16, padding: 28, boxShadow: 'var(--shadow)', marginBottom: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
            <Mail size={18} color="var(--gold-dark)" strokeWidth={2} />
            <h2 style={{ fontSize: '1rem', fontWeight: 700 }}>Invite a Manager</h2>
          </div>
          <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 16 }}>
            Managers get full dashboard access — they can view all guest opportunities, analytics, and improvements.
          </p>

          {managerLimit !== null && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16, padding: '8px 12px', background: managerCount >= managerLimit ? 'rgba(239,68,68,0.06)' : 'rgba(245,196,81,0.1)', border: `1px solid ${managerCount >= managerLimit ? 'rgba(239,68,68,0.2)' : 'rgba(245,196,81,0.3)'}`, borderRadius: 8 }}>
              <span style={{ fontSize: 13, color: managerCount >= managerLimit ? 'var(--danger)' : 'var(--text-muted)', fontWeight: 600 }}>
                {managerCount} / {managerLimit} managers on {plan.charAt(0).toUpperCase() + plan.slice(1)} plan
              </span>
              {managerCount >= managerLimit && (
                <a href="/api/checkout" onClick={e => { e.preventDefault(); fetch('/api/checkout', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ plan: plan === 'free' ? 'starter' : 'pro' }) }).then(r => r.json()).then(d => { if (d.url) window.location.href = d.url; }); }} style={{ marginLeft: 'auto', fontSize: 12, fontWeight: 700, color: 'var(--navy)', background: 'var(--gold)', padding: '4px 12px', borderRadius: 6, textDecoration: 'none', cursor: 'pointer' }}>
                  Upgrade to {plan === 'free' ? 'Starter' : 'Pro'} →
                </a>
              )}
            </div>
          )}

          <form onSubmit={sendInvite} style={{ display: 'flex', gap: 10 }}>
            <input
              type="email"
              required
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="colleague@yourhotel.com"
              style={{ flex: 1, padding: '10px 14px', border: '1.5px solid var(--border)', borderRadius: 8, fontSize: 14, fontFamily: 'inherit' }}
            />
            <button type="submit" disabled={sending} style={{ padding: '10px 24px', background: 'var(--navy)', color: 'white', border: 'none', borderRadius: 8, fontWeight: 700, fontSize: 14, cursor: sending ? 'not-allowed' : 'pointer', fontFamily: 'inherit', opacity: sending ? 0.7 : 1, flexShrink: 0 }}>
              {sending ? 'Sending…' : 'Send Invite'}
            </button>
          </form>

          {sent && (
            <div style={{ marginTop: 12, padding: '10px 14px', background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)', borderRadius: 8, fontSize: 13, color: 'var(--success)', fontWeight: 600 }}>
              Invite sent! They'll receive an email with a link to join {hotel.name}.
            </div>
          )}
          {inviteErr && (
            <div style={{ marginTop: 12, padding: '10px 14px', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)', borderRadius: 8, fontSize: 13, color: 'var(--danger)', display: 'flex', alignItems: 'center', gap: 12 }}>
              <span style={{ flex: 1 }}>{inviteErr}</span>
              {inviteUpgrade && (
                <a href="/api/checkout" onClick={e => { e.preventDefault(); fetch('/api/checkout', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ plan: plan === 'free' ? 'starter' : 'pro' }) }).then(r => r.json()).then(d => { if (d.url) window.location.href = d.url; }); }} style={{ flexShrink: 0, fontSize: 12, fontWeight: 700, color: 'var(--navy)', background: 'var(--gold)', padding: '5px 14px', borderRadius: 6, textDecoration: 'none', cursor: 'pointer' }}>
                  Upgrade →
                </a>
              )}
            </div>
          )}
        </div>

        {/* ── Team members ── */}
        <div style={{ background: 'white', borderRadius: 16, padding: 28, boxShadow: 'var(--shadow)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
            <User size={18} color="var(--gold-dark)" strokeWidth={2} />
            <h2 style={{ fontSize: '1rem', fontWeight: 700 }}>Team Members</h2>
            <span style={{ marginLeft: 'auto', fontSize: 12, color: 'var(--text-muted)', fontWeight: 600 }}>
              {managerLimit !== null ? `${managerCount} / ${managerLimit} managers` : `${team.length} member${team.length !== 1 ? 's' : ''}`}
            </span>
          </div>

          {team.length === 0 ? (
            <p style={{ fontSize: 14, color: 'var(--text-muted)' }}>No team members yet.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              {team.map(member => (
                <div key={member.id} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 0', borderBottom: '1px solid var(--border)' }}>
                  {/* Avatar */}
                  <div style={{ width: 38, height: 38, borderRadius: '50%', background: member.role === 'manager' ? 'rgba(245,196,81,0.15)' : 'rgba(107,114,128,0.1)', display: 'grid', placeItems: 'center', flexShrink: 0 }}>
                    {member.role === 'manager'
                      ? <Crown size={16} color="var(--gold-dark)" strokeWidth={2} />
                      : <User size={16} color="var(--text-muted)" strokeWidth={2} />
                    }
                  </div>

                  {/* Info */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)' }}>
                        {member.full_name}
                        {member.id === currentUserId && (
                          <span style={{ marginLeft: 6, fontSize: 11, color: 'var(--text-muted)', fontWeight: 400 }}>(you)</span>
                        )}
                      </span>
                      <span style={{ fontSize: 11, fontWeight: 700, padding: '2px 7px', borderRadius: 4, textTransform: 'capitalize', background: member.role === 'manager' ? 'rgba(245,196,81,0.15)' : 'rgba(107,114,128,0.08)', color: member.role === 'manager' ? 'var(--gold-dark)' : 'var(--text-muted)' }}>
                        {member.role}
                      </span>
                    </div>
                    {member.email && (
                      <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>{member.email}</div>
                    )}
                  </div>

                  {/* Remove */}
                  {member.id !== currentUserId && (
                    <button
                      onClick={() => removeMember(member.id)}
                      disabled={removing === member.id}
                      title="Remove member"
                      style={{ padding: '6px', background: 'none', border: '1.5px solid var(--border)', borderRadius: 6, cursor: removing === member.id ? 'not-allowed' : 'pointer', color: 'var(--danger)', opacity: removing === member.id ? 0.5 : 1, display: 'flex', alignItems: 'center' }}
                    >
                      <Trash2 size={14} strokeWidth={2} />
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
