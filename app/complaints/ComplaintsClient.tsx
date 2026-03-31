'use client';

import { useState, useMemo } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { Complaint, ComplaintSeverity, ComplaintStatus, Department } from '@/types';
import { Check } from 'lucide-react';
import AppNav from '@/app/components/AppNav';

interface Props {
  initialComplaints: Complaint[];
  isDemo: boolean;
}

const SEVERITY_STYLE: Record<ComplaintSeverity, { color: string; bg: string; label: string }> = {
  low:      { color: '#6B7280', bg: 'rgba(107,114,128,0.1)', label: 'Low' },
  medium:   { color: '#D97706', bg: 'rgba(217,119,6,0.1)',   label: 'Medium' },
  high:     { color: '#DC2626', bg: 'rgba(220,38,38,0.1)',   label: 'High' },
  critical: { color: '#7C3AED', bg: 'rgba(124,58,237,0.1)', label: 'Critical' },
};

const STATUS_STYLE: Record<ComplaintStatus, { color: string; bg: string; label: string }> = {
  open:        { color: '#DC2626', bg: 'rgba(220,38,38,0.08)',  label: 'Open' },
  in_progress: { color: '#D97706', bg: 'rgba(217,119,6,0.08)',  label: 'In Progress' },
  resolved:    { color: '#059669', bg: 'rgba(5,150,105,0.08)',  label: 'Resolved' },
};

const SAT_LABELS: Record<number, string> = { 1: 'Unsatisfied', 2: 'Dissatisfied', 3: 'Neutral', 4: 'Satisfied', 5: 'Very Satisfied' };

const DEPARTMENTS: Department[] = [
  'Front Desk', 'Housekeeping', 'Food & Beverage', 'Concierge',
  'Spa & Fitness', 'Pool & Beach', 'Valet & Transport', 'Activities', 'Maintenance',
];

type DateRange = '7d' | '30d' | '90d' | 'all';

