import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { getResend } from '@/lib/resend';
import type { Complaint } from '@/types';

export async function POST(req: NextRequest) {
  // Only allow calls from the cron job (or internal server-to-server with the secret)
  const authHeader = req.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { guest_id } = await req.json();
  if (!guest_id) return NextResponse.json({ error: 'guest_id required' }, { status: 400 });

  const supabase = createAdminClient();

  // Fetch the guest
  const { data: guest, error: guestErr } = await supabase
    .from('guests')
    .select('*, hotels(name, slug)')
    .eq('id', guest_id)
    .single();

  if (guestErr || !guest) {
    return NextResponse.json({ error: 'Guest not found' }, { status: 404 });
  }

  if (guest.followup_sent) {
    return NextResponse.json({ error: 'Follow-up already sent for this guest' }, { status: 409 });
  }

  // Fetch complaints logged for their room during their stay
  const { data: complaints } = await supabase
    .from('complaints')
    .select('category, description, resolution, compensation, severity, status')
    .eq('hotel_id', guest.hotel_id)
    .eq('room_number', guest.room_number)
    .gte('created_at', `${guest.check_in}T00:00:00`)
    .lte('created_at', `${guest.check_out}T23:59:59`);

  const hotelName = (guest.hotels as { name: string; slug: string }).name;
  const hasComplaints = complaints && complaints.length > 0;
  const resolvedComplaints = (complaints ?? []).filter((c: Partial<Complaint>) => c.status === 'resolved');
  const unresolvedComplaints = (complaints ?? []).filter((c: Partial<Complaint>) => c.status !== 'resolved');

  const subject = hasComplaints
    ? `Your experience at ${hotelName} — we'd love your honest feedback`
    : `Thank you for staying at ${hotelName} — share your experience`;

  const html = hasComplaints
    ? buildComplaintEmail({ guest, hotelName, complaints: complaints ?? [], resolvedComplaints, unresolvedComplaints })
    : buildStandardEmail({ guest, hotelName });

  const { error: emailErr } = await getResend().emails.send({
    from: `${hotelName} <noreply@stayopshq.com>`,
    to:   guest.email,
    subject,
    html,
  });

  if (emailErr) {
    console.error('Resend error:', emailErr);
    return NextResponse.json({ error: 'Failed to send email' }, { status: 500 });
  }

  // Mark follow-up as sent
  await supabase.from('guests').update({ followup_sent: true }).eq('id', guest_id);

  return NextResponse.json({ success: true });
}

// ── Email templates ───────────────────────────────────────────────────────────

interface EmailParams {
  guest: { name: string; room_number: string; check_in: string; check_out: string };
  hotelName: string;
}

function buildStandardEmail({ guest, hotelName }: EmailParams): string {
  const firstName = guest.name.split(' ')[0];
  return emailWrapper(hotelName, `
    <p style="font-size:16px;color:#374151;line-height:1.7;margin:0 0 20px;">
      Dear ${firstName},
    </p>
    <p style="font-size:15px;color:#374151;line-height:1.8;margin:0 0 20px;">
      Thank you for choosing <strong>${hotelName}</strong> for your stay (Room ${guest.room_number}, ${formatDate(guest.check_in)} – ${formatDate(guest.check_out)}).
      We hope every moment of your visit exceeded your expectations.
    </p>
    <p style="font-size:15px;color:#374151;line-height:1.8;margin:0 0 28px;">
      Your feedback is one of the most valuable things you can share with us. An honest review —
      the details, the moments, the highlights — helps us raise the bar for every future guest, and
      helps fellow travellers make confident decisions.
    </p>
    <div style="text-align:center;margin:32px 0;">
      <a href="https://www.tripadvisor.com" style="display:inline-block;padding:16px 36px;background:#F5C451;color:#0B1A2B;border-radius:8px;font-weight:700;font-size:15px;text-decoration:none;">
        Share Your Experience
      </a>
    </div>
    <p style="font-size:14px;color:#6B7280;line-height:1.7;margin:0;">
      It takes less than two minutes — and it means everything to our team.
    </p>
  `);
}

interface ComplaintEmailParams extends EmailParams {
  complaints: Partial<Complaint>[];
  resolvedComplaints: Partial<Complaint>[];
  unresolvedComplaints: Partial<Complaint>[];
}

