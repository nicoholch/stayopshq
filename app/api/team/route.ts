import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';

// DELETE /api/team?id=<profile_id> — remove a team member
export async function DELETE(req: NextRequest) {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { data: profile } = await supabase
    .from('profiles').select('hotel_id, role').eq('id', user.id).single();
  if (!profile?.hotel_id || profile.role !== 'manager') {
    return NextResponse.json({ error: 'Only managers can remove team members' }, { status: 403 });
  }

  const targetId = new URL(req.url).searchParams.get('id');
  if (!targetId) return NextResponse.json({ error: 'Member id required' }, { status: 400 });
  if (targetId === user.id) return NextResponse.json({ error: 'You cannot remove yourself' }, { status: 400 });

  const admin = createAdminClient();

  // Verify the target belongs to the same hotel
  const { data: target } = await admin
    .from('profiles').select('hotel_id').eq('id', targetId).single();
  if (!target || target.hotel_id !== profile.hotel_id) {
    return NextResponse.json({ error: 'Member not found' }, { status: 404 });
  }

  await admin.from('profiles').delete().eq('id', targetId);

  return NextResponse.json({ ok: true });
}
