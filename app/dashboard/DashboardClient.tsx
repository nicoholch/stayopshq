'use client';

/**
 * Client component that owns the real-time complaint management dashboard.
 * Receives initial server-fetched data as props, then subscribes
 * to Supabase Realtime for live updates without full page refreshes.
 */

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { Complaint, Guest, Hotel, DepartmentComplaintCount, ComplaintSeverity, ComplaintStatus } from '@/types';
import { AlertTriangle, AlertCircle, Info, Check, Mail, Sparkles } from 'lucide-react';

interface Props {
  hotel: Hotel;
  profile: { full_name: string; role: string };
  initialComplaints: Complaint[];
  initialGuests: Guest[];
  deptCounts: DepartmentComplaintCount[];
  openCount: number;
  criticalCount: number;
  resolvedTodayCount: number;
  justSubscribed: boolean;
  isDemo: boolean;
}

const SEVERITY_STYLE: Record<ComplaintSeverity, { color: string; bg: string; label: string }> = {
  low:      { color: '#6B7280', bg: 'rgba(107,114,128,0.1)', label: 'Low' },
  medium:   { color: '#D97706', bg: 'rgba(217,119,6,0.1)',   label: 'Medium' },
  high:     { color: '#DC2626', bg: 'rgba(220,38,38,0.1)',   label: 'High' },
  critical: { color: '#7C3AED', bg: 'rgba(124,58,237,0.1)', label: 'Critical' },
};

const STATUS_STYLE: Record<ComplaintStatus, { color: string; label: string }> = {
  open:        { color: 'var(--danger)',  label: 'Open' },
  in_progress: { color: 'var(--warning)', label: 'In Progress' },
  resolved:    { color: 'var(--success)', label: 'Resolved' },
};

const STATUS_BORDER: Record<ComplaintStatus, string> = {
  open:        'var(--danger)',
  in_progress: '#F59E0B',
  resolved:    'var(--success)',
};

const SAT_LABELS: Record<number, string> = { 1: 'Unsatisfied', 2: 'Dissatisfied', 3: 'Neutral', 4: 'Satisfied', 5: 'Very Satisfied' };