function buildComplaintEmail({ guest, hotelName, complaints, resolvedComplaints, unresolvedComplaints }: ComplaintEmailParams): string {
  const firstName = guest.name.split(' ')[0];
  const categories = [...new Set(complaints.map(c => c.category))].join(', ');

  const resolvedSection = resolvedComplaints.length > 0
    ? `<div style="background:#F0FDF4;border:1px solid #BBF7D0;border-radius:8px;padding:16px 20px;margin:20px 0;">
        <p style="font-size:13px;font-weight:700;color:#166534;margin:0 0 8px;text-transform:uppercase;letter-spacing:0.05em;">✓ Issues addressed during your stay</p>
        ${resolvedComplaints.map(c => `
          <div style="margin-bottom:10px;">
            <p style="font-size:14px;font-weight:600;color:#374151;margin:0 0 2px;">${c.category}</p>
            ${c.resolution ? `<p style="font-size:13px;color:#6B7280;margin:0;">${c.resolution}</p>` : ''}
            ${c.compensation ? `<p style="font-size:13px;color:#6B7280;margin:4px 0 0;"><em>Compensation offered: ${c.compensation}</em></p>` : ''}
          </div>
        `).join('')}
      </div>`
    : '';

  const unresolvedNote = unresolvedComplaints.length > 0
    ? `<p style="font-size:14px;color:#DC2626;line-height:1.7;margin:16px 0;">
        We're sorry that we were not able to fully resolve every concern during your stay.
        Your candid feedback on this will directly shape how we train our team and improve our processes.
      </p>`
    : '';

  return emailWrapper(hotelName, `
    <p style="font-size:16px;color:#374151;line-height:1.7;margin:0 0 20px;">
      Dear ${firstName},
    </p>
    <p style="font-size:15px;color:#374151;line-height:1.8;margin:0 0 16px;">
      Thank you for staying at <strong>${hotelName}</strong> (Room ${guest.room_number},
      ${formatDate(guest.check_in)} – ${formatDate(guest.check_out)}).
    </p>
    <p style="font-size:15px;color:#374151;line-height:1.8;margin:0 0 16px;">
      We know your stay wasn't perfect — you brought concerns about <strong>${categories}</strong> to
      our attention, and we want you to know those reports were taken seriously by our management team.
    </p>
    ${resolvedSection}
    ${unresolvedNote}
    <p style="font-size:15px;color:#374151;line-height:1.8;margin:16px 0 28px;">
      Your honest review — including how we handled your concerns — is exactly the kind of
      detailed, insight-rich feedback that drives real change. We would genuinely appreciate
      you taking two minutes to share your experience.
    </p>
    <div style="text-align:center;margin:32px 0;">
      <a href="https://www.tripadvisor.com" style="display:inline-block;padding:16px 36px;background:#F5C451;color:#0B1A2B;border-radius:8px;font-weight:700;font-size:15px;text-decoration:none;">
        Share Your Honest Experience
      </a>
    </div>
    <p style="font-size:14px;color:#6B7280;line-height:1.7;margin:0;">
      We hope to welcome you back and show you the stay you truly deserve.
    </p>
  `);
}

function emailWrapper(hotelName: string, body: string): string {
  return `<!DOCTYPE html>
<html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#F3F0EB;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#F3F0EB;padding:40px 0;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">

        <!-- Header -->
        <tr><td style="background:#0B1A2B;border-radius:12px 12px 0 0;padding:32px 40px;text-align:center;">
          <div style="display:inline-flex;align-items:center;gap:10px;">
            <span style="display:inline-block;width:34px;height:34px;background:#F5C451;border-radius:7px;font-size:16px;line-height:34px;text-align:center;">🛎</span>
            <span style="font-size:20px;font-weight:800;color:white;">${hotelName}</span>
          </div>
        </td></tr>

        <!-- Gold bar -->
        <tr><td style="background:#F5C451;height:4px;"></td></tr>

        <!-- Body -->
        <tr><td style="background:white;padding:40px;border-radius:0 0 12px 12px;">
          ${body}
          <hr style="border:none;border-top:1px solid #E5E7EB;margin:36px 0 24px;">
          <p style="font-size:12px;color:#9CA3AF;text-align:center;line-height:1.6;margin:0;">
            This email was sent by ${hotelName} via StayOps HQ.<br>
            You received this because you recently stayed with us.
          </p>
        </td></tr>

      </table>
    </td></tr>
  </table>
</body></html>`;
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
}
