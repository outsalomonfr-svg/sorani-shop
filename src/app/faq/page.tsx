import type { Metadata } from 'next';
import Link from 'next/link';
import { getSiteSettings } from '@/lib/site-settings';
import { DEFAULT_SETTINGS } from '@/types/site-settings';
import FaqAccordion from '@/components/FaqAccordion';

export const metadata: Metadata = {
  title: 'FAQ — Questions fréquentes | SORANI',
  description: 'Livraison, paiement, retours, entretien : toutes les réponses à vos questions.',
};

// Sans cette ligne la page etait figee a la construction du site : les
// modifications de la FAQ faites depuis l'admin n'apparaissaient jamais en ligne.
export const revalidate = 300;

export default async function FaqPage() {
  const settings = await getSiteSettings();
  const faq = settings.faq ?? DEFAULT_SETTINGS.faq ?? [];

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20" data-reveal>
      <div className="text-center mb-12 md:mb-16">
        <p className="text-[11px] uppercase tracking-[0.28em] opacity-60 mb-4">Aide</p>
        <h1
          className="text-4xl md:text-5xl leading-tight"
          style={{ fontFamily: 'var(--font-heading)', color: 'var(--brand-blue)' }}
        >
          Questions fréquentes
        </h1>
        <div className="w-12 h-px mx-auto my-6 bg-black/20" />
        <p className="text-sm md:text-base opacity-70 max-w-md mx-auto leading-relaxed">
          Tout ce qu’il faut savoir sur les commandes, la livraison, les retours et l’entretien.
        </p>
      </div>

      <FaqAccordion items={faq} />

      <div className="mt-14 pt-10 border-t border-black/10 text-center">
        <p className="text-sm opacity-70 mb-4">Une autre question&nbsp;?</p>
        <Link
          href="/contact"
          className="inline-flex items-center justify-center rounded-full text-white py-3 px-8 text-[11px] uppercase tracking-[0.22em] transition hover:opacity-90"
          style={{ background: 'var(--brand-blue)' }}
        >
          Nous contacter
        </Link>
      </div>
    </div>
  );
}
