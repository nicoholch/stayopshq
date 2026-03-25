/**
 * /[slug] — Public hotel sentiment page
 * e.g. pulsestay.com/azure-resort
 *
 * This is a Server Component with:
 * - Dynamic SEO metadata per hotel (generateMetadata)
 * - Static generation with revalidation (ISR — updates every 5 min)
 * - Structured data (JSON-LD) for Google rich results
 */

import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { createAdminClient } from '@/lib/supabase/admin';
import PublicPageClient from './PublicPageClient';
import type { Hotel } from '@/types';

// These types are kept local — the public page pre-dates the complaint pivot
// and will need to be redesigned separately.
interface DepartmentScore { department: string; avg_rating: number; response_count: number; }
type Sentiment = 'positive' | 'neutral' | 'negative';
interface FeedbackEntry { id: string; hotel_id: string; department: string; answer: string | null; rating: number | null; sentiment: Sentiment | null; flagged: boolean; created_at: string; }

// Revalidate the page every 5 minutes (Incremental Static Regeneration)
export const revalidate = 300;

// ── Dynamic SEO per hotel ─────────────────────────────────────────────────────
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const supabase = createAdminClient();

  const { data: hotel } = await supabase
    .from('hotels')
    .select('name, slug')
    .eq('slug', slug)
    .eq('public_page_enabled', true)
    .single();

  if (!hotel) return { title: 'Hotel Not Found' };

  return {
    title: `${hotel.name} — Live Guest Satisfaction`,
    description: `See real-time guest satisfaction scores for ${hotel.name}. Feedback captured during stays — not weeks later. Powered by Guest Ops HQ.`,
    openGraph: {
      title: `${hotel.name} — Real-Time Guest Reviews`,
      description: `Live satisfaction scores from current guests at ${hotel.name}.`,
      type: 'website',
    },
  };
}

export default async function PublicHotelPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const supabase = createAdminClient();

  // Load hotel
  const { data: hotel } = await supabase
    .from('hotels')
    .select('*')
    .eq('slug', slug)
    .eq('public_page_enabled', true)
    .single();

  if (!hotel) notFound();

  const today = new Date().toISOString().split('T')[0];
  const monthStart = new Date();
  monthStart.setDate(1);
  const monthStartStr = monthStart.toISOString().split('T')[0];

  // Dept averages today
  const { data: deptScores } = await supabase
    .rpc('get_department_scores', { p_hotel_id: hotel.id, p_date: today });

  // Recent public-safe feedback (non-flagged, has text, last 30)
  const { data: reviews } = await supabase
    .from('feedback')
    .select('id, department, answer, rating, sentiment, created_at')
    .eq('hotel_id', hotel.id)
    .eq('flagged', false)
    .not('answer', 'is', null)
    .gte('answer', '20')           // skip very short answers
    .order('created_at', { ascending: false })
    .limit(30);

  // Monthly totals
  const { count: monthlyCount } = await supabase
    .from('feedback')
    .select('*', { count: 'exact', head: true })
    .eq('hotel_id', hotel.id)
    .gte('created_at', `${monthStartStr}T00:00:00`);

  const { count: todayCount } = await supabase
    .from('feedback')
    .select('*', { count: 'exact', head: true })
    .eq('hotel_id', hotel.id)
    .gte('created_at', `${today}T00:00:00`);

  // Overall avg
  const avgScore = (deptScores as DepartmentScore[])?.length
    ? ((deptScores as DepartmentScore[]).reduce((s: number, d: DepartmentScore) => s + d.avg_rating, 0) / (deptScores as DepartmentScore[]).length).toFixed(1)
    : null;

  // ── JSON-LD structured data (Google rich results) ──────────────────
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Hotel',
    name: hotel.name,
    aggregateRating: avgScore ? {
      '@type': 'AggregateRating',
      ratingValue: avgScore,
      bestRating: '5',
      reviewCount: String(monthlyCount ?? 0),
    } : undefined,
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <PublicPageClient
        hotel={hotel as Hotel}
        deptScores={(deptScores ?? []) as DepartmentScore[]}
        initialReviews={(reviews ?? []) as FeedbackEntry[]}
        todayCount={todayCount ?? 0}
        monthlyCount={monthlyCount ?? 0}
        avgScore={avgScore}
      />
    </>
  );
}
