import { Metadata } from 'next';
import DashboardClient from './DashboardClient';
import type { Complaint, Guest, Hotel, DepartmentComplaintCount } from '@/types';

export const metadata: Metadata = {
  title: 'Dashboard',
  robots: { index: false, follow: false },
};

// ── Demo data ─────────────────────────────────────────────────────────────────
const DEMO_HOTEL: Hotel = {
  id: 'demo', name: 'The Azure Resort', slug: 'azure-resort',
  plan: 'pro', stripe_customer_id: null, stripe_subscription_id: null,
  public_page_enabled: true, created_at: new Date().toISOString(),
};

const DEMO_PROFILE = { full_name: 'Sarah Mitchell', role: 'manager' };

const today = new Date().toISOString().split('T')[0];
const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

const DEMO_COMPLAINTS: Complaint[] = [
  { id: '1', hotel_id: 'demo', submitted_by: 'u1', guest_id: 'g2', department: 'Pool & Beach',    room_number: '315', category: 'Wait Times',     description: 'Guest waited over 25 minutes for pool towels. Said it was unacceptable for a 5-star property.', severity: 'high',     status: 'open',        assigned_to: null, resolution: null, compensation: null, guest_satisfaction: null, resolved_at: null, created_at: new Date(Date.now() - 8  * 60000).toISOString() },
  { id: '2', hotel_id: 'demo', submitted_by: 'u2', guest_id: 'g1', department: 'Housekeeping',    room_number: '412', category: 'Noise',          description: 'A/C unit making a loud buzzing sound throughout the night. Guest has had two nights of poor sleep.', severity: 'critical', status: 'in_progress', assigned_to: null, resolution: null, compensation: null, guest_satisfaction: null, resolved_at: null, created_at: new Date(Date.now() - 22 * 60000).toISOString() },
  { id: '3', hotel_id: 'demo', submitted_by: 'u3', guest_id: 'g3', department: 'Food & Beverage', room_number: '208', category: 'Food & Beverage', description: 'Room service order arrived 45 minutes late and the steak was cold. Guest requested a full refund.',         severity: 'high',     status: 'open',        assigned_to: null, resolution: null, compensation: null, guest_satisfaction: null, resolved_at: null, created_at: new Date(Date.now() - 35 * 60000).toISOString() },
  { id: '4', hotel_id: 'demo', submitted_by: 'u4', guest_id: null,  department: 'Front Desk',      room_number: '107', category: 'Staff Behavior', description: 'Guest felt the check-in agent was dismissive when asking about a room upgrade. Left feeling unwelcome.',   severity: 'medium',   status: 'open',        assigned_to: null, resolution: null, compensation: null, guest_satisfaction: null, resolved_at: null, created_at: new Date(Date.now() - 48 * 60000).toISOString() },
  { id: '5', hotel_id: 'demo', submitted_by: 'u5', guest_id: 'g4', department: 'Housekeeping',    room_number: '502', category: 'Cleanliness',    description: 'Bathroom floor was not cleaned before arrival. Hair found near the drain.', severity: 'high', status: 'resolved', assigned_to: null, resolution: 'Room thoroughly re-cleaned within 20 minutes. Housekeeping supervisor personally apologised to the guest.', compensation: 'Complimentary bottle of wine', guest_satisfaction: 4, resolved_at: new Date(Date.now() - 20 * 60000).toISOString(), created_at: new Date(Date.now() - 70 * 60000).toISOString() },
  { id: '6', hotel_id: 'demo', submitted_by: 'u6', guest_id: null,  department: 'Spa & Fitness',   room_number: null,  category: 'Temperature / AC', description: 'Fitness center was too hot. Guest asked three times and no one adjusted the thermostat.', severity: 'medium', status: 'resolved', assigned_to: null, resolution: 'HVAC technician adjusted thermostat and confirmed correct temperature. Staff briefed on escalation process.', compensation: null, guest_satisfaction: 3, resolved_at: new Date(Date.now() - 10 * 60000).toISOString(), created_at: new Date(Date.now() - 90 * 60000).toISOString() },
];

const DEMO_GUESTS: Guest[] = [
  { id: 'g1', hotel_id: 'demo', name: 'James & Olivia Hartwell', email: 'james.hartwell@email.com', room_number: '412', check_in: yesterday, check_out: today,  followup_sent: false, created_at: new Date(Date.now() - 2 * 86400000).toISOString() },
  { id: 'g2', hotel_id: 'demo', name: 'Marcus Chen',            email: 'marcus.chen@email.com',    room_number: '315', check_in: yesterday, check_out: today,  followup_sent: false, created_at: new Date(Date.now() - 2 * 86400000).toISOString() },
  { id: 'g3', hotel_id: 'demo', name: 'Sophia Navarro',         email: 'sophia.navarro@email.com', room_number: '208', check_in: yesterday, check_out: today,  followup_sent: false, created_at: new Date(Date.now() - 2 * 86400000).toISOString() },
  { id: 'g4', hotel_id: 'demo', name: 'Daniel & Fiona Brooks',  email: 'dbrooks@email.com',        room_number: '502', check_in: yesterday, check_out: today,  followup_sent: true,  created_at: new Date(Date.now() - 2 * 86400000).toISOString() },
];

