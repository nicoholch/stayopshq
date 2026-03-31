import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Allow images from Supabase storage buckets
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.supabase.co',
      },
    ],
  },

  // Block non-production deployments (e.g. pulsestay-xxx.vercel.app) from being indexed
  async headers() {
    if (process.env.VERCEL_ENV !== 'production') {
      return [{ source: '/(.*)', headers: [{ key: 'X-Robots-Tag', value: 'noindex' }] }];
    }
    return [];
  },
};

export default nextConfig;
