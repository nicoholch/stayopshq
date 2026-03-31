'use client';

import { useMemo, useState } from 'react';
import type { Complaint } from '@/types';
import AppNav from '@/app/components/AppNav';

interface Props {
  complaints: Complaint[];
}

type Period = 'today' | 'week' | 'month' | '90d';

const PERIOD_LABELS: Record<Period, string> = {
  today: 'Today', week: 'This Week', month: 'This Month', '90d': 'Last 90 Days',
};

const SAT_LABELS: Record<number, string> = {
  1: 'Unsatisfied', 2: 'Dissatisfied', 3: 'Neutral', 4: 'Satisfied', 5: 'Very Satisfied',
};
const SAT_COLORS: Record<number, string> = {
  1: '#EF4444', 2: '#F97316', 3: '#EAB308', 4: '#22C55E', 5: '#059669',
};

// ── KPI computation helpers ───────────────────────────────────────────────────

function periodCutoff(period: Period): Date {
  const now = new Date();
  if (period === 'today') return new Date(now.getFullYear(), now.getMonth(), now.getDate());
  if (period === 'week')  { const d = new Date(now); d.setDate(d.getDate() - 7);  return d; }
  if (period === 'month') { const d = new Date(now); d.setDate(d.getDate() - 30); return d; }
  /* 90d */               { const d = new Date(now); d.setDate(d.getDate() - 90); return d; }
}

function prevPeriodCutoff(period: Period): Date {
  const cut = periodCutoff(period);
  const span = Date.now() - cut.getTime();
  return new Date(cut.getTime() - span);
}

function resolutionHours(c: Complaint): number | null {
  if (!c.resolved_at) return null;
  return (new Date(c.resolved_at).getTime() - new Date(c.created_at).getTime()) / 3_600_000;
}

function avgOrNull(nums: number[]): number | null {
  if (!nums.length) return null;
  return nums.reduce((a, b) => a + b, 0) / nums.length;
}

function fmtHours(h: number): string {
  if (h < 1)   return `${Math.round(h * 60)}m`;
  if (h < 24)  return `${h.toFixed(1)}h`;
  return `${(h / 24).toFixed(1)}d`;
}

function countBy<T>(arr: T[], key: (item: T) => string): [string, number][] {
  const map = new Map<string, number>();
  for (const item of arr) {
    const k = key(item);
    map.set(k, (map.get(k) ?? 0) + 1);
  }
  return [...map.entries()].sort((a, b) => b[1] - a[1]);
}

// ── Bar chart component ───────────────────────────────────────────────────────

