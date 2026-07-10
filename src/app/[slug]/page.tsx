import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { createClient } from '@/lib/supabase/server';
import type { Page } from '@/types/page';

async function fetchPage(slug: string): Promise<Page | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from('pages')
    .select('*')
    .eq('slug', slug)
    .eq('status', 'published')
    .single();
  return (data as Page) || null;
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const page = await fetchPage(slug);
  if (!page) return {};
  return {
    title: `${page.seo_title || page.title} | SORANI`,
    description: page.seo_description || undefined,
  };
}

export default async function DynamicPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const page = await fetchPage(slug);

  if (!page) notFound();

  return (
    <article className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20" data-reveal>
      <h1 className="text-3xl md:text-5xl font-bold mb-8 tracking-tight" style={{ color: 'var(--brand-blue)' }}>
        {page.title}
      </h1>
      <div
        className="prose prose-lg max-w-none prose-headings:text-[#1B4965] prose-a:text-[#1B4965]"
        style={{ textAlign: 'justify' }}
      >
        <ReactMarkdown remarkPlugins={[remarkGfm]}>{page.content}</ReactMarkdown>
      </div>
    </article>
  );
}
