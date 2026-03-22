'use client';

import { useMemo } from 'react';
import type { Complaint } from '@/types';

interface Props { complaints: Complaint[] }

// ── Time window helpers ───────────────────────────────────────────────────────
const now = () => Date.now();
const daysAgo = (n: number) => new Date(now() - n * 86400000);

function inWindow(c: Complaint, from: Date, to: Date) {
  const t = new Date(c.created_at);
  return t >= from && t < to;
}

// ── Core types ────────────────────────────────────────────────────────────────
interface PatternTrend {
  key: string;        // "dept::category"
  dept: string;
  category: string;
  curr30: number;     // complaints in last 30d
  prev30: number;     // complaints in 30–60d
  curr90: number;     // complaints in last 90d
  currResTime: number | null;   // avg hours to resolve, last 30d
  prevResTime: number | null;
  currSat: number | null;       // avg satisfaction, last 30d
  prevSat: number | null;
  unresolvedCurr: number;
  status: 'improving' | 'worsening' | 'stable' | 'new' | 'resolved';
}

interface RoomHotspot {
  room: string;
  count: number;
  categories: string[];
  dept: string;
  lastSeen: string;
  hasOpen: boolean;
}

interface Recommendation {
  id: string;
  priority: 'critical' | 'high' | 'medium';
  area: string;
  title: string;
  detail: string;
  action: string;
}

// ── Computation helpers ───────────────────────────────────────────────────────
function resHours(c: Complaint): number | null {
  if (!c.resolved_at) return null;
  return (new Date(c.resolved_at).getTime() - new Date(c.created_at).getTime()) / 3_600_000;
}
function avg(nums: number[]): number | null {
  if (!nums.length) return null;
  return nums.reduce((a, b) => a + b, 0) / nums.length;
}
function trendPct(curr: number, prev: number): number | null {
  if (prev === 0) return null;
  return ((curr - prev) / prev) * 100;
}
function fmtHours(h: number): string {
  if (h < 1)  return `${Math.round(h * 60)}m`;
  if (h < 24) return `${h.toFixed(1)}h`;
  return `${(h / 24).toFixed(1)}d`;
}

