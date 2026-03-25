import type { Metadata, Viewport } from 'next';
import { Inter, Playfair_Display } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'], weight: ['400', '500', '600', '700'], variable: '--font-sans' });
const playfair = Playfair_Display({ subsets: ['latin'], weight: ['400', '500', '700'], variable: '--font-serif' });

// ─── Default SEO metadata ─────────────────────────────────────────────────────
// Individual pages can override any of these with their own `export const metadata`
export const metadata: Metadata = {
  // Core
  title: {
    default: 'StayOps HQ — Real-Time Guest Feedback for 5-Star Hotels',
    template: '%s | StayOps HQ',
  },
  description:
    'Capture guest feedback in real time — during the stay, not after. Triple your feedback conversion rate and surface actionable insights with AI-powered analysis.',

  // Canonical URL — important for avoiding duplicate-content penalties
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? 'https://guestopshq.com'),

  // Open Graph — controls how links look when shared on Slack, LinkedIn, iMessage, etc.
  openGraph: {
    type: 'website',
    siteName: 'StayOps HQ',
    title: 'StayOps HQ — Real-Time Guest Feedback for 5-Star Hotels',
    description:
      'Most hotels capture only 10% of guest feedback. StayOps HQ captures 30%+ by meeting guests in the moment.',
    url: '/',
    images: [
      {
        url: '/og-image.png',   // 1200×630px image in /public folder
        width: 1200,
        height: 630,
        alt: 'StayOps HQ dashboard showing live guest feedback',
      },
    ],
  },

  // Twitter / X card
  twitter: {
    card: 'summary_large_image',
    title: 'StayOps HQ — Real-Time Guest Feedback',
    description: 'Triple your hotel feedback conversion rate with in-stay capture.',
    images: ['/og-image.png'],
  },

  // Robots
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, 'max-image-preview': 'large' },
  },

  // Favicons (place these files in /public)
  icons: {
    icon: '/favicon.ico',
    apple: '/apple-touch-icon.png',
  },
};

export const viewport: Viewport = {
  themeColor: '#0D1B2A',
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${playfair.variable}`}>
      <body>{children}</body>
    </html>
  );
}
