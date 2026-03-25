import { notFound } from 'next/navigation';
import { createAdminClient } from '@/lib/supabase/admin';
import CaptureClient from './CaptureClient';

interface Props {
  params: Promise<{ slug: string }>;
}

export default async function SlugCapturePage({ params }: Props) {
  const { slug } = await params;
  const supabase = createAdminClient();

  const { data: hotel } = await supabase
    .from('hotels')
    .select('id, name')
    .eq('slug', slug)
    .single();

  if (!hotel) notFound();

  return <CaptureClient hotelId={hotel.id} hotelName={hotel.name} />;
}