function BarChart({ data, color, suffix = '', maxOverride }: {
  data: [string, number][]; color: string; suffix?: string; maxOverride?: number;
}) {
  const max = maxOverride ?? Math.max(...data.map(d => d[1]), 1);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {data.map(([label, value]) => (
        <div key={label}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 4 }}>
            <span style={{ fontWeight: 500 }}>{label}</span>
            <span style={{ fontWeight: 700, color }}>{value}{suffix}</span>
          </div>
          <div style={{ height: 8, background: 'var(--border)', borderRadius: 4, overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${(value / max) * 100}%`, background: color, borderRadius: 4, transition: 'width 0.6s ease' }} />
          </div>
        </div>
      ))}
      {data.length === 0 && <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>No data for this period.</p>}
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export default function AnalyticsClient({ complaints }: Props) {
  const [period, setPeriod] = useState<Period>('month');

  const { current, previous, allResolved } = useMemo(() => {
    const cut     = periodCutoff(period);
    const prevCut = prevPeriodCutoff(period);
    return {
      current:     complaints.filter(c => new Date(c.created_at) >= cut),
      previous:    complaints.filter(c => new Date(c.created_at) >= prevCut && new Date(c.created_at) < cut),
      allResolved: complaints.filter(c => c.status === 'resolved' && c.resolved_at),
    };
  }, [complaints, period]);

  // ── Core KPIs ─────────────────────────────────────────────────────
  const kpis = useMemo(() => {
    const resolved   = current.filter(c => c.status === 'resolved' && c.resolved_at);
    const resTimes   = resolved.map(resolutionHours).filter((h): h is number => h !== null);
    const avgResTime = avgOrNull(resTimes);

    // Repeat issue rate: categories that appear more than once in this period
    const catCounts = countBy(current, c => c.category);
    const repeatCats = catCounts.filter(([, n]) => n > 1);
    const repeatCount = current.filter(c => (catCounts.find(([k]) => k === c.category)?.[1] ?? 0) > 1).length;
    const repeatRate = current.length > 0 ? (repeatCount / current.length) * 100 : 0;

    const satScores = resolved.filter(c => c.guest_satisfaction).map(c => c.guest_satisfaction as number);
    const avgSat    = avgOrNull(satScores);

    const prevResolved = previous.filter(c => c.status === 'resolved');

    return { resolved, resTimes, avgResTime, repeatCats, repeatRate, satScores, avgSat, prevResolved };
  }, [current, previous]);

  // ── Frequency breakdowns ───────────────────────────────────────────
  const byCat  = useMemo(() => countBy(current, c => c.category),   [current]);
  const byDept = useMemo(() => countBy(current, c => c.department), [current]);

  // ── Resolution time by severity ───────────────────────────────────
  const resBySeV = useMemo(() => {
    const sevs = ['critical', 'high', 'medium', 'low'] as const;
    return sevs.map(sev => {
      const times = current.filter(c => c.severity === sev && c.resolved_at)
        .map(resolutionHours).filter((h): h is number => h !== null);
      return [sev.charAt(0).toUpperCase() + sev.slice(1), avgOrNull(times)] as [string, number | null];
    }).filter(([, v]) => v !== null) as [string, number][];
  }, [current]);

  // ── Resolution time by department ─────────────────────────────────
  const resByDept = useMemo(() => {
    const depts = [...new Set(current.map(c => c.department))];
    return depts.map(dept => {
      const times = current.filter(c => c.department === dept && c.resolved_at)
        .map(resolutionHours).filter((h): h is number => h !== null);
      const avg = avgOrNull(times);
      return [dept, avg] as [string, number | null];
    }).filter(([, v]) => v !== null)
      .sort((a, b) => (b[1] as number) - (a[1] as number)) as [string, number][];
  }, [current]);

  // ── Satisfaction by category ───────────────────────────────────────
  const satByCat = useMemo(() => {
    const cats = [...new Set(current.filter(c => c.guest_satisfaction).map(c => c.category))];
    return cats.map(cat => {
      const scores = current.filter(c => c.category === cat && c.guest_satisfaction).map(c => c.guest_satisfaction as number);
      return [cat, avgOrNull(scores) ?? 0] as [string, number];
    }).sort((a, b) => b[1] - a[1]);
  }, [current]);

  // ── Satisfaction distribution (1–5) ───────────────────────────────
  const satDist = useMemo(() => {
    return [5, 4, 3, 2, 1].map(score => ({
      score,
      count: kpis.satScores.filter(s => s === score).length,
    }));
  }, [kpis.satScores]);

  // ── Daily trend (last 30 days) ────────────────────────────────────
  const dailyTrend = useMemo(() => {
    const days = Array.from({ length: 30 }, (_, i) => {
      const d = new Date(Date.now() - (29 - i) * 86400000);
      const key = d.toISOString().split('T')[0];
      return { key, label: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) };
    });
    return days.map(({ key, label }) => ({
      label,
      count: complaints.filter(c => c.created_at.startsWith(key)).length,
    }));
  }, [complaints]);

  const maxDaily = Math.max(...dailyTrend.map(d => d.count), 1);

  // ── Trend arrow ───────────────────────────────────────────────────
  const trendArrow = (curr: number, prev: number) => {
    if (prev === 0) return null;
    const pct = Math.round(((curr - prev) / prev) * 100);
    const up = pct > 0;
    return <span style={{ fontSize: 12, color: up ? 'var(--danger)' : 'var(--success)', marginLeft: 6 }}>{up ? '↑' : '↓'} {Math.abs(pct)}% vs prev period</span>;
  };

  // ── Panel wrapper ─────────────────────────────────────────────────
  const Panel = ({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) => (
    <div style={{ background: 'white', borderRadius: 12, padding: 28, boxShadow: 'var(--shadow)' }}>
      <div style={{ marginBottom: 20 }}>
        <h3 style={{ fontSize: '0.95rem', fontWeight: 700, margin: 0 }}>{title}</h3>
        {subtitle && <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>{subtitle}</p>}
      </div>
      {children}
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', background: 'var(--off-white)', paddingTop: 72 }}>
      <AppNav />
      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '32px 24px 64px' }}>

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28, flexWrap: 'wrap', gap: 16 }}>
          <div>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: 4 }}>Guest Opportunity Analytics & KPIs</h1>
            <p style={{ fontSize: 14, color: 'var(--text-muted)' }}>Frequency, resolution time, repeat issues, and guest satisfaction — by category, department, and time period.</p>
          </div>
          {/* Period tabs */}
          <div style={{ display: 'flex', gap: 4, background: 'white', borderRadius: 10, padding: 4, boxShadow: 'var(--shadow)' }}>
            {(Object.entries(PERIOD_LABELS) as [Period, string][]).map(([key, label]) => (
              <button key={key} onClick={() => setPeriod(key)} style={{
                padding: '7px 16px', borderRadius: 7, border: 'none', fontWeight: 600, fontSize: 13, cursor: 'pointer',
                background: period === key ? 'var(--navy)' : 'transparent',
                color: period === key ? 'white' : 'var(--text-muted)',
                transition: 'all 0.15s',
              }}>{label}</button>
            ))}
          </div>
        </div>

        {/* ── KPI Summary strip ── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 24 }}>
          {[
            {
              label: 'Total Guest Opportunities',
              value: current.length,
              sub: trendArrow(current.length, previous.length),
              color: current.length > 0 ? 'var(--danger)' : 'var(--success)',
            },
            {
              label: 'Avg. Resolution Time',
              value: kpis.avgResTime !== null ? fmtHours(kpis.avgResTime) : '—',
              sub: <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{kpis.resolved.length} resolved in period</span>,
              color: 'var(--navy)',
            },
            {
              label: 'Repeat Issue Rate',
              value: `${kpis.repeatRate.toFixed(0)}%`,
              sub: <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{kpis.repeatCats.length} repeat categor{kpis.repeatCats.length !== 1 ? 'ies' : 'y'}</span>,
              color: kpis.repeatRate > 40 ? 'var(--danger)' : kpis.repeatRate > 20 ? '#D97706' : 'var(--success)',
            },
            {
              label: 'Avg. Post-Resolution Satisfaction',
              value: kpis.avgSat !== null ? `${kpis.avgSat.toFixed(1)} / 5` : '—',
              sub: <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{kpis.satScores.length} scored responses</span>,
              color: kpis.avgSat !== null ? (kpis.avgSat >= 4 ? 'var(--success)' : kpis.avgSat >= 3 ? '#D97706' : 'var(--danger)') : 'var(--text-muted)',
            },
          ].map(k => (
            <div key={k.label} style={{ background: 'white', borderRadius: 12, padding: '20px 24px', boxShadow: 'var(--shadow)' }}>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 500, marginBottom: 6 }}>{k.label}</div>
              <div style={{ fontSize: '1.9rem', fontWeight: 800, color: k.color, marginBottom: 4 }}>{k.value}</div>
              <div>{k.sub}</div>
            </div>
          ))}
        </div>

        {/* ── Row 1: Frequency ── */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 }}>
          <Panel title="Guest Opportunity Frequency by Category" subtitle={`${current.length} guest opportunities — ${PERIOD_LABELS[period].toLowerCase()}`}>
            <BarChart data={byCat} color="var(--danger)" />
          </Panel>
          <Panel title="Guest Opportunity Frequency by Department" subtitle={`${PERIOD_LABELS[period]} · sorted by volume`}>
            <BarChart data={byDept} color="#7C3AED" />
          </Panel>
        </div>

        {/* ── Row 2: Resolution time ── */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 }}>
          <Panel title="Avg. Resolution Time by Severity" subtitle="Lower is better">
            {resBySeV.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {resBySeV.map(([sev, hours]) => {
                  const colors: Record<string, string> = { Critical: '#7C3AED', High: '#DC2626', Medium: '#D97706', Low: '#6B7280' };
                  const maxH = Math.max(...resBySeV.map(([, h]) => h), 1);
                  return (
                    <div key={sev}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 4 }}>
                        <span style={{ fontWeight: 500 }}>{sev}</span>
                        <span style={{ fontWeight: 700, color: colors[sev] }}>{fmtHours(hours)}</span>
                      </div>
                      <div style={{ height: 8, background: 'var(--border)', borderRadius: 4, overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: `${(hours / maxH) * 100}%`, background: colors[sev], borderRadius: 4, transition: 'width 0.6s ease' }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>No resolved guest opportunities in this period.</p>}
          </Panel>

          <Panel title="Avg. Resolution Time by Department" subtitle="Departments with slowest resolution at top">
            <BarChart
              data={resByDept.map(([d, h]) => [d, parseFloat(h.toFixed(1))])}
              color="#0891B2"
              suffix="h"
              maxOverride={Math.max(...resByDept.map(([, h]) => h), 1)}
            />
          </Panel>
        </div>

        {/* ── Row 3: Repeat issues ── */}
        <div style={{ marginBottom: 20 }}>
          <Panel
            title="Repeat Issue Rate"
            subtitle="Categories with 2+ guest opportunities in the selected period — indicates systemic problems requiring process change"
          >
            {kpis.repeatCats.length === 0 ? (
              <p style={{ color: 'var(--success)', fontSize: 14, fontWeight: 600 }}>✓ No repeat issues in this period.</p>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 14 }}>
                {kpis.repeatCats.map(([cat, count]) => {
                  const dept = current.find(c => c.category === cat)?.department ?? '';
                  const resolved = current.filter(c => c.category === cat && c.status === 'resolved').length;
                  const open     = count - resolved;
                  const severity = count >= 5 ? 'Critical' : count >= 3 ? 'High' : 'Medium';
                  const sevColor = count >= 5 ? '#7C3AED' : count >= 3 ? '#DC2626' : '#D97706';
                  const sevBg    = count >= 5 ? 'rgba(124,58,237,0.08)' : count >= 3 ? 'rgba(220,38,38,0.08)' : 'rgba(217,119,6,0.08)';
                  return (
                    <div key={cat} style={{ border: '1.5px solid var(--border)', borderRadius: 10, padding: '16px 18px', borderLeft: `4px solid ${sevColor}` }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                        <div style={{ fontWeight: 700, fontSize: 14 }}>{cat}</div>
                        <span style={{ fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 4, background: sevBg, color: sevColor }}>{severity}</span>
                      </div>
                      <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 10 }}>{dept}</div>
                      <div style={{ display: 'flex', gap: 16, fontSize: 13 }}>
                        <div><span style={{ fontWeight: 800, fontSize: '1.4rem', color: sevColor }}>{count}</span> <span style={{ color: 'var(--text-muted)' }}>total</span></div>
                        <div><span style={{ fontWeight: 700, color: 'var(--danger)' }}>{open}</span> <span style={{ color: 'var(--text-muted)' }}>open</span></div>
                        <div><span style={{ fontWeight: 700, color: 'var(--success)' }}>{resolved}</span> <span style={{ color: 'var(--text-muted)' }}>resolved</span></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </Panel>
        </div>

        {/* ── Row 4: Satisfaction ── */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 }}>
          <Panel title="Post-Resolution Satisfaction by Category" subtitle="Average score (1–5) after guest opportunity resolution">
            {satByCat.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {satByCat.map(([cat, avg]) => (
                  <div key={cat}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 4 }}>
                      <span style={{ fontWeight: 500 }}>{cat}</span>
                      <span style={{ fontWeight: 700, color: avg >= 4 ? 'var(--success)' : avg >= 3 ? '#D97706' : 'var(--danger)' }}>
                        {avg.toFixed(1)} — {SAT_LABELS[Math.round(avg)]}
                      </span>
                    </div>
                    <div style={{ height: 8, background: 'var(--border)', borderRadius: 4, overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${(avg / 5) * 100}%`, borderRadius: 4, transition: 'width 0.6s ease', background: avg >= 4 ? 'var(--success)' : avg >= 3 ? '#EAB308' : 'var(--danger)' }} />
                    </div>
                  </div>
                ))}
              </div>
            ) : <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>No resolved guest opportunities with satisfaction scores in this period.</p>}
          </Panel>

          <Panel title="Satisfaction Score Distribution" subtitle="How guests rated their experience after resolution">
            {satDist.some(d => d.count > 0) ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {satDist.map(({ score, count }) => {
                  const total = kpis.satScores.length;
                  const pct = total > 0 ? Math.round((count / total) * 100) : 0;
                  return (
                    <div key={score}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 4, alignItems: 'center' }}>
                        <span style={{ fontWeight: 500, display: 'flex', gap: 8, alignItems: 'center' }}>
                          <span style={{ width: 10, height: 10, borderRadius: '50%', background: SAT_COLORS[score], display: 'inline-block' }} />
                          {score} — {SAT_LABELS[score]}
                        </span>
                        <span style={{ color: 'var(--text-muted)' }}>{count} <span style={{ fontWeight: 700, color: SAT_COLORS[score] }}>({pct}%)</span></span>
                      </div>
                      <div style={{ height: 8, background: 'var(--border)', borderRadius: 4, overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: `${pct}%`, background: SAT_COLORS[score], borderRadius: 4, transition: 'width 0.6s ease' }} />
                      </div>
                    </div>
                  );
                })}
                <div style={{ marginTop: 8, paddingTop: 12, borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                  <span style={{ color: 'var(--text-muted)' }}>Overall average</span>
                  <span style={{ fontWeight: 700, color: kpis.avgSat !== null ? (kpis.avgSat >= 4 ? 'var(--success)' : kpis.avgSat >= 3 ? '#D97706' : 'var(--danger)') : 'var(--text-muted)' }}>
                    {kpis.avgSat !== null ? `${kpis.avgSat.toFixed(2)} / 5` : '—'}
                  </span>
                </div>
              </div>
            ) : <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>No satisfaction scores recorded for resolved guest opportunities in this period.</p>}
          </Panel>
        </div>

        {/* ── Daily Trend (last 30 days) ── */}
        <Panel title="Daily Guest Opportunity Volume — Last 30 Days" subtitle="Each bar = one day. Hover for date.">
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 3, height: 80, overflowX: 'auto' }}>
            {dailyTrend.map(({ label, count }) => (
              <div key={label} title={`${label}: ${count} guest opportunit${count !== 1 ? 'ies' : 'y'}`} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: '0 0 auto', width: 24, gap: 3 }}>
                <div style={{
                  width: '100%', height: count > 0 ? `${Math.max((count / maxDaily) * 64, 4)}px` : 4,
                  background: count === 0 ? 'var(--border)' : count >= 3 ? 'var(--danger)' : count >= 2 ? '#F59E0B' : 'var(--navy)',
                  borderRadius: '3px 3px 0 0',
                  transition: 'height 0.4s ease',
                  cursor: 'default',
                }} />
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6, fontSize: 11, color: 'var(--text-muted)' }}>
            <span>{dailyTrend[0]?.label}</span>
            <span>{dailyTrend[14]?.label}</span>
            <span>{dailyTrend[29]?.label}</span>
          </div>
          {/* Legend */}
          <div style={{ display: 'flex', gap: 16, marginTop: 12, fontSize: 11, color: 'var(--text-muted)' }}>
            {[
              { color: 'var(--border)', label: 'None' },
              { color: 'var(--navy)', label: '1' },
              { color: '#F59E0B', label: '2' },
              { color: 'var(--danger)', label: '3+' },
            ].map(l => (
              <span key={l.label} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <span style={{ width: 10, height: 10, borderRadius: 2, background: l.color, display: 'inline-block' }} />
                {l.label}
              </span>
            ))}
          </div>
        </Panel>

      </div>
    </div>
  );
}
