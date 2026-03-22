import { Metadata } from 'next';
import ImprovementsClient from './ImprovementsClient';
import type { Complaint } from '@/types';

export const metadata: Metadata = {
  title: 'Continuous Improvement',
  robots: { index: false, follow: false },
};

// ── Demo dataset — reuses same 38-complaint set as analytics ──────────────────
const d = (daysAgo: number, hour = 10, min = 0) =>
  new Date(Date.now() - daysAgo * 86400000 + hour * 3600000 + min * 60000).toISOString();
const r = (daysAgo: number, hoursAfter: number) =>
  new Date(Date.now() - daysAgo * 86400000 + hoursAfter * 3600000).toISOString();

const c = (
  id: string, dept: Complaint['department'], cat: Complaint['category'],
  sev: Complaint['severity'], status: Complaint['status'],
  desc: string, daysAgo: number, hoursAfter?: number,
  resolution?: string, compensation?: string | null, sat?: number | null
): Complaint => ({
  id, hotel_id: 'demo', submitted_by: 'u1', guest_id: null,
  department: dept, room_number: String(100 + parseInt(id.replace(/\D/g, '')) % 500),
  category: cat, description: desc, severity: sev, status,
  assigned_to: null,
  resolution: resolution ?? null,
  compensation: compensation ?? null,
  guest_satisfaction: sat ?? null,
  resolved_at: (status === 'resolved' && hoursAfter) ? r(daysAgo, hoursAfter) : null,
  created_at: d(daysAgo, 9),
});

