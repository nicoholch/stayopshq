import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';

const VALID_SEVERITIES = ['low', 'medium', 'high', 'critical'];
const VALID_STATUSES   = ['open', 'in_progress', 'resolved'];
const VALID_DEPARTMENTS = [
  'Front Desk', 'Housekeeping', 'Food & Beverage', 'Concierge',
  'Spa & Fitness', 'Pool & Beach', 'Valet & Transport', 'Activities', 'Maintenance',
];
const VALID_CATEGORIES = [
  'Room Condition', 'Cleanliness', 'Noise', 'Temperature / AC', 'Maintenance',
  'Staff Behavior', 'Food & Beverage', 'Wait Times', 'Billing', 'Other',
];

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  // Only managers can edit
  const { data: profile } = await supabase
    .from('profiles')
    .select('hotel_id, role')
    .eq('id', user.id)
    .single();

  if (!profile?.hotel_id || profile.role !== 'manager') {
    return NextResponse.json({ error: 'Only managers can edit guest opportunities' }, { status: 403 });
  }

  // Verify complaint belongs to this hotel
  const { data: existing } = await supabase
    .from('complaints')
    .select('id, hotel_id')
    .eq('id', id)
    .single();

  if (!existing || existing.hotel_id !== profile.hotel_id) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  const body = await req.json() as Record<string, unknown>;

  // Build safe update — only allow known editable fields
  const update: Record<string, unknown> = {};

  if ('department' in body) {
    if (!VALID_DEPARTMENTS.includes(body.department as string))
      return NextResponse.json({ error: 'Invalid department' }, { status: 400 });
    update.department = body.department;
  }
  if ('category' in body) {
    if (!VALID_CATEGORIES.includes(body.category as string))
      return NextResponse.json({ error: 'Invalid category' }, { status: 400 });
    update.category = body.category;
  }
  if ('severity' in body) {
    if (!VALID_SEVERITIES.includes(body.severity as string))
      return NextResponse.json({ error: 'Invalid severity' }, { status: 400 });
    update.severity = body.severity;
  }
  if ('status' in body) {
    if (!VALID_STATUSES.includes(body.status as string))
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
    update.status = body.status;
  }
  if ('description' in body) {
    const desc = (body.description as string)?.trim();
    if (!desc || desc.length > 2000)
      return NextResponse.json({ error: 'Invalid description' }, { status: 400 });
    update.description = desc;
  }
  if ('room_number' in body) {
    update.room_number = (body.room_number as string)?.trim() || null;
  }

  if (Object.keys(update).length === 0) {
    return NextResponse.json({ error: 'No valid fields to update' }, { status: 400 });
  }

  const { error } = await supabase
    .from('complaints')
    .update(update)
    .eq('id', id);

  if (error) {
    console.error('[PATCH /api/complaints/[id]]', error);
    return NextResponse.json({ error: 'Failed to update' }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