export default function ComplaintsClient({ initialComplaints, isDemo }: Props) {
  const [complaints, setComplaints] = useState<Complaint[]>(initialComplaints);
  const [search, setSearch]         = useState('');
  const [statusFilter, setStatus]   = useState<ComplaintStatus | 'all'>('all');
  const [severityFilter, setSeverity] = useState<ComplaintSeverity | 'all'>('all');
  const [deptFilter, setDept]       = useState<Department | 'all'>('all');
  const [dateRange, setDateRange]   = useState<DateRange>('30d');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // ── Resolve inline ────────────────────────────────────────────────
  const [resolvingId, setResolvingId]   = useState<string | null>(null);
  const [resolution, setResolution]     = useState('');
  const [compensation, setCompensation] = useState('');
  const [satisfaction, setSatisfaction] = useState<number | null>(null);
  const [submitting, setSubmitting]     = useState(false);

  async function submitResolve(c: Complaint) {
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
      await supabase.from('complaints').update(update).eq('id', c.id);
    }
    setComplaints(prev => prev.map(x => x.id === c.id ? { ...x, ...update } : x));
    setResolvingId(null); setResolution(''); setCompensation(''); setSatisfaction(null);
    setSubmitting(false);
  }

  // ── Filtering ─────────────────────────────────────────────────────
  const cutoff = useMemo(() => {
    if (dateRange === 'all') return null;
    const days = dateRange === '7d' ? 7 : dateRange === '30d' ? 30 : 90;
    return new Date(Date.now() - days * 86400000);
  }, [dateRange]);

  const filtered = useMemo(() => complaints.filter(c => {
    if (statusFilter   !== 'all' && c.status     !== statusFilter)   return false;
    if (severityFilter !== 'all' && c.severity   !== severityFilter) return false;
    if (deptFilter     !== 'all' && c.department !== deptFilter)     return false;
    if (cutoff && new Date(c.created_at) < cutoff)                   return false;
    if (search) {
      const q = search.toLowerCase();
      return (
        c.description.toLowerCase().includes(q) ||
        c.category.toLowerCase().includes(q) ||
        c.department.toLowerCase().includes(q) ||
        (c.room_number ?? '').toLowerCase().includes(q) ||
        (c.guest?.name ?? '').toLowerCase().includes(q) ||
        (c.resolution ?? '').toLowerCase().includes(q)
      );
    }
    return true;
  }), [complaints, statusFilter, severityFilter, deptFilter, cutoff, search]);

  // ── Stats strip ───────────────────────────────────────────────────
  const stats = useMemo(() => ({
    total:    filtered.length,
    open:     filtered.filter(c => c.status === 'open').length,
    resolved: filtered.filter(c => c.status === 'resolved').length,
    avgSat:   (() => {
      const withSat = filtered.filter(c => c.guest_satisfaction !== null);
      if (!withSat.length) return null;
      return (withSat.reduce((s, c) => s + (c.guest_satisfaction ?? 0), 0) / withSat.length).toFixed(1);
    })(),
  }), [filtered]);

  const pill = (label: string, color: string, bg: string) => (
    <span style={{ fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 4, background: bg, color }}>{label}</span>
  );

  return (
    <div style={{ minHeight: '100vh', background: 'var(--off-white)', paddingTop: 72 }}>
      <AppNav />
      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '32px 24px 64px' }}>

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28, flexWrap: 'wrap', gap: 16 }}>
          <div>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: 4 }}>Guest Opportunity Database</h1>
            <p style={{ fontSize: 14, color: 'var(--text-muted)' }}>Full guest opportunity history with lifecycle data — log, resolution, compensation, and guest satisfaction.</p>
          </div>
        </div>

        {/* Stats strip */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 24 }}>
          {[
            { label: 'Total',        value: stats.total,    color: 'var(--navy)' },
            { label: 'Open',         value: stats.open,     color: stats.open > 0 ? 'var(--danger)' : 'var(--success)' },
            { label: 'Resolved',     value: stats.resolved, color: 'var(--success)' },
            { label: 'Avg. Post-Resolution Satisfaction', value: stats.avgSat ? `${stats.avgSat}/5` : '—', color: 'var(--gold-dark)' },
          ].map(s => (
            <div key={s.label} style={{ background: 'white', borderRadius: 10, padding: '18px 22px', boxShadow: 'var(--shadow)' }}>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 500, marginBottom: 6 }}>{s.label}</div>
              <div style={{ fontSize: '1.75rem', fontWeight: 800, color: s.color }}>{s.value}</div>
            </div>
          ))}
        </div>

        {/* Filter bar */}
        <div style={{ background: 'white', borderRadius: 10, padding: '16px 20px', boxShadow: 'var(--shadow)', marginBottom: 20, display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search guest opportunities, rooms, guests…"
            style={{ flex: 1, minWidth: 200, padding: '8px 12px', border: '1.5px solid var(--border)', borderRadius: 7, fontSize: 13, fontFamily: 'inherit' }}
          />

          {([
            { value: statusFilter,   onChange: (v: string) => setStatus(v as ComplaintStatus | 'all'),     options: ['all', 'open', 'in_progress', 'resolved'],                label: (v: string) => v === 'all' ? 'All Statuses' : v === 'in_progress' ? 'In Progress' : v.charAt(0).toUpperCase() + v.slice(1) },
            { value: severityFilter, onChange: (v: string) => setSeverity(v as ComplaintSeverity | 'all'), options: ['all', 'critical', 'high', 'medium', 'low'],              label: (v: string) => v === 'all' ? 'All Severities' : v.charAt(0).toUpperCase() + v.slice(1) },
            { value: deptFilter,     onChange: (v: string) => setDept(v as Department | 'all'),            options: ['all', ...DEPARTMENTS],                                  label: (v: string) => v === 'all' ? 'All Departments' : v },
            { value: dateRange,      onChange: (v: string) => setDateRange(v as DateRange),                options: ['7d', '30d', '90d', 'all'],                              label: (v: string) => v === '7d' ? 'Last 7 days' : v === '30d' ? 'Last 30 days' : v === '90d' ? 'Last 90 days' : 'All time' },
          ] as const).map((f, i) => (
            <select key={i} value={f.value} onChange={e => f.onChange(e.target.value)} style={{ padding: '8px 12px', border: '1.5px solid var(--border)', borderRadius: 7, fontSize: 13, fontFamily: 'inherit', background: 'white' }}>
              {f.options.map(o => <option key={o} value={o}>{f.label(o)}</option>)}
            </select>
          ))}

          <span style={{ fontSize: 13, color: 'var(--text-muted)', marginLeft: 'auto' }}>{filtered.length} result{filtered.length !== 1 ? 's' : ''}</span>
        </div>

        {/* Table */}
        <div style={{ background: 'white', borderRadius: 12, boxShadow: 'var(--shadow)', overflow: 'hidden' }}>
          {/* Column headers */}
          <div style={{ display: 'grid', gridTemplateColumns: '180px 140px 160px 110px 100px 1fr 80px', gap: 0, padding: '10px 20px', background: 'var(--off-white)', borderBottom: '1px solid var(--border)' }}>
            {['Timestamp', 'Room / Guest', 'Dept / Category', 'Severity', 'Status', 'Description', ''].map(h => (
              <div key={h} style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-muted)' }}>{h}</div>
            ))}
          </div>

          {filtered.length === 0 ? (
            <div style={{ padding: '48px 24px', textAlign: 'center', color: 'var(--text-muted)', fontSize: 14 }}>
              No guest opportunities match your current filters.
            </div>
          ) : (
            filtered.map(c => {
              const sev     = SEVERITY_STYLE[c.severity];
              const sta     = STATUS_STYLE[c.status];
              const isOpen  = expandedId === c.id;
              const resolving = resolvingId === c.id;

              return (
                <div key={c.id} style={{ borderBottom: '1px solid var(--border)' }}>
                  {/* Row */}
                  <div
                    onClick={() => setExpandedId(isOpen ? null : c.id)}
                    style={{ display: 'grid', gridTemplateColumns: '180px 140px 160px 110px 100px 1fr 80px', gap: 0, padding: '14px 20px', cursor: 'pointer', transition: 'background 0.1s', background: isOpen ? 'rgba(201,168,76,0.03)' : 'white' }}
                  >
                    <div style={{ fontSize: 12 }}>
                      <div style={{ fontWeight: 600 }}>{new Date(c.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</div>
                      <div style={{ color: 'var(--text-muted)', marginTop: 2 }}>{new Date(c.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                    </div>
                    <div style={{ fontSize: 12 }}>
                      <div style={{ fontWeight: 600 }}>{c.room_number ? `Room ${c.room_number}` : '—'}</div>
                      {c.guest?.name && <div style={{ color: 'var(--text-muted)', marginTop: 2, fontSize: 11 }}>{c.guest.name}</div>}
                    </div>
                    <div style={{ fontSize: 12 }}>
                      <div style={{ fontWeight: 600 }}>{c.department}</div>
                      <div style={{ color: 'var(--text-muted)', marginTop: 2 }}>{c.category}</div>
                    </div>
                    <div>{pill(sev.label, sev.color, sev.bg)}</div>
                    <div>{pill(sta.label, sta.color, sta.bg)}</div>
                    <div style={{ fontSize: 13, color: 'var(--text)', paddingRight: 12 }}>
                      {c.description.length > 80 ? c.description.slice(0, 80) + '…' : c.description}
                    </div>
                    <div style={{ fontSize: 11, color: 'var(--gold-dark)', fontWeight: 600 }}>{isOpen ? '▲ Close' : '▼ Details'}</div>
                  </div>

                  {/* Expanded detail panel */}
                  {isOpen && (
                    <div style={{ padding: '20px 24px 24px', background: 'var(--off-white)', borderTop: '1px solid var(--border)', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>

                      {/* Left: full complaint + resolution */}
                      <div>
                        <div style={{ marginBottom: 16 }}>
                          <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-muted)', marginBottom: 6 }}>Guest Opportunity</div>
                          <p style={{ fontSize: 14, color: 'var(--text)', lineHeight: 1.6, margin: 0 }}>{c.description}</p>
                        </div>

                        {c.resolution && (
                          <div style={{ marginBottom: 12 }}>
                            <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--success)', marginBottom: 6 }}>Resolution</div>
                            <p style={{ fontSize: 14, color: 'var(--text)', lineHeight: 1.6, margin: 0 }}>{c.resolution}</p>
                          </div>
                        )}
                        {c.compensation && (
                          <div style={{ marginBottom: 12 }}>
                            <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-muted)', marginBottom: 4 }}>Compensation</div>
                            <p style={{ fontSize: 14, color: 'var(--text)', margin: 0 }}>{c.compensation}</p>
                          </div>
                        )}
                        {c.guest_satisfaction && (
                          <div>
                            <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-muted)', marginBottom: 4 }}>Guest Satisfaction</div>
                            <p style={{ fontSize: 14, fontWeight: 700, color: 'var(--gold-dark)', margin: 0 }}>{c.guest_satisfaction}/5 — {SAT_LABELS[c.guest_satisfaction]}</p>
                          </div>
                        )}
                      </div>

                      {/* Right: metadata + resolve action */}
                      <div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 20 }}>
                          {[
                            { label: 'Opportunity ID', value: c.id.slice(0, 8).toUpperCase() },
                            { label: 'Guest ID',     value: c.guest_id ? c.guest_id.slice(0, 8).toUpperCase() : '—' },
                            { label: 'Logged',       value: new Date(c.created_at).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) },
                            { label: 'Resolved',     value: c.resolved_at ? new Date(c.resolved_at).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—' },
                          ].map(m => (
                            <div key={m.label}>
                              <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-muted)', marginBottom: 3 }}>{m.label}</div>
                              <div style={{ fontSize: 13, fontFamily: m.label.includes('ID') ? 'monospace' : 'inherit' }}>{m.value}</div>
                            </div>
                          ))}
                        </div>

                        {/* Inline resolve form */}
                        {c.status !== 'resolved' && !resolving && (
                          <button onClick={(e) => { e.stopPropagation(); setResolvingId(c.id); setResolution(''); setCompensation(''); setSatisfaction(null); }} style={{ padding: '9px 18px', border: '1.5px solid var(--success)', color: 'var(--success)', background: 'transparent', borderRadius: 7, fontWeight: 700, fontSize: 13, cursor: 'pointer' }}>
                            <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}><Check size={13} strokeWidth={2.5} />Resolve this guest opportunity</span>
                          </button>
                        )}

                        {resolving && (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }} onClick={e => e.stopPropagation()}>
                            <textarea value={resolution} onChange={e => setResolution(e.target.value)} placeholder="How was this resolved?" rows={2} style={{ width: '100%', padding: '8px 10px', border: '1.5px solid var(--border)', borderRadius: 6, fontSize: 13, fontFamily: 'inherit', resize: 'none', boxSizing: 'border-box' }} />
                            <input type="text" value={compensation} onChange={e => setCompensation(e.target.value)} placeholder="Compensation (optional, e.g. $50 credit)" style={{ width: '100%', padding: '8px 10px', border: '1.5px solid var(--border)', borderRadius: 6, fontSize: 13, fontFamily: 'inherit', boxSizing: 'border-box' }} />
                            <div style={{ display: 'flex', gap: 5 }}>
                              {([
                                [1, '#EF4444'], [2, '#F97316'], [3, '#EAB308'], [4, '#22C55E'], [5, '#059669'],
                              ] as [number, string][]).map(([n, color]) => {
                                const selected = satisfaction === n;
                                return (
                                  <button key={n} onClick={() => setSatisfaction(n)} style={{
                                    flex: 1, padding: '6px 2px', borderRadius: 6, cursor: 'pointer',
                                    border: `2px solid ${selected ? color : 'var(--border)'}`,
                                    background: selected ? `${color}20` : 'white',
                                    transition: 'all 0.15s', display: 'flex', flexDirection: 'column',
                                    alignItems: 'center', gap: 2,
                                  }}>
                                    <span style={{ fontSize: 13, fontWeight: 800, color: selected ? color : 'var(--text-muted)' }}>{n}</span>
                                    <span style={{ fontSize: 9, fontWeight: 700, color: selected ? color : 'var(--text-muted)', lineHeight: 1.2, textAlign: 'center' }}>{SAT_LABELS[n]}</span>
                                  </button>
                                );
                              })}
                            </div>
                            <div style={{ display: 'flex', gap: 8 }}>
                              <button onClick={() => submitResolve(c)} disabled={!resolution.trim() || satisfaction === null || submitting} style={{ flex: 1, padding: '9px', background: 'var(--success)', color: 'white', border: 'none', borderRadius: 6, fontWeight: 700, fontSize: 13, cursor: 'pointer', opacity: resolution.trim() && satisfaction !== null ? 1 : 0.5 }}>
                                {submitting ? 'Saving…' : <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}><Check size={13} strokeWidth={2.5} />Mark Resolved</span>}
                              </button>
                              <button onClick={() => setResolvingId(null)} style={{ padding: '9px 14px', border: '1.5px solid var(--border)', background: 'white', borderRadius: 6, fontSize: 13, cursor: 'pointer', color: 'var(--text-muted)' }}>Cancel</button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