const DEMO_COMPLAINTS: Complaint[] = [
  // ── Today ──
  c('t1', 'Housekeeping',    'Noise',            'critical', 'in_progress', 'A/C buzzing all night — third complaint from same room.',                    0),
  c('t2', 'Pool & Beach',    'Wait Times',       'high',     'open',        'No towels at pool for 30 minutes. Three guests waiting.',                    0),
  c('t3', 'Food & Beverage', 'Food & Beverage',  'high',     'open',        'Room service 45 minutes late, food cold.',                                  0),
  c('t4', 'Front Desk',      'Staff Behavior',   'medium',   'open',        'Check-in agent dismissive about room upgrade request.',                     0),

  // ── This week ──
  c('w1',  'Housekeeping',    'Cleanliness',      'high',     'resolved',    'Bathroom not cleaned. Hair in drain.',                                      1, 11, 'Deep-cleaned within 20 min.', 'Complimentary wine', 4),
  c('w2',  'Spa & Fitness',   'Temperature / AC', 'medium',   'resolved',    'Gym too hot. Three requests ignored.',                                      1, 13, 'HVAC adjusted. Staff briefed.', null, 3),
  c('w3',  'Housekeeping',    'Noise',            'high',     'resolved',    'Noisy water pipes throughout the night.',                                   2, 10, 'Plumber fixed pressure valve.',  'Complimentary dinner', 4),
  c('w4',  'Food & Beverage', 'Wait Times',       'medium',   'resolved',    'Breakfast service slow — 35 min wait for eggs.',                           2, 12, 'Staff schedules revised.',  null, 3),
  c('w5',  'Front Desk',      'Billing',          'high',     'resolved',    'Double charged for spa — noticed on statement.',                            3, 14, 'Reversed + $100 credit.',  '$100 credit', 5),
  c('w6',  'Housekeeping',    'Cleanliness',      'medium',   'resolved',    'Room not serviced on day 2 despite DND removed.',                          3, 15, 'Immediate full clean. Apology from supervisor.', 'Champagne', 4),
  c('w7',  'Concierge',       'Wait Times',       'high',     'resolved',    'Restaurant reservation not confirmed — missed dinner.',                    4, 14, 'Priority booking at sister restaurant.', 'Dinner on house', 5),
  c('w8',  'Maintenance',     'Room Condition',   'critical', 'resolved',    'Balcony door latch broken — guest feels unsafe.',                          5, 11, 'Latch replaced in 45 min.', '20% rate discount', 4),

  // ── This month ──
  c('m1',  'Food & Beverage', 'Food & Beverage',  'critical', 'resolved',    'Gluten allergy flagged at booking — bread served anyway.',                  7, 13, 'New meal + allergy alerts added to all systems.', 'Upgrade + free lunch', 4),
  c('m2',  'Valet & Transport','Wait Times',       'high',     'resolved',    'Airport shuttle 20 min late. Guest nearly missed flight.',                 10, 9,  'Private taxi arranged. Refunded transfer.', 'Transfer refunded', 3),
  c('m3',  'Housekeeping',    'Noise',            'high',     'resolved',    'Construction noise at 7am — not disclosed at booking.',                    11, 12, 'Moved to quieter wing. Apology from GM.', 'Suite upgrade', 5),
  c('m4',  'Food & Beverage', 'Food & Beverage',  'medium',   'resolved',    'Dinner menu unavailable items — not flagged by server.',                   12, 11, 'Chef offered alternatives. Manager apologised.', null, 4),
  c('m5',  'Maintenance',     'Maintenance',      'high',     'resolved',    'Hot water lukewarm for two days.',                                         14, 10, 'Mixing valve replaced. Hot water restored.', 'Free spa session', 4),
  c('m6',  'Pool & Beach',    'Wait Times',       'medium',   'resolved',    'Beach chairs reserved but not available when guests arrived.',             14, 13, 'Chairs arranged. Complimentary drinks.',  'Welcome drinks', 4),
  c('m7',  'Housekeeping',    'Cleanliness',      'medium',   'resolved',    'Dusty air vents in room — triggered allergy.',                             15, 12, 'Full vent clean. Room refreshed.', null, 3),
  c('m8',  'Front Desk',      'Staff Behavior',   'low',      'resolved',    'Staff member on phone during check-in — felt ignored.',                    16, 10, 'Staff counselled. Policy reminder issued.', null, 4),
  c('m9',  'Spa & Fitness',   'Temperature / AC', 'medium',   'resolved',    'Sauna temperature too low — staff unaware.',                               17, 11, 'Temperature corrected. Complimentary session.', 'Free spa session', 5),
  c('m10', 'Concierge',       'Other',            'low',      'resolved',    'Incorrect tour time communicated to guest.',                               18, 13, 'Rescheduled tour. GM called to apologise.', null, 3),
  c('m11', 'Food & Beverage', 'Wait Times',       'medium',   'resolved',    'Room service took 1 hour — no update provided.',                          19, 12, 'Meal comped. Process tightened.', 'Meal comped', 4),
  c('m12', 'Housekeeping',    'Room Condition',   'high',     'resolved',    'Shower drain blocked — water not draining.',                               20, 10, 'Plumber cleared drain within 1 hour.', null, 4),
  c('m13', 'Pool & Beach',    'Other',            'low',      'resolved',    'Loud music from pool bar during afternoon nap hours.',                     21, 14, 'Volume reduced per policy. Guest informed.', null, 4),
  c('m14', 'Food & Beverage', 'Food & Beverage',  'low',      'resolved',    'Cold coffee served at breakfast two mornings running.',                    22, 9,  'Service process updated. Premium coffee offered.', null, 5),

  // ── Last 90 days ──
  c('q1',  'Maintenance',     'Maintenance',      'critical', 'resolved',    'Power outage in room — TV and AC off for 3 hours.',                       35, 14, 'Engineer restored power in 2h. Full night comp.', 'Night comped', 4),
  c('q2',  'Housekeeping',    'Noise',            'high',     'resolved',    'Guests next door loud until 2am. Called front desk twice.',               37, 8,  'Neighbouring guests asked to keep noise down.', null, 3),
  c('q3',  'Food & Beverage', 'Food & Beverage',  'medium',   'resolved',    'Seafood smelled off. Guest concerned about food safety.',                  38, 12, 'Dish removed. Kitchen inspection conducted.', 'Meal comped', 4),
  c('q4',  'Front Desk',      'Billing',          'high',     'resolved',    'Minibar items charged that guest did not consume.',                       40, 10, 'Charges reversed immediately.',  null, 5),
  c('q5',  'Housekeeping',    'Cleanliness',      'medium',   'resolved',    'Stained pillowcase discovered at turndown.',                              42, 11, 'Fresh linen provided immediately.',  null, 5),
  c('q6',  'Spa & Fitness',   'Room Condition',   'low',      'resolved',    'Broken locker in gym changing room.',                                     45, 13, 'Locker repaired same day.', null, 4),
  c('q7',  'Pool & Beach',    'Wait Times',       'medium',   'resolved',    'Bar service at pool extremely slow during peak hours.',                   48, 11, 'Additional staff deployed poolside 11am–4pm.', null, 3),
  c('q8',  'Concierge',       'Wait Times',       'medium',   'resolved',    'Car hire pickup 40 min late — driver did not call.',                      50, 14, 'Driver reprimanded. Refund issued for delay.', 'Partial refund', 3),
  c('q9',  'Maintenance',     'Maintenance',      'high',     'resolved',    'Lift out of service — elderly guest had to use stairs.',                  55, 9,  'Lift engineer called. Fixed within 4h. Apology.', 'F&B credit', 4),
  c('q10', 'Housekeeping',    'Room Condition',   'medium',   'resolved',    'Window blind broken — room had no privacy.',                              58, 12, 'Blind replaced within 2 hours.',  null, 4),
  c('q11', 'Food & Beverage', 'Wait Times',       'low',      'resolved',    'Long wait for table despite reservation — 20 minutes standing.',          60, 10, 'Table expedited. Complimentary drinks while waiting.', 'Welcome drinks', 4),
  c('q12', 'Valet & Transport','Wait Times',       'medium',   'resolved',    'Car not ready at agreed time for dinner reservation.',                   65, 13, 'Taxi arranged at hotel cost. Car team counselled.',  'Taxi covered', 3),
  c('q13', 'Housekeeping',    'Cleanliness',      'high',     'resolved',    'Previous guest items found in wardrobe.',                                70, 8,  'Room deep-cleaned. Complimentary amenities.',  'Amenity hamper', 5),
  c('q14', 'Food & Beverage', 'Food & Beverage',  'critical', 'resolved',    'Nut allergy triggered — guest had anaphylactic reaction.',                75, 12, 'Medical team called. Full incident report. Process overhauled.', 'Full stay comped', 3),
];

