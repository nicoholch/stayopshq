/**
 * Generates /sitemap.xml automatically.
 * Next.js submits this to Google Search Console.
 * Add dynamic hotel public pages here once you have real data.
 */

import { MetadataRoute } from 'next';
import { createAdminClient } from '@/lib/supabase/admin';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://pulsestay.com';

  // Static marketing pages
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: baseUrl, lastModified: new Date(), changeFrequency: 'weekly', priority: 1 },
    { url: `${baseUrl}/#features`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.8 },
    { url: `${baseUrl}/#pricing`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.9 },
  ];

  // Dynamic hotel public pages — fetched from DB
  try {
    const supabase = createAdminClient();
    const { data: hotels } = await supabase
      .from('hotels')
      .select('slug, updated_at')
      .eq('public_page_enabled', true);

    const hotelRoutes: MetadataRoute.Sitemap = (hotels ?? []).map(hotel => ({
      url: `${baseUrl}/${hotel.slug}`,
      lastModified: new Date(hotel.updated_at),
      changeFrequency: 'daily' as const,
      priority: 0.7,
    }));

    return [...staticRoutes, ...hotelRoutes];
  } catch {
    return staticRoutes;
  }
}
