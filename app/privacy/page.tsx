import Link from 'next/link';

export const metadata = { title: 'Privacy Policy — StayOps HQ' };

export default function PrivacyPage() {
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

        <h1 style={{ fontSize: '2.2rem', fontWeight: 800, color: '#0B1A2B', marginBottom: 8 }}>Privacy Policy</h1>
        <p style={{ color: '#6B7280', fontSize: 14, marginBottom: 56 }}>Last updated: March 2026</p>

        {section('1. Who We Are', <p>StayOps HQ is a hotel complaint management platform operated by StayOps HQ. For any privacy-related questions, contact us at <a href="mailto:hello@stayopshq.com" style={{ color: '#C49B28' }}>hello@stayopshq.com</a>.</p>)}

        {section('2. What Data We Collect', <>
          <p style={{ marginBottom: 12 }}>We collect the following data when you use our service:</p>
          <ul style={{ paddingLeft: 20, display: 'flex', flexDirection: 'column', gap: 8 }}>
            <li><strong>Account data:</strong> Email address and password (hashed) when you create an account.</li>
            <li><strong>Hotel data:</strong> Hotel name, property type, and departments you configure during onboarding.</li>
            <li><strong>Operational data:</strong> Guest issues, complaints, and resolutions logged by your staff.</li>
            <li><strong>Billing data:</strong> Subscription and payment information processed by Stripe. We do not store card details.</li>
            <li><strong>Guest data:</strong> Guest names, room numbers, and email addresses you add for follow-up purposes.</li>
          </ul>
        </>)}

        {section('3. How We Use Your Data', <>
          <p>We use your data solely to provide and improve the StayOps HQ service:</p>
          <ul style={{ paddingLeft: 20, marginTop: 12, display: 'flex', flexDirection: 'column', gap: 8 }}>
            <li>To operate the complaint management dashboard and real-time notifications</li>
            <li>To process subscription payments via Stripe</li>
            <li>To send automated follow-up emails to guests (only when you initiate this)</li>
            <li>To generate analytics and insights about your property's performance</li>
          </ul>
        </>)}

        {section('4. Data Storage & Security', <p>Your data is stored on Supabase infrastructure hosted on AWS. All data is encrypted in transit (TLS) and at rest. We apply Row Level Security (RLS) to ensure hotel data is never accessible across accounts.</p>)}

        {section('5. Third-Party Services', <>
          <p>We use the following third-party services:</p>
          <ul style={{ paddingLeft: 20, marginTop: 12, display: 'flex', flexDirection: 'column', gap: 8 }}>
            <li><strong>Supabase</strong> — database and authentication</li>
            <li><strong>Stripe</strong> — payment processing</li>
            <li><strong>Vercel</strong> — application hosting</li>
            <li><strong>Resend</strong> — transactional email</li>
          </ul>
          <p style={{ marginTop: 12 }}>We do not sell your data to any third party.</p>
        </>)}

        {section('6. Data Retention', <p>We retain your data for as long as your account is active. If you cancel your subscription and close your account, we will delete your data within 30 days upon written request to <a href="mailto:hello@stayopshq.com" style={{ color: '#C49B28' }}>hello@stayopshq.com</a>.</p>)}

        {section('7. Your Rights', <p>You have the right to access, correct, export, or delete your personal data at any time. Contact us at <a href="mailto:hello@stayopshq.com" style={{ color: '#C49B28' }}>hello@stayopshq.com</a> to exercise these rights.</p>)}

        {section('8. Cookies', <p>We use only essential session cookies required for authentication. We do not use tracking or advertising cookies.</p>)}

        {section('9. Changes to This Policy', <p>We may update this policy from time to time. We will notify active subscribers of material changes by email.</p>)}

        <div style={{ borderTop: '1px solid #E5E0D8', paddingTop: 32, display: 'flex', gap: 24 }}>
          <Link href="/terms" style={{ fontSize: 14, color: '#C49B28', textDecoration: 'none' }}>Terms of Service →</Link>
          <Link href="/" style={{ fontSize: 14, color: '#6B7280', textDecoration: 'none' }}>Back to Homepage</Link>
        </div>
      </div>
    </div>
  );
}
