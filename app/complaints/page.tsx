import { Metadata } from 'next';
import ComplaintsClient from './ComplaintsClient';
import type { Complaint } from '@/types';

export const metadata: Metadata = {
  title: 'Guest Opportunity Database',
  robots: { index: false, follow: false },
};

// ── Demo data (90-day history) ────────────────────────────────────────────────
const d = (daysAgo: number, hour = 10) =>
  new Date(Date.now() - daysAgo * 86400000 + hour * 3600000).toISOString();

const DEMO_COMPLAINTS: Complaint[] = [
  { id: 'c01', hotel_id: 'demo', submitted_by: 'u1', guest_id: 'g1', guest: { name: 'James Hartwell',  email: 'james@email.com' }, department: 'Housekeeping',    room_number: '412', category: 'Noise',          description: 'A/C unit making a loud buzzing sound throughout the night. Guest has had two nights of poor sleep.',              severity: 'critical', status: 'in_progress', assigned_to: null, resolution: null, compensation: null, guest_satisfaction: null, resolved_at: null, created_at: d(0, 9) },
  { id: 'c02', hotel_id: 'demo', submitted_by: 'u2', guest_id: 'g2', guest: { name: 'Marcus Chen',     email: 'marcus@email.com' }, department: 'Pool & Beach',    room_number: '315', category: 'Wait Times',     description: 'Guest waited over 25 minutes for pool towels. Said it was unacceptable for a 5-star property.',               severity: 'high',     status: 'open',        assigned_to: null, resolution: null, compensation: null, guest_satisfaction: null, resolved_at: null, created_at: d(0, 11) },
  { id: 'c03', hotel_id: 'demo', submitted_by: 'u3', guest_id: 'g3', guest: { name: 'Sophia Navarro',  email: 'sophia@email.com' }, department: 'Food & Beverage', room_number: '208', category: 'Food & Beverage', description: 'Room service arrived 45 minutes late. Steak was cold. Guest requested a full refund.',                          severity: 'high',     status: 'open',        assigned_to: null, resolution: null, compensation: null, guest_satisfaction: null, resolved_at: null, created_at: d(0, 13) },
  { id: 'c04', hotel_id: 'demo', submitted_by: 'u4', guest_id: null, guest: undefined,                                              department: 'Front Desk',      room_number: '107', category: 'Staff Behavior', description: 'Guest felt the check-in agent was dismissive when asking about a room upgrade.',                              severity: 'medium',   status: 'open',        assigned_to: null, resolution: null, compensation: null, guest_satisfaction: null, resolved_at: null, created_at: d(0, 14) },
  { id: 'c05', hotel_id: 'demo', submitted_by: 'u5', guest_id: 'g4', guest: { name: 'Daniel Brooks',   email: 'dbrooks@email.com' }, department: 'Housekeeping',    room_number: '502', category: 'Cleanliness',    description: 'Bathroom floor was not cleaned before arrival. Hair found near the drain.',                                    severity: 'high',     status: 'resolved',    assigned_to: null, resolution: 'Room thoroughly re-cleaned within 20 minutes. Housekeeping supervisor personally apologised.', compensation: 'Complimentary bottle of wine', guest_satisfaction: 4, resolved_at: d(0, 15), created_at: d(0, 8) },
  { id: 'c06', hotel_id: 'demo', submitted_by: 'u6', guest_id: null, guest: undefined,                                              department: 'Spa & Fitness',    room_number: null,  category: 'Temperature / AC', description: 'Fitness center was too hot. Guest asked three times and no one adjusted the thermostat.',                     severity: 'medium',   status: 'resolved',    assigned_to: null, resolution: 'HVAC technician adjusted thermostat. Staff briefed on escalation process.',              compensation: null,                          guest_satisfaction: 3, resolved_at: d(1, 10), created_at: d(1, 9)  },
  { id: 'c07', hotel_id: 'demo', submitted_by: 'u1', guest_id: null, guest: undefined,                                              department: 'Concierge',        room_number: '301', category: 'Wait Times',     description: 'Guest waited 40 minutes for a restaurant reservation that was never confirmed. Missed their dinner.',          severity: 'high',     status: 'resolved',    assigned_to: null, resolution: 'Arranged priority reservation at sister restaurant and covered the cost of the meal.',    compensation: 'Complimentary dinner ($180)', guest_satisfaction: 5, resolved_at: d(3, 14), created_at: d(3, 12) },
  { id: 'c08', hotel_id: 'demo', submitted_by: 'u2', guest_id: null, guest: undefined,                                              department: 'Housekeeping',    room_number: '609', category: 'Room Condition',  description: 'Balcony door latch is broken — guest cannot lock the door and feels unsafe.',                                  severity: 'critical', status: 'resolved',    assigned_to: null, resolution: 'Maintenance replaced the latch within 45 minutes. Manager personally followed up.',         compensation: '20% rate discount',          guest_satisfaction: 4, resolved_at: d(5, 11), created_at: d(5, 9)  },
  { id: 'c09', hotel_id: 'demo', submitted_by: 'u3', guest_id: null, guest: undefined,                                              department: 'Food & Beverage', room_number: '415', category: 'Food & Beverage', description: 'Gluten allergy noted at booking — bread served with soup at lunch despite flagged allergy.',                   severity: 'critical', status: 'resolved',    assigned_to: null, resolution: 'Immediate apology, new meal prepared under chef supervision. Allergy alert added to all F&B systems.', compensation: 'Complimentary lunch + suite upgrade', guest_satisfaction: 4, resolved_at: d(7, 13), created_at: d(7, 12) },
  { id: 'c10', hotel_id: 'demo', submitted_by: 'u4', guest_id: null, guest: undefined,                                              department: 'Front Desk',      room_number: '220', category: 'Billing',        description: 'Guest was charged twice for spa treatment. Noticed the duplicate charge on their statement.',                 severity: 'high',     status: 'resolved',    assigned_to: null, resolution: 'Duplicate charge reversed within 2 hours. Finance team updated billing process.',              compensation: 'Full refund + $100 credit',  guest_satisfaction: 5, resolved_at: d(10, 15), created_at: d(10, 10) },
  { id: 'c11', hotel_id: 'demo', submitted_by: 'u5', guest_id: null, guest: undefined,                                              department: 'Valet & Transport', room_number: null, category: 'Wait Times',     description: 'Shuttle to airport arrived 20 minutes late. Guest nearly missed their flight.',                                severity: 'high',     status: 'resolved',    assigned_to: null, resolution: 'Arranged private taxi at hotel cost. Transport manager reviewed scheduling process.',          compensation: 'Airport transfer refunded',  guest_satisfaction: 3, resolved_at: d(14, 9), created_at: d(14, 7) },
  { id: 'c12', hotel_id: 'demo', submitted_by: 'u6', guest_id: null, guest: undefined,                                              department: 'Maintenance',      room_number: '318', category: 'Maintenance',    description: 'Hot water in shower is only lukewarm. Guest has been unable to take a proper hot shower for two days.',       severity: 'high',     status: 'resolved',    assigned_to: null, resolution: 'Plumber identified faulty mixing valve and replaced it. Hot water restored within 90 minutes.',compensation: 'Complimentary spa session',  guest_satisfaction: 4, resolved_at: d(20, 14), created_at: d(20, 9) },
  { id: 'c13', hotel_id: 'demo', submitted_by: 'u1', guest_id: null, guest: undefined,                                              department: 'Housekeeping',    room_number: '505', category: 'Cleanliness',    description: 'Room was not cleaned on day 3 of stay despite DND sign being removed by 11am.',                               severity: 'medium',   status: 'resolved',    assigned_to: null, resolution: 'Immediate full room clean. Housekeeper apologised directly to guest.',                        compensation: 'Bottle of champagne',        guest_satisfaction: 4, resolved_at: d(25, 15), created_at: d(25, 13) },
  { id: 'c14', hotel_id: 'demo', submitted_by: 'u2', guest_id: null, guest: undefined,                                              department: 'Food & Beverage', room_number: '401', category: 'Food & Beverage', description: 'Coffee at breakfast was served cold on two consecutive mornings.',                                          severity: 'low',      status: 'resolved',    assigned_to: null, resolution: 'Service process updated. Guest offered premium coffee service for remainder of stay.',        compensation: null,                          guest_satisfaction: 5, resolved_at: d(30, 9), created_at: d(30, 8) },
];