function StaffCaptureLink({ slug }: { slug: string }) {
  const [copied, setCopied] = useState(false);
  const url = typeof window !== 'undefined' ? `${window.location.origin}/capture/${slug}` : `/capture/${slug}`;

  function copy() {
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  return (
    <div style={{ background: 'rgba(201,168,76,0.08)', border: '1px solid rgba(201,168,76,0.2)', borderRadius: 10, padding: '12px 18px', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
      <span style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--gold-dark)', flexShrink: 0 }}>Staff Capture Link</span>
      <span style={{ fontSize: 13, color: 'var(--text-muted)', fontFamily: 'monospace', flexGrow: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{url}</span>
      <button onClick={copy} style={{ padding: '6px 14px', background: copied ? 'var(--success)' : 'var(--gold)', color: copied ? 'white' : 'var(--navy)', border: 'none', borderRadius: 6, fontWeight: 700, fontSize: 12, cursor: 'pointer', flexShrink: 0, fontFamily: 'inherit', transition: 'all 0.2s' }}>
        {copied ? 'Copied!' : 'Copy'}
      </button>
    </div>
  );
}

export default function DashboardClient({
  hotel, profile, initialComplaints, initialGuests, deptCounts,
  openCount, criticalCount, resolvedTodayCount, justSubscribed, isDemo,
}: Props) {
  const [complaints, setComplaints] = useState<Complaint[]>(initialComplaints);
  const [open, setOpen]             = useState(openCount);
  const [resolved, setResolved]     = useState(resolvedTodayCount);
  const [showBanner, setShowBanner] = useState(justSubscribed);

  // ── Guest state ───────────────────────────────────────────────────
  const [guests, setGuests]         = useState<Guest[]>(initialGuests);
  const [showAddGuest, setShowAddGuest] = useState(false);
  const [guestForm, setGuestForm]   = useState({ name: '', email: '', room_number: '', check_in: '', check_out: '' });
  const [addingGuest, setAddingGuest] = useState(false);
  const [emailingId, setEmailingId] = useState<string | null>(null);
  const [emailSentIds, setEmailSentIds] = useState<Set<string>>(
    new Set(initialGuests.filter(g => g.followup_sent).map(g => g.id))
  );

  async function addGuest() {
    if (!guestForm.name || !guestForm.email || !guestForm.room_number || !guestForm.check_in || !guestForm.check_out) return;
    setAddingGuest(true);

    if (!isDemo) {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase.from('profiles').select('hotel_id').eq('id', user.id).single();
        if (profile) {
          const { data: newGuest } = await supabase.from('guests').insert({
            hotel_id: profile.hotel_id, ...guestForm, followup_sent: false,
          }).select().single();
          if (newGuest) setGuests(prev => [newGuest as Guest, ...prev]);
        }
      }
    } else {
      // Demo mode: add locally
      const fakeGuest: Guest = {
        id: Math.random().toString(36).slice(2), hotel_id: hotel.id,
        ...guestForm, followup_sent: false, created_at: new Date().toISOString(),
      };
      setGuests(prev => [fakeGuest, ...prev]);
    }

    setGuestForm({ name: '', email: '', room_number: '', check_in: '', check_out: '' });
    setShowAddGuest(false);
    setAddingGuest(false);
  }

  async function sendFollowUp(guest: Guest) {
    setEmailingId(guest.id);
    if (!isDemo) {
      await fetch('/api/send-followup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ guest_id: guest.id }),
      });
    }
    setEmailSentIds(prev => new Set(prev).add(guest.id));
    setEmailingId(null);
  }

  // ── Resolve form state ────────────────────────────────────────────
  const [resolvingId, setResolvingId]   = useState<string | null>(null);
  const [resolution, setResolution]     = useState('');
  const [compensation, setCompensation] = useState('');
  const [satisfaction, setSatisfaction] = useState<number | null>(null);
  const [submitting, setSubmitting]     = useState(false);

  function openResolveForm(id: string) {
    setResolvingId(id);
    setResolution(''); setCompensation(''); setSatisfaction(null);
  }
  function cancelResolve() { setResolvingId(null); }

  async function submitResolve(complaint: Complaint) {
    if (!resolution.trim() || satisfaction === null) return;
    setSubmitting(true);

    const update = {
      status: 'resolved' as ComplaintStatus,
      resolution: resolution.trim(),
      compensation: compensation.trim() || null,
      guest_satisfaction: satisfaction,
      resolved_at: new Date().toISOString(),
    };

    if (!isDemo) {
      const supabase = createClient();
      await supabase.from('complaints').update(update).eq('id', complaint.id);
    }

    setComplaints(prev => prev.map(c => c.id === complaint.id ? { ...c, ...update } : c));
    setOpen(n => Math.max(0, n - 1));
    setResolved(n => n + 1);
    setResolvingId(null);
    setSubmitting(false);
  }

  // ── Supabase Realtime subscription ────────────────────────────────
  useEffect(() => {
    if (isDemo) return;
    const supabase = createClient();

    const channel = supabase
      .channel(`complaints:${hotel.id}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'complaints', filter: `hotel_id=eq.${hotel.id}` },
        (payload) => {
          const c = payload.new as Complaint;
          setComplaints(prev => [c, ...prev].slice(0, 50));
          setOpen(n => n + 1);
          if (c.severity === 'critical' || c.severity === 'high') {
            showAlert(
              `${c.severity.toUpperCase()} guest opportunity — ${c.department}`,
              c.description,
            );
          }
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [hotel.id]);

  // ── Alert toast ───────────────────────────────────────────────────
  const [alerts, setAlerts] = useState<{ id: number; title: string; text: string }[]>([]);
  let alertId = 0;
  function showAlert(title: string, text: string) {
    const id = ++alertId;
    setAlerts(prev => [...prev, { id, title, text }]);
    setTimeout(() => setAlerts(prev => prev.filter(a => a.id !== id)), 7000);
  }

  const isPro = hotel.plan === 'pro' || hotel.plan === 'enterprise';
  const maxDeptCount = deptCounts.length ? Math.max(...deptCounts.map(d => d.total_count)) : 1;

  const [portalLoading, setPortalLoading] = useState(false);

  async function manageBilling() {
    setPortalLoading(true);
    try {
      const res = await fetch('/api/portal', { method: 'POST' });
      const { url } = await res.json();
      if (url) window.location.href = url;
    } finally {
      setPortalLoading(false);
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--off-white)', paddingTop: '72px' }}>

      {/* Demo mode banner */}
      {isDemo && (
        <div style={{ background: '#162436', borderBottom: '1px solid rgba(245,196,81,0.3)', color: 'rgba(255,255,255,0.7)', textAlign: 'center', padding: '10px 24px', fontSize: '13px' }}>
          <Info size={14} style={{ display: 'inline', marginRight: 6, verticalAlign: 'middle' }} /><strong style={{ color: '#F5C451' }}>Demo mode</strong> — showing sample data.{' '}
          <a href="/login" style={{ color: '#F5C451', fontWeight: 600 }}>Sign up or connect Supabase</a> to see live data.
        </div>
      )}

      {showBanner && (
        <div style={{ background: 'var(--success)', color: 'white', textAlign: 'center', padding: '12px', fontSize: '14px', fontWeight: 600 }}>
          Welcome to StayOps HQ {hotel.plan}! Your 14-day trial has started.
          <button onClick={() => setShowBanner(false)} style={{ marginLeft: 16, background: 'none', border: 'none', color: 'white', cursor: 'pointer', fontSize: 18 }}>×</button>
        </div>
      )}

      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '36px 24px' }}>

        {/* Staff capture link */}
        <StaffCaptureLink slug={hotel.slug} />

        {/* Top bar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32, flexWrap: 'wrap', gap: 16 }}>
          <div>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 800 }}>
              Good morning, {profile.full_name.split(' ')[0]}
            </h1>
            <p style={{ fontSize: 14, color: 'var(--text-muted)', marginTop: 4 }}>
              {hotel.name} · {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })} ·{' '}
              <span style={{ color: 'var(--success)', fontWeight: 600 }}>● Live</span>
              {' '}·{' '}
              <span style={{ textTransform: 'capitalize', background: 'rgba(245,196,81,0.15)', color: 'var(--gold-dark)', padding: '2px 8px', borderRadius: 4, fontSize: 12, fontWeight: 700 }}>
                {hotel.plan} plan
              </span>
            </p>
          </div>
          {hotel.stripe_customer_id && (
            <button
              onClick={manageBilling}
              disabled={portalLoading}
              style={{ padding: '9px 18px', border: '2px solid var(--border)', color: 'var(--text-muted)', borderRadius: 8, fontWeight: 600, fontSize: 13, background: 'none', cursor: portalLoading ? 'not-allowed' : 'pointer', opacity: portalLoading ? 0.7 : 1, fontFamily: 'inherit' }}
            >
              {portalLoading ? 'Loading…' : 'Manage Billing'}
            </button>
          )}
          <a href="/analytics" style={{ padding: '9px 18px', border: '2px solid var(--border)', color: 'var(--text-muted)', borderRadius: 8, fontWeight: 600, fontSize: 13, textDecoration: 'none' }}>
            Analytics
          </a>
          <a href="/improvements" style={{ padding: '9px 18px', border: '2px solid var(--border)', color: 'var(--text-muted)', borderRadius: 8, fontWeight: 600, fontSize: 13, textDecoration: 'none' }}>
            Improvements
          </a>
          <a href="/complaints" style={{ padding: '9px 18px', border: '2px solid var(--gold)', color: 'var(--gold-dark)', borderRadius: 8, fontWeight: 600, fontSize: 13, textDecoration: 'none' }}>
            All Guest Opportunities →
          </a>
          <a href="/capture" style={{ padding: '9px 18px', background: 'var(--gold)', color: 'var(--navy)', borderRadius: 8, fontWeight: 600, fontSize: 13, textDecoration: 'none' }}>
            + Log Guest Opportunity
          </a>
        </div>

        {/* KPI cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 20, marginBottom: 28 }}>
          {[
            { label: 'Open Guest Opportunities',  value: open,     trend: open > 0 ? 'Needs attention' : 'All clear',     color: open > 0 ? 'var(--danger)' : 'var(--success)' },
            { label: 'Critical / High',  value: criticalCount, trend: criticalCount > 0 ? 'Immediate action' : 'None active', color: criticalCount > 0 ? '#7C3AED' : 'var(--success)' },
            { label: 'Resolved Today',   value: resolved, trend: '↑ live',                                             color: 'var(--navy)' },
            { label: 'AI Insights',      value: isPro ? '3 new' : '—', trend: isPro ? 'View below' : 'Pro plan required', color: isPro ? 'var(--gold-dark)' : 'var(--text-muted)' },
          ].map(k => (
            <div key={k.label} style={{ background: 'white', borderRadius: 16, padding: 24, boxShadow: 'var(--shadow)' }}>
              <div style={{ fontSize: 13, color: 'var(--text-muted)', fontWeight: 500, marginBottom: 8 }}>{k.label}</div>
              <div style={{ fontSize: '2rem', fontWeight: 800, color: k.color }}>{k.value}</div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>{k.trend}</div>
            </div>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 420px', gap: 24 }}>

          {/* Complaints by department */}
          <div style={{ background: 'white', borderRadius: 16, padding: 28, boxShadow: 'var(--shadow)' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: 24 }}>Guest Opportunities by Department — Today</h3>
            {deptCounts.length === 0 ? (
              <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>
                No guest opportunities logged yet. <a href="/capture" style={{ color: 'var(--gold)' }}>Log the first one →</a>
              </p>
            ) : (
              deptCounts.map(d => (
                <div key={d.department} style={{ marginBottom: 16 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 6, alignItems: 'center' }}>
                    <span style={{ fontWeight: 500 }}>{d.department}</span>
                    <span style={{ display: 'flex', gap: 10, fontSize: 12 }}>
                      <span style={{ color: 'var(--danger)', fontWeight: 600 }}>{d.open_count} open</span>
                      <span style={{ color: 'var(--text-muted)' }}>·</span>
                      <span style={{ color: 'var(--success)', fontWeight: 600 }}>{d.resolved_count} resolved</span>
                    </span>
                  </div>
                  <div style={{ height: 8, background: 'var(--border)', borderRadius: 4, overflow: 'hidden' }}>
                    <div style={{
                      height: '100%', borderRadius: 4,
                      width: `${(d.total_count / maxDeptCount) * 100}%`,
                      background: d.open_count > 2 ? 'var(--danger)' : d.open_count > 0 ? '#F59E0B' : 'var(--success)',
                      transition: 'width 1s ease',
                    }} />
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Live complaint feed */}
          <div style={{ background: 'white', borderRadius: 16, padding: 28, boxShadow: 'var(--shadow)', maxHeight: 600, overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 700 }}>Live Feed</h3>
              <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, fontWeight: 700, color: 'var(--success)' }}>
                <span style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--success)', display: 'inline-block', animation: 'pulse 1.5s infinite' }}></span>
                Live
              </span>
            </div>

            {complaints.length === 0 ? (
              <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>No guest opportunities logged yet today.</p>
            ) : (
              complaints.map(c => {
                const sev = SEVERITY_STYLE[c.severity];
                const sta = STATUS_STYLE[c.status];
                const isResolving = resolvingId === c.id;
                const canResolve  = c.status !== 'resolved';

                return (
                  <div key={c.id} style={{
                    borderRadius: 8,
                    background: 'var(--off-white)',
                    borderLeft: `4px solid ${STATUS_BORDER[c.status]}`,
                    marginBottom: 12,
                    overflow: 'hidden',
                  }}>
                    {/* ── Guest Opportunity header ── */}
                    <div style={{ padding: '12px 14px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 5 }}>
                        <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)' }}>
                          {c.department}{c.room_number ? ` · Room ${c.room_number}` : ''}
                        </div>
                        <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                          <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 7px', borderRadius: 4, background: sev.bg, color: sev.color }}>{sev.label}</span>
                          <span style={{ fontSize: 10, fontWeight: 600, color: sta.color }}>{sta.label}</span>
                        </div>
                      </div>
                      <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--gold-dark)', marginBottom: 3 }}>{c.category}</div>
                      <div style={{ fontSize: 13, color: 'var(--text)', lineHeight: 1.4 }}>{c.description}</div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 }}>
                        <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                          {new Date(c.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                        {canResolve && !isResolving && (
                          <button onClick={() => openResolveForm(c.id)} style={{
                            fontSize: 11, fontWeight: 700, padding: '4px 10px', borderRadius: 6,
                            border: '1px solid var(--success)', color: 'var(--success)',
                            background: 'transparent', cursor: 'pointer',
                          }}>
                            <Check size={11} strokeWidth={2.5} style={{ display: 'inline', marginRight: 3 }} />Resolve
                          </button>
                        )}
                        {canResolve && isResolving && (
                          <button onClick={cancelResolve} style={{
                            fontSize: 11, fontWeight: 600, padding: '4px 10px', borderRadius: 6,
                            border: '1px solid var(--border)', color: 'var(--text-muted)',
                            background: 'transparent', cursor: 'pointer',
                          }}>
                            Cancel
                          </button>
                        )}
                      </div>
                    </div>

                    {/* ── Resolve form (inline) ── */}
                    {isResolving && (
                      <div style={{ padding: '14px', borderTop: '1px solid var(--border)', background: 'white', display: 'flex', flexDirection: 'column', gap: 10 }}>
                        <div>
                          <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: 5 }}>
                            Resolution <span style={{ color: 'var(--danger)' }}>*</span>
                          </label>
                          <textarea
                            value={resolution}
                            onChange={e => setResolution(e.target.value)}
                            placeholder="How was this guest opportunity resolved?"
                            rows={2}
                            style={{ width: '100%', padding: '8px 10px', border: '1.5px solid var(--border)', borderRadius: 6, fontSize: 13, fontFamily: 'inherit', resize: 'none', boxSizing: 'border-box' }}
                          />
                        </div>
                        <div>
                          <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: 5 }}>
                            Compensation <span style={{ fontWeight: 400, textTransform: 'none' }}>(optional)</span>
                          </label>
                          <input
                            type="text"
                            value={compensation}
                            onChange={e => setCompensation(e.target.value)}
                            placeholder="e.g. Room upgrade, $50 credit"
                            style={{ width: '100%', padding: '8px 10px', border: '1.5px solid var(--border)', borderRadius: 6, fontSize: 13, fontFamily: 'inherit', boxSizing: 'border-box' }}
                          />
                        </div>
                        <div>
                          <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: 5 }}>
                            Guest Satisfaction <span style={{ color: 'var(--danger)' }}>*</span>
                          </label>
                          <div style={{ display: 'flex', gap: 6 }}>
                            {[1, 2, 3, 4, 5].map(n => (
                              <button key={n} onClick={() => setSatisfaction(n)} title={SAT_LABELS[n]} style={{
                                flex: 1, padding: '7px 0', borderRadius: 6, fontSize: 13, fontWeight: 700, cursor: 'pointer',
                                border: `2px solid ${satisfaction === n ? 'var(--gold)' : 'var(--border)'}`,
                                background: satisfaction === n ? 'rgba(245,196,81,0.15)' : 'transparent',
                                color: satisfaction === n ? 'var(--gold-dark)' : 'var(--text-muted)',
                                transition: 'all 0.15s',
                              }}>
                                {n}
                              </button>
                            ))}
                          </div>
                          {satisfaction && (
                            <div style={{ fontSize: 11, color: 'var(--gold-dark)', marginTop: 4, fontWeight: 600 }}>
                              {SAT_LABELS[satisfaction]}
                            </div>
                          )}
                        </div>
                        <button
                          onClick={() => submitResolve(c)}
                          disabled={!resolution.trim() || satisfaction === null || submitting}
                          style={{
                            padding: '9px', background: 'var(--success)', color: 'white',
                            border: 'none', borderRadius: 6, fontWeight: 700, fontSize: 13,
                            cursor: resolution.trim() && satisfaction !== null && !submitting ? 'pointer' : 'not-allowed',
                            opacity: resolution.trim() && satisfaction !== null && !submitting ? 1 : 0.5,
                          }}
                        >
                          {submitting ? 'Saving…' : <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}><Check size={14} strokeWidth={2.5} />Mark as Resolved</span>}
                        </button>
                      </div>
                    )}

                    {/* ── Resolution summary (once resolved) ── */}
                    {c.status === 'resolved' && c.resolution && (
                      <div style={{ padding: '10px 14px', borderTop: '1px solid rgba(16,185,129,0.2)', background: 'rgba(16,185,129,0.04)' }}>
                        <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--success)', marginBottom: 4, display: 'flex', alignItems: 'center', gap: 4 }}><Check size={11} strokeWidth={2.5} />RESOLVED</div>
                        <div style={{ fontSize: 12, color: 'var(--text)', marginBottom: c.compensation || c.guest_satisfaction ? 6 : 0 }}>{c.resolution}</div>
                        {c.compensation && (
                          <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                            Compensation: <strong style={{ color: 'var(--text)' }}>{c.compensation}</strong>
                          </div>
                        )}
                        {c.guest_satisfaction && (
                          <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>
                            Guest satisfaction: <strong style={{ color: 'var(--gold-dark)' }}>{c.guest_satisfaction}/5 — {SAT_LABELS[c.guest_satisfaction]}</strong>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* ── Guests & Follow-up Emails ── */}
        <div style={{ marginTop: 24, background: 'white', borderRadius: 16, padding: 28, boxShadow: 'var(--shadow)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <div>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, margin: 0 }}>Guest Stay Tracker</h3>
              <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>Add guests at check-in to trigger personalised follow-up emails at checkout.</p>
            </div>
            <button onClick={() => setShowAddGuest(v => !v)} style={{
              padding: '8px 16px', background: showAddGuest ? 'var(--border)' : 'var(--gold)',
              color: showAddGuest ? 'var(--text)' : 'var(--navy)',
              border: 'none', borderRadius: 8, fontWeight: 700, fontSize: 13, cursor: 'pointer',
            }}>
              {showAddGuest ? 'Cancel' : '+ Add Guest'}
            </button>
          </div>

          {/* Add Guest Form */}
          {showAddGuest && (
            <div style={{ background: 'var(--off-white)', borderRadius: 10, padding: 20, marginBottom: 20, display: 'grid', gridTemplateColumns: 'repeat(3, 1fr) 140px 140px auto', gap: 12, alignItems: 'end' }}>
              {(['name', 'email', 'room_number', 'check_in', 'check_out'] as const).map(field => (
                <div key={field}>
                  <label style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)', display: 'block', marginBottom: 5 }}>
                    {field === 'room_number' ? 'Room' : field === 'check_in' ? 'Check-in' : field === 'check_out' ? 'Check-out' : field.charAt(0).toUpperCase() + field.slice(1)}
                  </label>
                  <input
                    type={field.includes('_') && field !== 'room_number' ? 'date' : 'text'}
                    value={guestForm[field]}
                    onChange={e => setGuestForm(f => ({ ...f, [field]: e.target.value }))}
                    placeholder={field === 'name' ? 'Full name' : field === 'email' ? 'guest@email.com' : field === 'room_number' ? '412' : ''}
                    style={{ width: '100%', padding: '9px 12px', border: '1.5px solid var(--border)', borderRadius: 7, fontSize: 13, fontFamily: 'inherit', boxSizing: 'border-box' }}
                  />
                </div>
              ))}
              <button
                onClick={addGuest}
                disabled={addingGuest || !guestForm.name || !guestForm.email || !guestForm.room_number || !guestForm.check_in || !guestForm.check_out}
                style={{ padding: '9px 16px', background: 'var(--navy)', color: 'white', border: 'none', borderRadius: 7, fontWeight: 700, fontSize: 13, cursor: 'pointer', opacity: addingGuest ? 0.6 : 1 }}
              >
                {addingGuest ? 'Saving…' : 'Save'}
              </button>
            </div>
          )}

          {/* Guest list */}
          {guests.length === 0 ? (
            <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>No guests added yet. Add a guest at check-in to enable automated follow-up emails.</p>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 12 }}>
              {guests.map(g => {
                const guestComplaints = complaints.filter(c => c.room_number === g.room_number);
                const hasComplaints   = guestComplaints.length > 0;
                const sent            = emailSentIds.has(g.id);
                const sending         = emailingId === g.id;
                return (
                  <div key={g.id} style={{
                    border: `1.5px solid ${hasComplaints ? 'rgba(220,38,38,0.2)' : 'var(--border)'}`,
                    borderRadius: 10, padding: '16px 18px',
                    background: hasComplaints ? 'rgba(220,38,38,0.02)' : 'var(--off-white)',
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: 14 }}>{g.name}</div>
                        <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>Room {g.room_number} · {formatStayDates(g.check_in, g.check_out)}</div>
                      </div>
                      {hasComplaints && (
                        <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 8px', borderRadius: 6, background: 'rgba(220,38,38,0.1)', color: 'var(--danger)' }}>
                          {guestComplaints.length} guest opportunit{guestComplaints.length > 1 ? 'ies' : 'y'}
                        </span>
                      )}
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 12 }}>{g.email}</div>
                    {sent ? (
                      <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--success)', display: 'flex', alignItems: 'center', gap: 5 }}><Check size={12} strokeWidth={2.5} />Follow-up email sent</div>
                    ) : (
                      <button onClick={() => sendFollowUp(g)} disabled={sending} style={{
                        width: '100%', padding: '8px', borderRadius: 7, fontWeight: 700, fontSize: 12, cursor: sending ? 'not-allowed' : 'pointer',
                        background: hasComplaints ? 'var(--danger)' : 'var(--navy)',
                        color: 'white', border: 'none', opacity: sending ? 0.6 : 1,
                      }}>
                        {sending ? 'Sending…' : <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}><Mail size={13} strokeWidth={2} />{hasComplaints ? 'Send Priority Follow-up' : 'Send Follow-up Email'}</span>}
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Pro gate: AI Insights */}
        {!isPro && (
          <div style={{ marginTop: 24, background: 'var(--navy)', borderRadius: 12, padding: 32, textAlign: 'center', color: 'white' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, marginBottom: 12 }}><Sparkles size={22} color="#F5C451" strokeWidth={1.75} /><span style={{ fontSize: '1.2rem', fontWeight: 700 }}>AI Insights</span></div>
            <p style={{ color: 'rgba(255,255,255,0.6)', marginBottom: 20, fontSize: 15 }}>
              Upgrade to Pro to get AI-generated pattern detection, repeat guest opportunity identification, and prioritized resolution recommendations.
            </p>
            <UpgradeToPro />
          </div>
        )}
      </div>

      {/* Alert toasts */}
      <div style={{ position: 'fixed', bottom: 32, right: 32, zIndex: 9999, display: 'flex', flexDirection: 'column', gap: 12 }}>
        {alerts.map(a => (
          <div key={a.id} style={{ background: 'var(--navy)', border: '1px solid var(--danger)', borderRadius: 12, padding: '16px 20px', maxWidth: 320, boxShadow: 'var(--shadow-lg)' }}>
            <div style={{ fontWeight: 700, fontSize: 13, color: 'white' }}>{a.title}</div>
            <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.55)', marginTop: 4 }}>{a.text}</div>
          </div>
        ))}
      </div>

      <style>{`@keyframes pulse { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:0.5;transform:scale(1.3)} }`}</style>
    </div>
  );
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function formatStayDates(checkIn: string, checkOut: string): string {
  const fmt = (d: string) => new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  return `${fmt(checkIn)} – ${fmt(checkOut)}`;
}

// ── Stripe checkout button ────────────────────────────────────────────────────
function UpgradeToPro() {
  const [loading, setLoading] = useState(false);

  async function handleUpgrade() {
    setLoading(true);
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan: 'pro' }),
      });
      const { url, error } = await res.json();
      if (error) throw new Error(error);
      window.location.href = url;
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  }

  return (
    <button
      onClick={handleUpgrade}
      disabled={loading}
      style={{
        padding: '14px 32px', background: 'var(--gold)', color: 'var(--navy)',
        border: 'none', borderRadius: 8, fontWeight: 700, fontSize: 15,
        cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1,
      }}
    >
      {loading ? 'Redirecting to Stripe…' : 'Upgrade to Pro — $349/mo'}
    </button>
  );
}
