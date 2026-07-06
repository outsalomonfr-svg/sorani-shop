import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import MetaPixel from '@/components/layout/MetaPixel';
import PublicChrome from '@/components/layout/PublicChrome';
import { SettingsProvider } from '@/components/settings/SettingsProvider';
import { CategoriesProvider } from '@/components/settings/CategoriesProvider';
import { getSiteSettings } from '@/lib/site-settings';
import { createClient } from '@/lib/supabase/server';

const inter = Inter({ subsets: ['latin'], display: 'swap', variable: '--font-inter' });

export const metadata: Metadata = {
  title: 'SORANI | Bijoux faits avec amour',
  description: 'Decouvrez les bijoux SORANI, des creations uniques faites avec amour. Colliers, bracelets, boucles d\'oreilles et bagues artisanaux.',
  keywords: ['bijoux', 'bijoux artisanaux', 'colliers', 'bracelets', 'boucles d\'oreilles', 'SORANI'],
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const settings = await getSiteSettings();
  const supabase = await createClient();
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
