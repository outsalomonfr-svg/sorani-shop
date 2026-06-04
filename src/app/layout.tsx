import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import MetaPixel from '@/components/layout/MetaPixel';
import PublicChrome from '@/components/layout/PublicChrome';
import { SettingsProvider } from '@/components/settings/SettingsProvider';
import { getSiteSettings } from '@/lib/site-settings';

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

  return (
    <html lang="fr" className={inter.variable}>
      <body className={`${inter.className} bg-white antialiased`}>
        <SettingsProvider initial={settings}>
          <MetaPixel />
          <PublicChrome>{children}</PublicChrome>
        </SettingsProvider>
      </body>
    </html>
  );
}
