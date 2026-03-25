/**
 * POST /api/capture
 *
 * Accepts complaint submissions from unauthenticated staff via /capture/[slug].
 * Uses the admin client to bypass RLS — no auth required.
 */

import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

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

    const supabase = createAdminClient();

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
