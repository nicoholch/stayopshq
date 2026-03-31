import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function POST(req: NextRequest) {
  // Verify the caller is authenticated
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { name, slug, property_type, public_page_enabled } = await req.json();

  if (!name || !slug) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  // Use admin client to bypass RLS for the initial hotel + profile creation
  const admin = createAdminClient();

  // Guard: if the user already has a profile+hotel, don't create duplicates
  const { data: existing } = await admin
    .from('profiles')
    .select('hotel_id')
    .eq('id', user.id)
    .single();

  if (existing?.hotel_id) {
    return NextResponse.json({ hotel_id: existing.hotel_id });
  }

  // Create hotel
  const { data: hotel, error: hotelErr } = await admin
    .from('hotels')
    .insert({
      name,
      slug,
      property_type: property_type || null,
      plan: 'free',
      public_page_enabled: public_page_enabled ?? true,
    })
    .select()
    .single();

  if (hotelErr) {
    return NextResponse.json({ error: hotelErr.message }, { status: 500 });
  }

  // Create manager profile
  const { error: profileErr } = await admin
    .from('profiles')
    .insert({
      id: user.id,
      hotel_id: hotel.id,
      full_name: user.email?.split('@')[0] ?? 'Manager',
      role: 'manager',
    });

  if (profileErr) {
    // Roll back hotel creation to avoid orphaned records
    await admin.from('hotels').delete().eq('id', hotel.id);
    return NextResponse.json({ error: profileErr.message }, { status: 500 });
  }

  return NextResponse.json({ hotel_id: hotel.id });
}
