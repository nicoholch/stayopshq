import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import type { Hotel } from '@/types';
import SettingsClient from './SettingsClient';

export const metadata: Metadata = {
  title: 'Settings',
  robots: { index: false, follow: false },
};

export default async function SettingsPage() {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: profile } = await supabase
    .from('profiles').select('*, hotels(*)').eq('id', user.id).single();
  if (!profile?.hotel_id) redirect('/onboarding');
  if (profile.role !== 'manager') redirect('/dashboard');

  const hotel = profile.hotels as unknown as Hotel;
  const admin = createAdminClient();

  // All profiles for this hotel
  const { data: team } = await admin
    .from('profiles')
    .select('id, full_name, role, created_at')
    .eq('hotel_id', profile.hotel_id)
    .order('created_at');

  // Attach emails from auth.users
  const listResult = await admin.auth.admin.listUsers({ perPage: 1000 });
  const authUsers = listResult.data?.users ?? [];
  const teamWithEmail = (team ?? []).map(m => ({
    ...m,
    email: authUsers.find((u: { id: string; email?: string }) => u.id === m.id)?.email ?? null,
  }));

  return (
    <SettingsClient
      currentUserId={user.id}
      hotel={hotel}
      team={teamWithEmail}
    />
  );
}