// ── Main component ────────────────────────────────────────────────────────────
export default function ImprovementsClient({ complaints }: Props) {

  // ── 1. Pattern trend analysis ─────────────────────────────────────
  const patterns = useMemo<PatternTrend[]>(() => {
    const curr30Start = daysAgo(30);
    const prev30Start = daysAgo(60);
    const curr90Start = daysAgo(90);

    const curr30 = complaints.filter(c => inWindow(c, curr30Start, new Date()));
    const prev30 = complaints.filter(c => inWindow(c, prev30Start, curr30Start));
    const curr90 = complaints.filter(c => inWindow(c, curr90Start, new Date()));

    // Collect all (dept, category) keys seen in 90d with 2+ total occurrences
    const keyCounts = new Map<string, number>();
    for (const c of curr90) {
      const k = `${c.department}::${c.category}`;
      keyCounts.set(k, (keyCounts.get(k) ?? 0) + 1);
    }

    const recurringKeys = [...keyCounts.entries()]
      .filter(([, n]) => n >= 2)
      .map(([k]) => k);

    return recurringKeys.map(key => {
      const [dept, category] = key.split('::');

      const currComps = curr30.filter(c => c.department === dept && c.category === category);
      const prevComps = prev30.filter(c => c.department === dept && c.category === category);
      const allComps  = curr90.filter(c => c.department === dept && c.category === category);

      const currResolved = currComps.filter(c => c.resolved_at);
      const prevResolved = prevComps.filter(c => c.resolved_at);

      const currResTime = avg(currResolved.map(resHours).filter((h): h is number => h !== null));
      const prevResTime = avg(prevResolved.map(resHours).filter((h): h is number => h !== null));

      const currSat = avg(currResolved.filter(c => c.guest_satisfaction).map(c => c.guest_satisfaction as number));
      const prevSat = avg(prevResolved.filter(c => c.guest_satisfaction).map(c => c.guest_satisfaction as number));

      const unresolvedCurr = currComps.filter(c => c.status !== 'resolved').length;
      const volDelta = trendPct(currComps.length, prevComps.length);
      const satDelta = currSat !== null && prevSat !== null ? currSat - prevSat : null;
      const resDelta = currResTime !== null && prevResTime !== null ? currResTime - prevResTime : null;

      // Status logic: improving = volume down AND (sat up OR resTime down)
      let status: PatternTrend['status'];
      if (prevComps.length === 0) {
        status = currComps.length === 0 ? 'resolved' : 'new';
      } else if (currComps.length === 0) {
        status = 'resolved';
      } else {
        const volImproving = volDelta !== null && volDelta < -10;
        const volWorsening = volDelta !== null && volDelta > 20;
        const satImproving = satDelta !== null && satDelta > 0.3;
        const satWorsening = satDelta !== null && satDelta < -0.3;
        const resImproving = resDelta !== null && resDelta < -1;
        const resWorsening = resDelta !== null && resDelta > 2;

        if (volImproving || (satImproving && resImproving)) status = 'improving';
        else if (volWorsening || (satWorsening && resWorsening)) status = 'worsening';
        else status = 'stable';
      }

      return {
        key, dept, category,
        curr30: currComps.length,
        prev30: prevComps.length,
        curr90: allComps.length,
        currResTime, prevResTime,
        currSat, prevSat,
        unresolvedCurr,
        status,
      };
    }).sort((a, b) => {
      // Sort: worsening first, then new, then stable, then improving
      const order = { worsening: 0, new: 1, stable: 2, improving: 3, resolved: 4 };
      return order[a.status] - order[b.status] || b.curr90 - a.curr90;
    });
  }, [complaints]);

  // ── 2. Room hotspots ──────────────────────────────────────────────
  const roomHotspots = useMemo<RoomHotspot[]>(() => {
    const since90 = complaints.filter(c => c.room_number && inWindow(c, daysAgo(90), new Date()));
    const byRoom = new Map<string, Complaint[]>();
    for (const c of since90) {
      const r = c.room_number!;
      if (!byRoom.has(r)) byRoom.set(r, []);
      byRoom.get(r)!.push(c);
    }
    return [...byRoom.entries()]
      .filter(([, cs]) => cs.length >= 2)
      .map(([room, cs]) => ({
        room,
        count: cs.length,
        categories: [...new Set(cs.map(c => c.category))],
        dept: cs[0].department,
        lastSeen: cs.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0].created_at,
        hasOpen: cs.some(c => c.status !== 'resolved'),
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
  }, [complaints]);

  // ── 3. Month-over-month scorecard ─────────────────────────────────
  const scorecard = useMemo(() => {
    const curr = complaints.filter(c => inWindow(c, daysAgo(30), new Date()));
    const prev = complaints.filter(c => inWindow(c, daysAgo(60), daysAgo(30)));

    const currResolved = curr.filter(c => c.status === 'resolved' && c.resolved_at);
    const prevResolved = prev.filter(c => c.status === 'resolved' && c.resolved_at);

    const currResTimes = currResolved.map(resHours).filter((h): h is number => h !== null);
    const prevResTimes = prevResolved.map(resHours).filter((h): h is number => h !== null);

    const currSats = currResolved.filter(c => c.guest_satisfaction).map(c => c.guest_satisfaction as number);
    const prevSats = prevResolved.filter(c => c.guest_satisfaction).map(c => c.guest_satisfaction as number);

    const currResRate = curr.length > 0 ? (currResolved.length / curr.length) * 100 : 0;
    const prevResRate = prev.length > 0 ? (prevResolved.length / prev.length) * 100 : 0;

    return {
      volume:       { curr: curr.length,                   prev: prev.length,                   unit: 'complaints',  wantDown: true  },
      resTime:      { curr: avg(currResTimes) ?? 0,         prev: avg(prevResTimes) ?? 0,         unit: 'avg hours',   wantDown: true  },
      resRate:      { curr: currResRate,                    prev: prevResRate,                    unit: '% resolved',  wantDown: false },
      satisfaction: { curr: avg(currSats) ?? 0,             prev: avg(prevSats) ?? 0,             unit: '/ 5',         wantDown: false },
    };
  }, [complaints]);

  // ── 4. Auto-generated recommendations ────────────────────────────
  const recommendations = useMemo<Recommendation[]>(() => {
    const recs: Recommendation[] = [];
    const curr90 = complaints.filter(c => inWindow(c, daysAgo(90), new Date()));
    const curr30 = complaints.filter(c => inWindow(c, daysAgo(30), new Date()));

    // High-volume recurring categories
    const catCounts = new Map<string, number>();
    for (const c of curr90) catCounts.set(c.category, (catCounts.get(c.category) ?? 0) + 1);
    for (const [cat, count] of catCounts) {
      if (count >= 5) {
        const dept = curr90.find(c => c.category === cat)?.department ?? '';
        recs.push({
          id: `rec-vol-${cat}`,
          priority: count >= 8 ? 'critical' : 'high',
          area: `${dept} — ${cat}`,
          title: `"${cat}" has appeared ${count} times in 90 days`,
          detail: `This is your highest-frequency complaint category. Repeated occurrences indicate a systemic process failure rather than isolated incidents.`,
          action: `Conduct a full SOP audit for ${dept}. Assign a department lead to own this category with a 30-day improvement target.`,
        });
      }
    }

    // Slow resolution times
    const deptResTimes = new Map<string, number[]>();
    for (const c of curr30.filter(c => c.resolved_at)) {
      const h = resHours(c);
      if (h === null) continue;
      if (!deptResTimes.has(c.department)) deptResTimes.set(c.department, []);
      deptResTimes.get(c.department)!.push(h);
    }
    for (const [dept, times] of deptResTimes) {
      const avgTime = avg(times);
      if (avgTime !== null && avgTime > 6) {
        recs.push({
          id: `rec-res-${dept}`,
          priority: avgTime > 12 ? 'critical' : 'high',
          area: dept,
          title: `${dept} avg. resolution time is ${fmtHours(avgTime)}`,
          detail: `Resolution times above 6 hours suggest complaints are not being escalated or actioned promptly within this department.`,
          action: `Implement a 2-hour response SLA for ${dept} complaints. Create an on-call escalation path for complaints marked High or Critical.`,
        });
      }
    }

    // Room-level hotspots
    for (const hotspot of roomHotspots.slice(0, 3)) {
      if (hotspot.count >= 3) {
        recs.push({
          id: `rec-room-${hotspot.room}`,
          priority: hotspot.count >= 5 ? 'critical' : 'high',
          area: `Room ${hotspot.room}`,
          title: `Room ${hotspot.room} has generated ${hotspot.count} complaints in 90 days`,
          detail: `Categories: ${hotspot.categories.join(', ')}. Recurring issues in a single room strongly suggest a physical or structural problem that periodic fixes haven't resolved.`,
          action: `Schedule a full room inspection and maintenance review for Room ${hotspot.room}. Consider taking it offline for a full refurbishment.`,
        });
      }
    }

    // Low satisfaction after resolution
    const catSats = new Map<string, number[]>();
    for (const c of curr90.filter(c => c.guest_satisfaction)) {
      if (!catSats.has(c.category)) catSats.set(c.category, []);
      catSats.get(c.category)!.push(c.guest_satisfaction as number);
    }
    for (const [cat, sats] of catSats) {
      const avgSat = avg(sats);
      if (avgSat !== null && avgSat < 3.5 && sats.length >= 2) {
        recs.push({
          id: `rec-sat-${cat}`,
          priority: avgSat < 2.5 ? 'critical' : 'medium',
          area: cat,
          title: `Post-resolution satisfaction for "${cat}" averages ${avgSat.toFixed(1)}/5`,
          detail: `Guests are not satisfied with how these complaints are being resolved. The issue may be fixed operationally but the recovery experience is falling short.`,
          action: `Review your recovery playbook for ${cat}. Train staff on service recovery language and consider more proactive compensation for this category.`,
        });
      }
    }

    // Worsening patterns
    for (const p of patterns.filter(p => p.status === 'worsening').slice(0, 2)) {
      recs.push({
        id: `rec-trend-${p.key}`,
        priority: 'high',
        area: `${p.dept} — ${p.category}`,
        title: `"${p.category}" in ${p.dept} is getting worse`,
        detail: `Volume increased from ${p.prev30} to ${p.curr30} complaints in the last 30 days. Without intervention this trend will continue.`,
        action: `Escalate to ${p.dept} department head. Request a root cause analysis and a written improvement plan within 1 week.`,
      });
    }

    // Deduplicate and sort
    const seen = new Set<string>();
    return recs
      .filter(r => { if (seen.has(r.id)) return false; seen.add(r.id); return true; })
      .sort((a, b) => {
        const order = { critical: 0, high: 1, medium: 2 };
        return order[a.priority] - order[b.priority];
      });
  }, [complaints, roomHotspots, patterns]);

  // ── Rendering helpers ─────────────────────────────────────────────

  const STATUS_CONFIG = {
    improving: { color: '#059669', bg: 'rgba(5,150,105,0.08)', icon: '↗', label: 'Improving' },
    worsening: { color: '#DC2626', bg: 'rgba(220,38,38,0.08)', icon: '↘', label: 'Worsening' },
    stable:    { color: '#D97706', bg: 'rgba(217,119,6,0.08)', icon: '→', label: 'Stable' },
    new:       { color: '#7C3AED', bg: 'rgba(124,58,237,0.08)',icon: '★', label: 'New Issue' },
    resolved:  { color: '#6B7280', bg: 'rgba(107,114,128,0.08)', icon: '✓', label: 'Resolved' },
  };

  const PRIORITY_CONFIG = {
    critical: { color: '#7C3AED', bg: 'rgba(124,58,237,0.08)', border: '#8B5CF6', label: 'Critical' },
    high:     { color: '#DC2626', bg: 'rgba(220,38,38,0.08)',  border: '#EF4444', label: 'High' },
    medium:   { color: '#D97706', bg: 'rgba(217,119,6,0.08)',  border: '#F59E0B', label: 'Medium' },
  };

  function TrendBadge({ curr, prev, wantDown, unit }: { curr: number; prev: number; wantDown: boolean; unit: string }) {
    if (prev === 0) return <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>No prior data</span>;
    const pct = ((curr - prev) / prev) * 100;
    const improved = wantDown ? pct < 0 : pct > 0;
    const color = Math.abs(pct) < 5 ? '#6B7280' : improved ? '#059669' : '#DC2626';
    return (
      <span style={{ fontSize: 12, fontWeight: 600, color }}>
        {pct > 0 ? '+' : ''}{pct.toFixed(0)}% vs prev 30d
      </span>
    );
  }

  function MomRow({ label, data, format }: {
    label: string;
    data: { curr: number; prev: number; unit: string; wantDown: boolean };
    format: (n: number) => string;
  }) {
    const pct = data.prev > 0 ? ((data.curr - data.prev) / data.prev) * 100 : 0;
    const improved = data.wantDown ? pct < -2 : pct > 2;
    const neutral  = Math.abs(pct) <= 2;
    const color = neutral ? '#6B7280' : improved ? '#059669' : '#DC2626';
    const arrow = neutral ? '→' : (data.wantDown ? (pct < 0 ? '↓' : '↑') : (pct > 0 ? '↑' : '↓'));
    return (
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 100px 100px 130px', gap: 12, padding: '14px 20px', borderBottom: '1px solid var(--border)', alignItems: 'center' }}>
        <div style={{ fontSize: 14, fontWeight: 500 }}>{label}</div>
        <div style={{ fontSize: 14, color: 'var(--text-muted)', textAlign: 'right' }}>{format(data.prev)}</div>
        <div style={{ fontSize: 14, fontWeight: 700, textAlign: 'right' }}>{format(data.curr)}</div>
        <div style={{ textAlign: 'right' }}>
          <span style={{ fontSize: 13, fontWeight: 700, color, background: neutral ? 'rgba(107,114,128,0.08)' : improved ? 'rgba(5,150,105,0.08)' : 'rgba(220,38,38,0.08)', padding: '3px 10px', borderRadius: 6 }}>
            {arrow} {Math.abs(pct).toFixed(0)}% {improved ? '✓' : neutral ? '' : '⚠'}
          </span>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--off-white)', paddingTop: 88 }}>
      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '32px 24px 64px' }}>

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 32, flexWrap: 'wrap', gap: 16 }}>
          <div>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: 4 }}>Continuous Improvement</h1>
            <p style={{ fontSize: 14, color: 'var(--text-muted)' }}>
              Recurring issue detection, period-over-period trend tracking, and operational recommendations derived from complaint patterns.
            </p>
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <a href="/analytics" style={{ padding: '9px 18px', border: '2px solid var(--border)', color: 'var(--text-muted)', borderRadius: 8, fontWeight: 600, fontSize: 13, textDecoration: 'none' }}>Analytics ↗</a>
            <a href="/complaints" style={{ padding: '9px 18px', border: '2px solid var(--gold)', color: 'var(--gold-dark)', borderRadius: 8, fontWeight: 600, fontSize: 13, textDecoration: 'none' }}>All Complaints ↗</a>
          </div>
        </div>

        {/* ── Section 1: Recurring issue tracker ── */}
        <div style={{ marginBottom: 24 }}>
          <div style={{ marginBottom: 16 }}>
            <h2 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: 4 }}>Recurring Issue Tracker</h2>
            <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>
              Every (department × category) combination with 2+ complaints in 90 days, tracked across consecutive 30-day periods.
            </p>
          </div>

          {patterns.length === 0 ? (
            <div style={{ background: 'white', borderRadius: 12, padding: 32, boxShadow: 'var(--shadow)', textAlign: 'center' }}>
              <div style={{ fontSize: 32, marginBottom: 12 }}>✅</div>
              <p style={{ fontWeight: 700, fontSize: 15, marginBottom: 6 }}>No recurring issues detected.</p>
              <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>No (department × category) pair has appeared more than once in the last 90 days.</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 16 }}>
              {patterns.map(p => {
                const st = STATUS_CONFIG[p.status];
                const volPct = trendPct(p.curr30, p.prev30);
                const satPct = p.currSat !== null && p.prevSat !== null ? p.currSat - p.prevSat : null;
                const resPct = p.currResTime !== null && p.prevResTime !== null ? p.currResTime - p.prevResTime : null;
                return (
                  <div key={p.key} style={{ background: 'white', borderRadius: 12, padding: 24, boxShadow: 'var(--shadow)', borderLeft: `4px solid ${st.color}` }}>
                    {/* Header */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: 15 }}>{p.category}</div>
                        <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 3 }}>{p.dept}</div>
                      </div>
                      <span style={{ fontSize: 11, fontWeight: 700, padding: '4px 10px', borderRadius: 6, background: st.bg, color: st.color, whiteSpace: 'nowrap' }}>
                        {st.icon} {st.label}
                      </span>
                    </div>

                    {/* Metric grid */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginBottom: 14 }}>
                      {/* Volume */}
                      <div style={{ background: 'var(--off-white)', borderRadius: 8, padding: '10px 12px' }}>
                        <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-muted)', marginBottom: 4 }}>Volume (30d)</div>
                        <div style={{ fontSize: '1.5rem', fontWeight: 800, color: p.curr30 > p.prev30 ? 'var(--danger)' : 'var(--success)' }}>{p.curr30}</div>
                        {volPct !== null && (
                          <div style={{ fontSize: 11, fontWeight: 600, color: volPct > 0 ? 'var(--danger)' : 'var(--success)', marginTop: 2 }}>
                            {volPct > 0 ? '↑' : '↓'} {Math.abs(volPct).toFixed(0)}% vs prev
                          </div>
                        )}
                        {p.prev30 === 0 && <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>New this period</div>}
                      </div>

                      {/* Resolution time */}
                      <div style={{ background: 'var(--off-white)', borderRadius: 8, padding: '10px 12px' }}>
                        <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-muted)', marginBottom: 4 }}>Avg Res. Time</div>
                        <div style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--navy)' }}>
                          {p.currResTime !== null ? fmtHours(p.currResTime) : '—'}
                        </div>
                        {resPct !== null && (
                          <div style={{ fontSize: 11, fontWeight: 600, color: resPct < 0 ? 'var(--success)' : 'var(--danger)', marginTop: 2 }}>
                            {resPct < 0 ? '↓' : '↑'} {Math.abs(resPct).toFixed(1)}h
                          </div>
                        )}
                      </div>

                      {/* Satisfaction */}
                      <div style={{ background: 'var(--off-white)', borderRadius: 8, padding: '10px 12px' }}>
                        <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-muted)', marginBottom: 4 }}>Post-Res Sat</div>
                        <div style={{ fontSize: '1.2rem', fontWeight: 800, color: p.currSat !== null ? (p.currSat >= 4 ? 'var(--success)' : p.currSat >= 3 ? '#D97706' : 'var(--danger)') : 'var(--text-muted)' }}>
                          {p.currSat !== null ? `${p.currSat.toFixed(1)}/5` : '—'}
                        </div>
                        {satPct !== null && (
                          <div style={{ fontSize: 11, fontWeight: 600, color: satPct > 0 ? 'var(--success)' : 'var(--danger)', marginTop: 2 }}>
                            {satPct > 0 ? '↑' : '↓'} {Math.abs(satPct).toFixed(1)} pts
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Footer */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'var(--text-muted)' }}>
                      <span>{p.curr90} total in 90d</span>
                      {p.unresolvedCurr > 0 && <span style={{ color: 'var(--danger)', fontWeight: 600 }}>⚠ {p.unresolvedCurr} still open</span>}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* ── Section 2: Room hotspots ── */}
        {roomHotspots.length > 0 && (
          <div style={{ marginBottom: 24 }}>
            <div style={{ marginBottom: 16 }}>
              <h2 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: 4 }}>Room-Level Hotspots</h2>
              <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>
                Rooms generating 2+ complaints in 90 days — indicative of structural or physical issues that require maintenance intervention.
              </p>
            </div>
            <div style={{ background: 'white', borderRadius: 12, boxShadow: 'var(--shadow)', overflow: 'hidden' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '80px 1fr 120px 80px 160px', gap: 0, padding: '10px 20px', background: 'var(--off-white)', borderBottom: '1px solid var(--border)' }}>
                {['Room', 'Categories', 'Department', 'Count', 'Last Complaint'].map(h => (
                  <div key={h} style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-muted)' }}>{h}</div>
                ))}
              </div>
              {roomHotspots.map(h => (
                <div key={h.room} style={{ display: 'grid', gridTemplateColumns: '80px 1fr 120px 80px 160px', gap: 0, padding: '14px 20px', borderBottom: '1px solid var(--border)', alignItems: 'center' }}>
                  <div style={{ fontWeight: 800, fontSize: 16 }}>
                    {h.room}
                    {h.hasOpen && <span style={{ display: 'block', fontSize: 10, fontWeight: 700, color: 'var(--danger)' }}>OPEN</span>}
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                    {h.categories.map(cat => (
                      <span key={cat} style={{ fontSize: 11, padding: '2px 7px', borderRadius: 4, background: 'var(--off-white)', border: '1px solid var(--border)' }}>{cat}</span>
                    ))}
                  </div>
                  <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>{h.dept}</div>
                  <div style={{ fontSize: '1.4rem', fontWeight: 800, color: h.count >= 4 ? 'var(--danger)' : '#D97706' }}>{h.count}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                    {new Date(h.lastSeen).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Section 3: Month-over-month scorecard ── */}
        <div style={{ marginBottom: 24 }}>
          <div style={{ marginBottom: 16 }}>
            <h2 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: 4 }}>Month-over-Month Improvement Scorecard</h2>
            <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>Last 30 days vs. the prior 30-day period. Green = moving in the right direction.</p>
          </div>
          <div style={{ background: 'white', borderRadius: 12, boxShadow: 'var(--shadow)', overflow: 'hidden' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 100px 100px 130px', gap: 12, padding: '10px 20px', background: 'var(--off-white)', borderBottom: '1px solid var(--border)' }}>
              {['KPI', 'Prev 30d', 'Last 30d', 'Trend'].map(h => (
                <div key={h} style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-muted)', textAlign: h === 'Trend' || h === 'Last 30d' || h === 'Prev 30d' ? 'right' : 'left' }}>{h}</div>
              ))}
            </div>
            <MomRow label="Total Complaints"          data={scorecard.volume}       format={n => `${n}`} />
            <MomRow label="Avg. Resolution Time"      data={scorecard.resTime}      format={n => n > 0 ? fmtHours(n) : '—'} />
            <MomRow label="Resolution Rate"           data={scorecard.resRate}      format={n => `${n.toFixed(0)}%`} />
            <MomRow label="Avg. Post-Resolution Sat." data={scorecard.satisfaction} format={n => n > 0 ? `${n.toFixed(1)}/5` : '—'} />
          </div>
        </div>

        {/* ── Section 4: Operational recommendations ── */}
        <div>
          <div style={{ marginBottom: 16 }}>
            <h2 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: 4 }}>Operational Recommendations</h2>
            <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>
              Auto-generated from complaint patterns — sorted by priority. Each recommendation is derived from observed data, not assumptions.
            </p>
          </div>

          {recommendations.length === 0 ? (
            <div style={{ background: 'white', borderRadius: 12, padding: 32, boxShadow: 'var(--shadow)', textAlign: 'center' }}>
              <div style={{ fontSize: 32, marginBottom: 12 }}>🏆</div>
              <p style={{ fontWeight: 700, fontSize: 15, marginBottom: 6 }}>No recommendations at this time.</p>
              <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>Your complaint patterns don't currently indicate any systemic issues requiring action.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {recommendations.map(rec => {
                const pc = PRIORITY_CONFIG[rec.priority];
                return (
                  <div key={rec.id} style={{ background: 'white', borderRadius: 12, padding: 24, boxShadow: 'var(--shadow)', borderLeft: `4px solid ${pc.border}`, display: 'grid', gridTemplateColumns: '1fr auto', gap: 20, alignItems: 'flex-start' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                        <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 9px', borderRadius: 5, background: pc.bg, color: pc.color }}>{pc.label}</span>
                        <span style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 500 }}>{rec.area}</span>
                      </div>
                      <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 6 }}>{rec.title}</div>
                      <p style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.6, margin: '0 0 10px' }}>{rec.detail}</p>
                      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8, background: 'var(--off-white)', borderRadius: 8, padding: '10px 14px' }}>
                        <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--gold-dark)', flexShrink: 0 }}>→ Action:</span>
                        <span style={{ fontSize: 13, color: 'var(--text)', lineHeight: 1.5 }}>{rec.action}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
