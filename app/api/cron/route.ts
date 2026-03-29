/**
 * Vercel Cron — runs daily at 18:00 UTC
 * Sends follow-up emails to all guests checking out today
 * who haven't had a follow-up sent yet.
 *
 * Configured in vercel.json:
 *   { "crons": [{ "path": "/api/cron", "schedule": "0 18 * * *" }] }
 *
 * Vercel automatically sets the Authorization header on cron invocations.
 */

import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function GET(req: NextRequest) {
  // Guard: only allow Vercel cron invocations (or internal calls during dev)
  const authHeader = req.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const supabase = createAdminClient();
  const today = new Date().toISOString().split('T')[0];

  // All guests checking out today who haven't had an email sent
  const { data: guests, error } = await supabase
    .from('guests')
    .select('id')
    .eq('check_out', today)
    .eq('followup_sent', false);

  if (error) {
    console.error('Cron: failed to fetch guests:', error);
    return NextResponse.json({ error: 'DB error' }, { status: 500 });
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';
  const results: { id: string; status: string }[] = [];

  for (const guest of guests ?? []) {
    try {
      const res = await fetch(`${appUrl}/api/send-followup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.CRON_SECRET}`,
        },
        body: JSON.stringify({ guest_id: guest.id }),
      });
      const body = await res.json();
      results.push({ id: guest.id, status: res.ok ? 'sent' : body.error });
    } catch (err) {
      results.push({ id: guest.id, status: 'fetch_error' });
    }
  }

  console.log(`Cron: processed ${results.length} checkout emails`, results);
  return NextResponse.json({ processed: results.length, results });
}
