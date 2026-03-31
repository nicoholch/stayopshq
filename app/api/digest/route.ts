/**
 * GET /api/digest
 *
 * Weekly Monday digest email for every hotel.
 * Sends each manager a summary of last week's activity:
 * complaints logged, resolved, avg satisfaction, top department, open issues.
 *
 * Secured with CRON_SECRET — only Vercel cron (or internal calls) can trigger it.
 * Configured in vercel.json: { "path": "/api/digest", "schedule": "0 8 * * 1" }
 */

import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { getResend } from '@/lib/resend';

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const supabase = createAdminClient();
  const resend   = getResend();

  // Date window: last 7 days
  const now       = new Date();
  const weekStart = new Date(now.getTime() - 7 * 86400000).toISOString();

  // All hotels
  const { data: hotels, error: hotelsErr } = await supabase
    .from('hotels')
    .select('id, name');

  if (hotelsErr || !hotels?.length) {
    return NextResponse.json({ error: 'No hotels found' }, { status: 500 });
  }

  // All auth users (for emails)
  const listResult = await supabase.auth.admin.listUsers({ perPage: 1000 });
  const authUsers  = listResult.data?.users ?? [];

  const results: { hotel: string; status: string }[] = [];

  for (const hotel of hotels) {
    try {
      // Get manager profiles for this hotel
      const { data: managers } = await supabase
        .from('profiles')
        .select('id, full_name')
        .eq('hotel_id', hotel.id)
        .eq('role', 'manager');

      if (!managers?.length) continue;

      // Last week's complaints
      const { data: weekComplaints } = await supabase
        .from('complaints')
        .select('id, status, severity, department, guest_satisfaction, created_at, resolved_at')
        .eq('hotel_id', hotel.id)
        .gte('created_at', weekStart);

      // All-time total
      const { count: totalCount } = await supabase
        .from('complaints')
        .select('id', { count: 'exact', head: true })
        .eq('hotel_id', hotel.id);

      const week = weekComplaints ?? [];
      const logged   = week.length;
      const resolved = week.filter(c => c.status === 'resolved').length;
      const open     = week.filter(c => c.status !== 'resolved').length;

      const satScores = week
        .filter(c => c.guest_satisfaction != null)
        .map(c => c.guest_satisfaction as number);
      const avgSat = satScores.length
        ? (satScores.reduce((a, b) => a + b, 0) / satScores.length).toFixed(1)
        : null;

      // Top department by volume
      const deptMap = new Map<string, number>();
      for (const c of week) deptMap.set(c.department, (deptMap.get(c.department) ?? 0) + 1);
      const topDept = [...deptMap.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ?? null;

      // Send to each manager
      for (const manager of managers) {
        const authUser = authUsers.find((u: { id: string; email?: string }) => u.id === manager.id);
        if (!authUser?.email) continue;

        const html = digestEmailHtml({
          managerName: manager.full_name ?? 'Manager',
          hotelName:   hotel.name,
          logged,
          resolved,
          open,
          avgSat,
          topDept,
          totalCount:  totalCount ?? 0,
        });

        await resend.emails.send({
          from:    'StayOps HQ <hello@stayopshq.com>',
          to:      authUser.email,
          subject: `Your weekly summary — ${hotel.name}`,
          html,
        });
      }

      results.push({ hotel: hotel.name, status: `sent to ${managers.length} manager(s)` });
    } catch (err) {
      console.error(`[digest] hotel ${hotel.name}:`, err);
      results.push({ hotel: hotel.name, status: 'error' });
    }
  }

  return NextResponse.json({ processed: results.length, results });
}

// ── Email template ────────────────────────────────────────────────────────────