const DEMO_DEPT_COUNTS: DepartmentComplaintCount[] = [
  { department: 'Housekeeping',    open_count: 1, resolved_count: 1, total_count: 2 },
  { department: 'Food & Beverage', open_count: 1, resolved_count: 0, total_count: 1 },
  { department: 'Pool & Beach',    open_count: 1, resolved_count: 0, total_count: 1 },
  { department: 'Front Desk',      open_count: 1, resolved_count: 0, total_count: 1 },
  { department: 'Spa & Fitness',   open_count: 0, resolved_count: 1, total_count: 1 },
];

const SUPABASE_CONFIGURED =
  !!process.env.NEXT_PUBLIC_SUPABASE_URL &&
  process.env.NEXT_PUBLIC_SUPABASE_URL !== 'https://your-project.supabase.co' &&
  !!process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY &&
  !process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY.startsWith('your-');

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ success?: string }>;
}) {
  const params = await searchParams;

  // ── Demo mode ──────────────────────────────────────────────────────
  if (!SUPABASE_CONFIGURED) {
    const openCount     = DEMO_COMPLAINTS.filter(c => c.status === 'open').length;
    const criticalCount = DEMO_COMPLAINTS.filter(c => (c.severity === 'critical' || c.severity === 'high') && c.status !== 'resolved').length;
    const resolvedCount = DEMO_COMPLAINTS.filter(c => c.status === 'resolved').length;
    return (
      <DashboardClient
        hotel={DEMO_HOTEL}
        profile={DEMO_PROFILE}
        initialComplaints={DEMO_COMPLAINTS}
        initialGuests={DEMO_GUESTS}
        deptCounts={DEMO_DEPT_COUNTS}
        openCount={openCount}
        criticalCount={criticalCount}
        resolvedTodayCount={resolvedCount}
        justSubscribed={false}
        isDemo={true}
      />
    );
  }

  // ── Live mode ──────────────────────────────────────────────────────
  const { redirect } = await import('next/navigation');
  const { createServerSupabaseClient } = await import('@/lib/supabase/server');

  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: profile } = await supabase
    .from('profiles').select('*, hotels(*)').eq('id', user.id).single();

  if (!profile?.hotel_id) redirect('/onboarding');

  const hotel    = profile.hotels as Hotel;
  const todayStr = new Date().toISOString().split('T')[0];

  const [
    { data: recentComplaints },
    { data: deptCounts },
    { count: openCount },
    { count: criticalCount },
    { count: resolvedTodayCount },
    { data: activeGuests },
  ] = await Promise.all([
    supabase.from('complaints').select('*').eq('hotel_id', hotel.id)
      .gte('created_at', `${todayStr}T00:00:00`).order('created_at', { ascending: false }).limit(50),

    supabase.rpc('get_department_complaint_counts', { p_hotel_id: hotel.id, p_date: todayStr }),

    supabase.from('complaints').select('*', { count: 'exact', head: true })
      .eq('hotel_id', hotel.id).eq('status', 'open').gte('created_at', `${todayStr}T00:00:00`),

    supabase.from('complaints').select('*', { count: 'exact', head: true })
      .eq('hotel_id', hotel.id).in('severity', ['critical', 'high']).neq('status', 'resolved')
      .gte('created_at', `${todayStr}T00:00:00`),

    supabase.from('complaints').select('*', { count: 'exact', head: true })
      .eq('hotel_id', hotel.id).eq('status', 'resolved').gte('created_at', `${todayStr}T00:00:00`),

    // Guests checking out today or still in-house
    supabase.from('guests').select('*').eq('hotel_id', hotel.id)
      .gte('check_out', todayStr).order('check_out', { ascending: true }),
  ]);

  return (
    <DashboardClient
      hotel={hotel}
      profile={profile}
      initialComplaints={(recentComplaints ?? []) as Complaint[]}
      initialGuests={(activeGuests ?? []) as Guest[]}
      deptCounts={(deptCounts ?? []) as DepartmentComplaintCount[]}
      openCount={openCount ?? 0}
      criticalCount={criticalCount ?? 0}
      resolvedTodayCount={resolvedTodayCount ?? 0}
      justSubscribed={params.success === 'true'}
      isDemo={false}
    />
  );
}
