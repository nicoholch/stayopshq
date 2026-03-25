import Link from 'next/link';

export const metadata = { title: 'Terms of Service — StayOps HQ' };

export default function TermsPage() {
  const section = (title: string, children: React.ReactNode) => (
    <div style={{ marginBottom: 40 }}>
      <h2 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: 12, color: '#0B1A2B' }}>{title}</h2>
      <div style={{ color: '#4B5563', lineHeight: 1.8, fontSize: 15 }}>{children}</div>
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', background: '#F8F6F2' }}>
      <div style={{ maxWidth: 720, margin: '0 auto', padding: '80px 24px 96px' }}>

        <Link href="/" style={{ fontSize: 13, color: '#6B7280', textDecoration: 'none', display: 'inline-block', marginBottom: 40 }}>← Back to homepage</Link>

        <h1 style={{ fontSize: '2.2rem', fontWeight: 800, color: '#0B1A2B', marginBottom: 8 }}>Terms of Service</h1>
        <p style={{ color: '#6B7280', fontSize: 14, marginBottom: 56 }}>Last updated: March 2026</p>

        {section('1. Acceptance of Terms', <p>By creating an account or using StayOps HQ, you agree to these Terms of Service. If you do not agree, do not use the service.</p>)}

        {section('2. Service Description', <p>StayOps HQ is a SaaS platform that enables hotel staff to log guest complaints and allows management to track and resolve those complaints in real time. The service is provided on a subscription basis.</p>)}

        {section('3. Account Registration', <>
          <p>You must provide accurate information when creating an account. You are responsible for maintaining the security of your account credentials. You must notify us immediately of any unauthorised access at <a href="mailto:hello@stayopshq.com" style={{ color: '#C49B28' }}>hello@stayopshq.com</a>.</p>
        </>)}

        {section('4. Subscription & Billing', <>
          <ul style={{ paddingLeft: 20, display: 'flex', flexDirection: 'column', gap: 8 }}>
            <li>Paid plans are billed monthly in advance via Stripe.</li>
            <li>All plans include a 14-day free trial. No credit card is required to start a trial.</li>
            <li>You may cancel your subscription at any time from the billing portal. Cancellation takes effect at the end of the current billing period.</li>
            <li>We do not offer refunds for partial billing periods.</li>
            <li>We reserve the right to change pricing with 30 days' notice to active subscribers.</li>
          </ul>
        </>)}

        {section('5. Acceptable Use', <>
          <p>You agree not to use StayOps HQ to:</p>
          <ul style={{ paddingLeft: 20, marginTop: 12, display: 'flex', flexDirection: 'column', gap: 8 }}>
            <li>Store or transmit any unlawful, defamatory, or harmful content</li>
            <li>Attempt to gain unauthorised access to other accounts or systems</li>
            <li>Reverse-engineer, decompile, or resell the service</li>
            <li>Use the service for any purpose other than legitimate hotel operations management</li>
          </ul>
        </>)}

        {section('6. Data & Privacy', <p>Your use of StayOps HQ is also governed by our <Link href="/privacy" style={{ color: '#C49B28' }}>Privacy Policy</Link>. You retain ownership of all data you input into the service.</p>)}

        {section('7. Uptime & Support', <p>We aim for 99.5% uptime. Planned maintenance will be communicated in advance where possible. Support is available via email at <a href="mailto:hello@stayopshq.com" style={{ color: '#C49B28' }}>hello@stayopshq.com</a>.</p>)}

        {section('8. Limitation of Liability', <p>StayOps HQ is provided "as is." To the maximum extent permitted by law, we are not liable for any indirect, incidental, or consequential damages arising from your use of the service. Our total liability shall not exceed the amount you paid us in the three months preceding the claim.</p>)}

        {section('9. Termination', <p>We reserve the right to suspend or terminate accounts that violate these terms. You may terminate your account at any time by cancelling your subscription and contacting us to delete your data.</p>)}

        {section('10. Governing Law', <p>These terms are governed by the laws of the State of Delaware, United States, without regard to its conflict of law provisions. Any disputes shall be resolved in the state or federal courts located in Delaware.</p>)}

        {section('11. Changes to Terms', <p>We may update these terms from time to time. Active subscribers will be notified by email of material changes with at least 14 days' notice.</p>)}

        <div style={{ borderTop: '1px solid #E5E0D8', paddingTop: 32, display: 'flex', gap: 24 }}>
          <Link href="/privacy" style={{ fontSize: 14, color: '#C49B28', textDecoration: 'none' }}>Privacy Policy →</Link>
          <Link href="/" style={{ fontSize: 14, color: '#6B7280', textDecoration: 'none' }}>Back to Homepage</Link>
        </div>
      </div>
    </div>
  );
}