function digestEmailHtml({
  managerName, hotelName, logged, resolved, open, avgSat, topDept, totalCount,
}: {
  managerName: string;
  hotelName: string;
  logged: number;
  resolved: number;
  open: number;
  avgSat: string | null;
  topDept: string | null;
  totalCount: number;
}): string {
  const appUrl      = process.env.NEXT_PUBLIC_APP_URL ?? 'https://stayopshq.com';
  const resolvePct  = logged > 0 ? Math.round((resolved / logged) * 100) : null;
  const noActivity  = logged === 0;

  const milestoneMsg = (() => {
    if (totalCount >= 100) return `You've now logged <strong>${totalCount} guest opportunities</strong> total. Your data is telling a clear story.`;
    if (totalCount >= 50)  return `You've crossed <strong>50 guest opportunities</strong> logged. Your trends are becoming meaningful.`;
    if (totalCount >= 25)  return `You've logged <strong>${totalCount} guest opportunities</strong> so far. Patterns are starting to emerge.`;
    if (totalCount >= 10)  return `You've logged <strong>${totalCount} guest opportunities</strong>. Keep going — the more you log, the clearer the picture.`;
    return `You've logged <strong>${totalCount} guest opportunities</strong> so far. Every entry builds your operational picture.`;
  })();

  return `<!DOCTYPE html>
<html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#F3F0EB;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#F3F0EB;padding:40px 0;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">

        <!-- Header -->
        <tr><td style="background:#0B1A2B;border-radius:12px 12px 0 0;padding:28px 40px;text-align:center;">
          <div style="display:inline-flex;align-items:center;gap:10px;">
            <span style="display:inline-block;width:34px;height:34px;background:#F5C451;border-radius:7px;font-size:18px;line-height:34px;text-align:center;">🛎</span>
            <span style="font-size:20px;font-weight:800;color:white;">StayOps HQ</span>
          </div>
        </td></tr>

        <!-- Gold bar -->
        <tr><td style="background:#F5C451;height:4px;"></td></tr>

        <!-- Body -->
        <tr><td style="background:white;padding:40px;border-radius:0 0 12px 12px;">

          <p style="font-size:14px;color:#6B7280;margin:0 0 6px;">Weekly summary for ${hotelName}</p>
          <h1 style="font-size:22px;font-weight:800;color:#0B1A2B;margin:0 0 24px;">
            ${noActivity ? 'Quiet week at ' + hotelName : 'Here\'s how last week looked, ' + managerName.split(' ')[0]}
          </h1>

          ${noActivity ? `
          <p style="font-size:15px;color:#4B5563;line-height:1.7;margin:0 0 24px;">
            No guest opportunities were logged last week. That could mean a smooth week — or it could mean issues went unrecorded. Make sure your team has the staff capture link handy.
          </p>
          ` : `
          <!-- Stats grid -->
          <table width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 28px;">
            <tr>
              <td width="33%" style="text-align:center;padding:16px;background:#F9FAFB;border-radius:8px;">
                <div style="font-size:32px;font-weight:800;color:#0B1A2B;">${logged}</div>
                <div style="font-size:12px;color:#6B7280;font-weight:600;text-transform:uppercase;letter-spacing:0.05em;margin-top:4px;">Logged</div>
              </td>
              <td width="4%" style="padding:0 6px;"></td>
              <td width="33%" style="text-align:center;padding:16px;background:#F0FDF4;border-radius:8px;">
                <div style="font-size:32px;font-weight:800;color:#059669;">${resolved}</div>
                <div style="font-size:12px;color:#059669;font-weight:600;text-transform:uppercase;letter-spacing:0.05em;margin-top:4px;">Resolved</div>
              </td>
              <td width="4%" style="padding:0 6px;"></td>
              <td width="33%" style="text-align:center;padding:16px;background:${open > 0 ? '#FEF2F2' : '#F0FDF4'};border-radius:8px;">
                <div style="font-size:32px;font-weight:800;color:${open > 0 ? '#DC2626' : '#059669'};">${open}</div>
                <div style="font-size:12px;color:${open > 0 ? '#DC2626' : '#059669'};font-weight:600;text-transform:uppercase;letter-spacing:0.05em;margin-top:4px;">Still Open</div>
              </td>
            </tr>
          </table>

          ${resolvePct !== null ? `
          <p style="font-size:15px;color:#4B5563;line-height:1.7;margin:0 0 16px;">
            Your team resolved <strong style="color:#0B1A2B;">${resolvePct}%</strong> of logged issues last week${avgSat ? ` with an average guest satisfaction of <strong style="color:#B45309;">${avgSat}/5</strong>` : ''}.
            ${topDept ? `The most active department was <strong style="color:#0B1A2B;">${topDept}</strong>.` : ''}
          </p>
          ` : ''}
          `}

          <!-- Milestone message -->
          <div style="background:#FEF9EC;border:1px solid rgba(201,168,76,0.3);border-radius:8px;padding:16px 18px;margin:0 0 28px;">
            <p style="font-size:14px;color:#92400E;line-height:1.7;margin:0;">${milestoneMsg}</p>
          </div>

          <!-- CTA -->
          <table cellpadding="0" cellspacing="0" style="margin:0 0 28px;">
            <tr>
              <td style="background:#F5C451;border-radius:8px;">
                <a href="${appUrl}/dashboard" style="display:inline-block;padding:13px 28px;font-size:14px;font-weight:700;color:#0B1A2B;text-decoration:none;border-radius:8px;">
                  View Dashboard →
                </a>
              </td>
            </tr>
          </table>

          <hr style="border:none;border-top:1px solid #E5E7EB;margin:0 0 20px;">
          <p style="font-size:12px;color:#9CA3AF;text-align:center;line-height:1.6;margin:0;">
            You're receiving this because you manage ${hotelName} on StayOps HQ.<br>
            Weekly digests are sent every Monday morning.
          </p>

        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`;
}
