/**
 * POST /api/capture
 *
 * Accepts complaint submissions from unauthenticated staff via /capture/[slug].
 * Uses the admin client to bypass RLS — no auth required.
 * hotel_id is validated against the DB to prevent arbitrary inserts.
 */

import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

const VALID_SEVERITIES = ['low', 'medium', 'high', 'critical'];
const MAX_DESCRIPTION_LENGTH = 2000;
const MAX_FIELD_LENGTH = 100;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as {
      hotel_id: string;
      department: string;
      category: string;
      description: string;
      severity: string;
      room_number?: string;
    };

    const { hotel_id, department, category, description, severity } = body;

    if (!hotel_id || !department || !category || !description || !severity) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    if (!VALID_SEVERITIES.includes(severity)) {
      return NextResponse.json({ error: 'Invalid severity' }, { status: 400 });
    }

    if (description.length > MAX_DESCRIPTION_LENGTH) {
      return NextResponse.json({ error: `Description must be ${MAX_DESCRIPTION_LENGTH} characters or less` }, { status: 400 });
    }

    if (department.length > MAX_FIELD_LENGTH || category.length > MAX_FIELD_LENGTH) {
      return NextResponse.json({ error: 'Field too long' }, { status: 400 });
    }

    const supabase = createAdminClient();

    // Verify hotel_id exists — prevents submitting complaints to arbitrary UUIDs
    const { data: hotel, error: hotelErr } = await supabase
      .from('hotels')
      .select('id, plan')
      .eq('id', hotel_id)
      .single();

    if (hotelErr || !hotel) {
      return NextResponse.json({ error: 'Invalid hotel' }, { status: 400 });
    }

    // Free plan: enforce 30 issues/month cap
    if ((hotel as unknown as { plan: string }).plan === 'free') {
      const monthStart = new Date();
      monthStart.setDate(1);
      monthStart.setHours(0, 0, 0, 0);
      const { count } = await supabase
        .from('complaints')
        .select('id', { count: 'exact', head: true })
        .eq('hotel_id', hotel_id)
        .gte('created_at', monthStart.toISOString());
      if ((count ?? 0) >= 30) {
        return NextResponse.json(
          { error: 'Monthly limit of 30 issues reached. Upgrade to Starter for unlimited logging.', upgrade: true },
          { status: 403 },
        );
      }
    }

    const { data, error } = await supabase.from('complaints').insert({
      hotel_id,
      department,
      category,
      description: description.trim(),
      severity,
      room_number: body.room_number || null,
      status: 'open',
      submitted_by: null,
      guest_id: null,
    }).select('id').single();

    if (error) {
      console.error('[/api/capture]', error);
      return NextResponse.json({ error: 'Failed to save complaint' }, { status: 500 });
    }

    return NextResponse.json({ id: data.id });
  } catch (err) {
    console.error('[/api/capture]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
