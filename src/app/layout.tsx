import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import MetaPixel from '@/components/layout/MetaPixel';
import PublicChrome from '@/components/layout/PublicChrome';
import { SettingsProvider } from '@/components/settings/SettingsProvider';
import { CategoriesProvider } from '@/components/settings/CategoriesProvider';
import { getSiteSettings } from '@/lib/site-settings';
import { createPublicClient } from '@/lib/supabase/admin';

const inter = Inter({ subsets: ['latin'], display: 'swap', variable: '--font-inter' });

const SITE_URL = 'https://www.soranibijoux.com';
const OG_DESCRIPTION =
  'Bijoux faits avec amour — créations uniques en acier inoxydable et pierres naturelles. Livraison offerte en France.';

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings();
  const ogImage = settings.hero?.imageUrl || `${SITE_URL}/images/hero-1.png`;
  return {
    metadataBase: new URL(SITE_URL),
    title: 'SORANI | Bijoux faits avec amour',
    description:
      "Decouvrez les bijoux SORANI, des creations uniques faites avec amour. Colliers, bracelets, boucles d'oreilles et bagues artisanaux.",
    keywords: ['bijoux', 'bijoux artisanaux', 'colliers', 'bracelets', "boucles d'oreilles", 'SORANI'],
    openGraph: {
      type: 'website',
      locale: 'fr_FR',
      url: SITE_URL,
      siteName: 'SORANI Bijoux',
      title: 'SORANI — Bijoux faits avec amour',
      description: OG_DESCRIPTION,
      images: [{ url: ogImage, width: 1200, height: 630, alt: 'SORANI Bijoux' }],
    },
    twitter: {
      card: 'summary_large_image',
      title: 'SORANI — Bijoux faits avec amour',
      description: OG_DESCRIPTION,
      images: [ogImage],
    },
  };
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const settings = await getSiteSettings();
  const supabase = createPublicClient();
  const [{ data: categoriesData }, { data: activeProducts }] = await Promise.all([
    supabase.from('categories').select('id, slug, name').order('name'),
    supabase.from('products').select('category_id').eq('is_active', true),
  ]);
  // Affiche uniquement les catégories ayant un produit actif ET non masquées dans l'admin
  const usedCategoryIds = new Set((activeProducts ?? []).map((p) => p.category_id).filter(Boolean));
  const hiddenSlugs = new Set(settings.hiddenCategorySlugs ?? []);
  const categories = (categoriesData ?? []).filter(
    (c) => usedCategoryIds.has(c.id) && !hiddenSlugs.has(c.slug)
  );

  return (
    <html lang="fr" className={inter.variable}>
      <body className={`${inter.className} bg-white antialiased`}>
        <SettingsProvider initial={settings}>
          <CategoriesProvider categories={categories}>
            <MetaPixel />
            <PublicChrome>{children}</PublicChrome>
          </CategoriesProvider>
        </SettingsProvider>
      </body>
    </html>
  );
}
