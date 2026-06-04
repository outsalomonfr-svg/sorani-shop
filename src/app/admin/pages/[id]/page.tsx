import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import PageEditor from '@/components/admin/PageEditor';
import type { Page } from '@/types/page';

export default async function EditPagePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data, error } = await supabase.from('pages').select('*').eq('id', id).single();

  if (error || !data) {
    notFound();
  }

  return <PageEditor page={data as Page} />;
}