const SUPABASE_CONFIGURED =
  !!process.env.NEXT_PUBLIC_SUPABASE_URL &&
  process.env.NEXT_PUBLIC_SUPABASE_URL !== 'https://your-project.supabase.co' &&
  !!process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY &&
  !process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY.startsWith('your-');

export default async function ImprovementsPage() {
  if (!SUPABASE_CONFIGURED) {
    return <ImprovementsClient complaints={DEMO_COMPLAINTS} />;
  }

  const { redirect } = await import('next/navigation');
  const { createServerSupabaseClient } = await import('@/lib/supabase/server');

  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: profile } = await supabase
    .from('profiles').select('hotel_id').eq('id', user.id).single();
  if (!profile?.hotel_id) redirect('/onboarding');

  // Full 90-day history for improvement trend analysis
  const cutoff = new Date(Date.now() - 90 * 86400000).toISOString();
  const { data: complaints } = await supabase
    .from('complaints')
    .select('*, guests(name, email)')
    .eq('hotel_id', profile.hotel_id)
    .gte('created_at', cutoff)
    .order('created_at', { ascending: false });

  const shaped = (complaints ?? []).map((c: Record<string, unknown>) => {
    const { guests, ...rest } = c;
    return { ...rest, guest: (guests as { name: string; email: string } | null) ?? undefined };
  });

  return <ImprovementsClient complaints={shaped as unknown as Complaint[]} />;
}
