import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { ArrowRight } from 'lucide-react';
import { createPublicClient } from '@/lib/supabase/admin';
import { getSiteSettings } from '@/lib/site-settings';

export const metadata: Metadata = {
  title: 'À propos | SORANI',
  description: "L'histoire de SORANI Bijoux, par Sofia, sa créatrice.",
};

export const revalidate = 300;

export default async function AboutPage() {
  const supabase = createPublicClient();
  const { data: page } = await supabase
    .from('pages')
    .select('content')
    .eq('slug', 'about')
    .eq('status', 'published')
    .single();

  const settings = await getSiteSettings();
  const photo = settings.story?.imageUrl || '/images/sorani-card.jpg';

  // On retire un éventuel titre markdown en tête (on affiche notre propre titre)
  const content = (page?.content || '')
    .replace(/^\s*#\s.*\n+/, '')
    .trim();

  return (
    <div className="relative overflow-hidden">
      {/* halo décoratif discret */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-32 -right-40 w-[520px] h-[520px] rounded-full blur-3xl opacity-[0.06]"
        style={{ background: 'var(--brand-blue)' }}
      />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
        {/* En-tête */}
        <div className="text-center mb-14 md:mb-20" data-reveal>
          <p className="text-[11px] uppercase tracking-[0.34em] opacity-50 mb-4">L’histoire SORANI</p>
          <h1
            className="text-5xl md:text-7xl leading-none"
            style={{ fontFamily: 'var(--font-heading)', color: 'var(--brand-blue)' }}
          >
            À propos
          </h1>
          <div className="w-14 h-px mx-auto mt-8" style={{ background: 'var(--brand-blue)', opacity: 0.35 }} />
        </div>

        {/* Photo + texte */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-16 items-center">
          {/* Photo */}
          <div className="md:sticky md:top-28" data-reveal>
            <div
              className="relative aspect-[4/5] w-full overflow-hidden rounded-[24px]"
              style={{ boxShadow: '0 24px 60px rgba(0,0,0,0.14)' }}
              data-sorani-edit="story"
              data-sorani-field="imageUrl"
              data-sorani-label="Photo — page À propos (réglable dans Apparence)"
            >
              <Image
                src={photo}
                alt="Sofia, créatrice de SORANI Bijoux"
                fill
                sizes="(max-width: 768px) 100vw, 45vw"
                className="object-cover"
              />
            </div>
          </div>

          {/* Texte */}
          <div data-reveal>
            <div
              className="prose prose-lg max-w-none prose-headings:text-[color:var(--brand-blue)] prose-p:leading-[1.9]"
              style={{ textAlign: 'justify' }}
            >
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
            </div>

            {/* Signature */}
            <p
              className="mt-8 text-3xl"
              style={{ fontFamily: 'var(--font-heading)', color: 'var(--brand-blue)' }}
            >
              — Sofia
            </p>

            {/* Bouton */}
            <div className="mt-10">
              <Link
                href="/shop"
                className="inline-flex items-center gap-3 rounded-full text-white py-3.5 px-9 text-[12px] uppercase tracking-[0.22em] transition hover:opacity-90"
                style={{ background: 'var(--brand-blue)', boxShadow: '0 10px 30px rgba(56,69,173,0.28)' }}
              >
                Découvrir mes créations
                <ArrowRight size={15} />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
