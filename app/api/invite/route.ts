import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { getResend } from '@/lib/resend';

export async function POST(req: NextRequest) {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  // Only managers can invite
  const { data: profile } = await supabase
    .from('profiles')
    .select('hotel_id, role, full_name, hotels(name)')
    .eq('id', user.id)
    .single();

  if (!profile?.hotel_id || profile.role !== 'manager') {
    return NextResponse.json({ error: 'Only managers can invite team members' }, { status: 403 });
  }

  const { email } = await req.json();
  if (!email || typeof email !== 'string') {
    return NextResponse.json({ error: 'Valid email required' }, { status: 400 });
  }

  const admin   = createAdminClient();
  const appUrl  = process.env.NEXT_PUBLIC_APP_URL ?? 'https://stayopshq.com';
  const hotelName = (profile.hotels as unknown as { name: string } | null)?.name ?? 'your hotel';
  const inviterName = profile.full_name ?? 'Your manager';

  // Generate the invite link without sending Supabase's default email
  const { data: linkData, error: linkErr } = await admin.auth.admin.generateLink({
    type: 'invite',
    email,
    options: {
      redirectTo: `${appUrl}/auth/callback`,
      data: { hotel_id: profile.hotel_id, role: 'manager' },
    },
  });

  if (linkErr || !linkData?.properties?.action_link) {
    return NextResponse.json({ error: linkErr?.message ?? 'Could not generate invite link' }, { status: 400 });
  }

  const inviteUrl = linkData.properties.action_link;

  // Send branded email via Resend
  const resend = getResend();
  const { error: emailErr } = await resend.emails.send({
    from: 'StayOps HQ <hello@stayopshq.com>',
    to:   email,
    subject: `You've been invited to join ${hotelName} on StayOps HQ`,
    html: inviteEmailHtml({ inviterName, hotelName, inviteUrl }),
  });

  if (emailErr) {
    return NextResponse.json({ error: 'Invite link generated but email failed to send' }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}

function inviteEmailHtml({ inviterName, hotelName, inviteUrl }: {
  inviterName: string;
  hotelName: string;
  inviteUrl: string;
}): string {
  return `<!DOCTYPE html>
<html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#F3F0EB;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#F3F0EB;padding:40px 0;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">

        <!-- Header -->
        <tr><td style="background:#0B1A2B;border-radius:12px 12px 0 0;padding:32px 40px;text-align:center;">
          <div style="display:inline-flex;align-items:center;gap:10px;">
            <span style="display:inline-block;width:34px;height:34px;background:#F5C451;border-radius:7px;font-size:18px;line-height:34px;text-align:center;">🛎</span>
            <span style="font-size:20px;font-weight:800;color:white;">StayOps HQ</span>
          </div>
        </td></tr>

        <!-- Gold bar -->
        <tr><td style="background:#F5C451;height:4px;"></td></tr>

        <!-- Body -->
        <tr><td style="background:white;padding:40px;border-radius:0 0 12px 12px;">

          <h1 style="font-size:22px;font-weight:800;color:#0B1A2B;margin:0 0 12px;">
            You've been invited to join ${hotelName}
          </h1>

          <p style="font-size:15px;color:#4B5563;line-height:1.7;margin:0 0 24px;">
            <strong style="color:#0B1A2B;">${inviterName}</strong> has invited you to manage guest feedback at
            <strong style="color:#0B1A2B;">${hotelName}</strong> using StayOps HQ.
          </p>

          <p style="font-size:14px;color:#6B7280;line-height:1.7;margin:0 0 8px;">As a manager you'll have access to:</p>
          <ul style="font-size:14px;color:#6B7280;line-height:1.9;margin:0 0 32px;padding-left:20px;">
            <li>Live guest opportunity dashboard</li>
            <li>Full guest opportunity database</li>
            <li>Analytics &amp; KPIs</li>
            <li>Continuous improvement tracking</li>
          </ul>

          <!-- CTA -->
          <table cellpadding="0" cellspacing="0" style="margin:0 0 32px;">
            <tr>
              <td style="background:#F5C451;border-radius:8px;padding:0;">
                <a href="${inviteUrl}" style="display:inline-block;padding:14px 36px;font-size:15px;font-weight:700;color:#0B1A2B;text-decoration:none;border-radius:8px;">
                  Accept Invitation →
                </a>
              </td>
            </tr>
          </table>

          <p style="font-size:13px;color:#9CA3AF;margin:0 0 8px;">
            Or copy this link into your browser:
          </p>
          <p style="font-size:12px;color:#9CA3AF;word-break:break-all;margin:0 0 24px;">
            ${inviteUrl}
          </p>

          <hr style="border:none;border-top:1px solid #E5E7EB;margin:0 0 24px;">
          <p style="font-size:12px;color:#9CA3AF;text-align:center;line-height:1.6;margin:0;">
            This invitation was sent by ${inviterName} via StayOps HQ.<br>
            If you didn't expect this, you can safely ignore this email.
          </p>

        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`;
}