const SUPABASE_CONFIGURED =
  !!process.env.NEXT_PUBLIC_SUPABASE_URL &&
  process.env.NEXT_PUBLIC_SUPABASE_URL !== 'https://your-project.supabase.co' &&
  !!process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY &&
  !process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY.startsWith('your-');

export default async function ComplaintsPage() {
  if (!SUPABASE_CONFIGURED) {
    return <ComplaintsClient initialComplaints={DEMO_COMPLAINTS} isDemo={true} />;
  }

  const { redirect } = await import('next/navigation');
  const { createServerSupabaseClient } = await import('@/lib/supabase/server');

  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: profile } = await supabase
    .from('profiles').select('hotel_id').eq('id', user.id).single();
  if (!profile?.hotel_id) redirect('/onboarding');

  // Fetch all complaints for this hotel (full history), joined with guest name
  const { data: complaints } = await supabase
    .from('complaints')
    .select('*, guests(name, email)')
    .eq('hotel_id', profile.hotel_id)
    .order('created_at', { ascending: false });

  // Reshape joined guest data to match the Complaint type
  const shaped = (complaints ?? []).map((c: Record<string, unknown>) => {
    const { guests, ...rest } = c;
    return { ...rest, guest: (guests as { name: string; email: string } | null) ?? undefined };
  });

  return <ComplaintsClient initialComplaints={shaped as unknown as Complaint[]} isDemo={false} />;
}
