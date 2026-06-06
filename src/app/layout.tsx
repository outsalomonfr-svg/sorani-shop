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
  const { data: categoriesData } = await supabase
    .from('categories')
    .select('id, slug, name')
    .order('name');
  const categories = categoriesData ?? [];

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
