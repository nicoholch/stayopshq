'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { Hotel } from '@/types';

// These types are kept local — the public page pre-dates the complaint pivot
// and will need to be redesigned separately.
type Sentiment = 'positive' | 'neutral' | 'negative';
interface DepartmentScore { department: string; avg_rating: number; response_count: number; }
interface FeedbackEntry { id: string; hotel_id: string; department: string; answer: string | null; rating: number | null; sentiment: Sentiment | null; flagged: boolean; created_at: string; }

interface Props {
  hotel: Hotel;
  deptScores: DepartmentScore[];
  initialReviews: FeedbackEntry[];
  todayCount: number;
  monthlyCount: number;
  avgScore: string | null;
}

const SENTIMENT_COLOR: Record<Sentiment, string> = {
  positive: 'var(--success)',
  neutral: 'var(--warning)',
  negative: 'var(--danger)',
};

const SCORE_COLOR = (s: number) => s >= 4.5 ? 'var(--success)' : s >= 3.5 ? 'var(--warning)' : 'var(--danger)';

export default function PublicPageClient({ hotel, deptScores, initialReviews, todayCount, monthlyCount, avgScore }: Props) {
  const [reviews, setReviews] = useState<FeedbackEntry[]>(initialReviews);
  const [liveCount, setLiveCount] = useState(todayCount);

  // Subscribe for new public-visible feedback
  useEffect(() => {
    const supabase = createClient();
    const channel = supabase
      .channel(`public:${hotel.id}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'feedback',
        filter: `hotel_id=eq.${hotel.id}`,
      }, (payload) => {
        const f = payload.new as FeedbackEntry;
        // Only show non-flagged responses with text content
        if (!f.flagged && f.answer && f.answer.length > 10) {
          setReviews(prev => [f, ...prev].slice(0, 30));
        }
        setLiveCount(c => c + 1);
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [hotel.id]);

  return (
    <div style={{ background: 'var(--white)', minHeight: '100vh' }}>

      {/* Hero */}
      <section style={{
        background: 'linear-gradient(135deg, var(--navy) 0%, var(--navy-mid) 100%)',
        padding: '120px 0 80px',
        textAlign: 'center',
      }}>
        <div className="container">
          <span style={{ display: 'inline-block', padding: '6px 16px', borderRadius: 999, fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', background: 'rgba(201,168,76,0.15)', color: 'var(--gold)', border: '1px solid rgba(201,168,76,0.3)', marginBottom: 16 }}>
            Live Guest Sentiment
          </span>
          <h1 style={{ color: 'white', fontSize: 'clamp(2rem, 5vw, 3.2rem)', fontWeight: 900, marginBottom: 16 }}>
            {hotel.name}
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: '1.1rem', maxWidth: 520, margin: '0 auto 48px' }}>
            Real-time satisfaction scores captured during guest stays — not weeks later.
          </p>

          {/* Score ring */}
          <div style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', width: 160, height: 160, borderRadius: '50%', border: '6px solid var(--gold)', margin: '0 auto 48px', position: 'relative' }}>
            <span style={{ fontSize: '3rem', fontWeight: 900, color: 'var(--gold)', lineHeight: 1 }}>
              {avgScore ?? '—'}
            </span>
            <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.1em', marginTop: 4 }}>
              out of 5.0
            </span>
          </div>

          {/* Stats row */}
          <div style={{ display: 'flex', gap: 40, justifyContent: 'center', flexWrap: 'wrap' }}>
            {[
              { value: liveCount, label: 'Responses Today' },
              { value: monthlyCount.toLocaleString(), label: 'This Month' },
              { value: deptScores.length, label: 'Departments Tracked' },
            ].map(s => (
              <div key={s.label} style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--gold)' }}>{s.value}</div>
                <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>{s.label}</div>
              </div>
            ))}
          </div>

          <div style={{ marginTop: 28, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, fontSize: 12, color: 'rgba(255,255,255,0.35)' }}>
            <span style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--success)', display: 'inline-block', animation: 'pulse 1.5s infinite' }}></span>
            Scores update in real time as guests share feedback
          </div>
        </div>
      </section>

      {/* Department scores */}
      <section style={{ padding: '64px 0', background: 'var(--white)' }}>
        <div className="container">
          <h2 style={{ fontSize: '1.8rem', fontWeight: 800, textAlign: 'center', marginBottom: 12 }}>
            Satisfaction by Department
          </h2>
          <p style={{ textAlign: 'center', color: 'var(--text-muted)', marginBottom: 48 }}>
            Scores from verified in-stay feedback by current guests.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 20 }}>
            {deptScores.map(d => (
              <div key={d.department} style={{ background: 'var(--white)', borderRadius: 12, padding: 28, boxShadow: 'var(--shadow)', border: '1px solid var(--border)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 16 }}>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 15 }}>{d.department}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{d.response_count} responses</div>
                  </div>
                  <div style={{ marginLeft: 'auto', fontSize: '1.8rem', fontWeight: 800, color: SCORE_COLOR(d.avg_rating) }}>
                    {d.avg_rating.toFixed(1)}
                  </div>
                </div>
                <div style={{ height: 8, background: 'var(--border)', borderRadius: 4, overflow: 'hidden' }}>
                  <div style={{ height: '100%', borderRadius: 4, width: `${(d.avg_rating / 5) * 100}%`, background: SCORE_COLOR(d.avg_rating), transition: 'width 1s ease' }} />
                </div>
              </div>
            ))}
          </div>

          <div style={{ marginTop: 24, background: 'rgba(201,168,76,0.06)', border: '1px solid rgba(201,168,76,0.2)', borderRadius: 12, padding: 24, textAlign: 'center' }}>
            <p style={{ fontSize: 14, color: 'var(--text-muted)', maxWidth: 600, margin: '0 auto' }}>
              🔍 <strong>Why show all scores — even lower ones?</strong> We believe real-time transparency builds more trust than curated reviews. When a score dips, management is alerted immediately.
            </p>
          </div>
        </div>
      </section>

      {/* Live reviews */}
      <section style={{ padding: '64px 0', background: 'var(--off-white)' }}>
        <div className="container">
          <h2 style={{ fontSize: '1.8rem', fontWeight: 800, textAlign: 'center', marginBottom: 12 }}>
            What Guests Are Saying Right Now
          </h2>
          <p style={{ textAlign: 'center', color: 'var(--text-muted)', marginBottom: 48 }}>
            Anonymized verbatim responses captured during today's stays. No editing, no curation.
          </p>

          <div style={{ maxWidth: 760, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 16 }}>
            {reviews.length === 0 ? (
              <p style={{ textAlign: 'center', color: 'var(--text-muted)' }}>No responses yet today.</p>
            ) : (
              reviews.map(r => (
                <div key={r.id} style={{
                  background: 'white', borderRadius: 12, padding: 24,
                  boxShadow: 'var(--shadow)',
                  borderLeft: `4px solid ${SENTIMENT_COLOR[r.sentiment ?? 'neutral']}`,
                  display: 'flex', gap: 20, alignItems: 'flex-start',
                  animation: 'slideIn 0.4s ease',
                }}>
                  <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'rgba(201,168,76,0.1)', display: 'grid', placeItems: 'center', fontSize: 20, flexShrink: 0 }}>
                    {r.sentiment === 'positive' ? '😊' : r.sentiment === 'negative' ? '😞' : '😐'}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 8, marginBottom: 8 }}>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: 14 }}>Guest · {r.department}</div>
                      </div>
                      {r.rating && (
                        <div style={{ color: 'var(--gold)', letterSpacing: 2 }}>
                          {'★'.repeat(r.rating)}{'☆'.repeat(5 - r.rating)}
                        </div>
                      )}
                    </div>
                    <p style={{ fontSize: 14, lineHeight: 1.6, color: 'var(--text)' }}>"{r.answer}"</p>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 8 }}>
                      ⏱ {new Date(r.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </section>

      {/* Footer */}
      <section style={{ background: 'var(--navy)', padding: '48px 0', textAlign: 'center' }}>
        <div className="container">
          <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: 14, marginBottom: 16 }}>This sentiment page is powered by</p>
          <a href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 10, fontWeight: 800, fontSize: '1.3rem', color: 'white' }}>
            <span style={{ width: 32, height: 32, background: 'var(--gold)', borderRadius: 7, display: 'grid', placeItems: 'center', fontSize: 16 }}>⚡</span>
            Guest Ops HQ
          </a>
          <p style={{ color: 'rgba(255,255,255,0.25)', fontSize: 13, marginTop: 12 }}>Real-time in-stay feedback capture for luxury hospitality</p>
          <a href="/#pricing" style={{ display: 'inline-block', marginTop: 20, padding: '12px 28px', background: 'var(--gold)', color: 'var(--navy)', borderRadius: 8, fontWeight: 700, fontSize: 14 }}>
            Get This For Your Property
          </a>
        </div>
      </section>

      <style>{`
        @keyframes slideIn { from{opacity:0;transform:translateY(-10px)} to{opacity:1;transform:translateY(0)} }
        @keyframes pulse { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:0.5;transform:scale(1.3)} }
      `}</style>
    </div>
  );
}
