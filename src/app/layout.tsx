import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import CartDrawer from '@/components/cart/CartDrawer';
import MetaPixel from '@/components/layout/MetaPixel';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'SORANI | Bijoux faits avec amour',
  description: 'Decouvrez les bijoux SORANI, des creations uniques faites avec amour. Colliers, bracelets, boucles d\'oreilles et bagues artisanaux.',
  keywords: ['bijoux', 'bijoux artisanaux', 'colliers', 'bracelets', 'boucles d\'oreilles', 'SORANI'],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr">
      <body className={`${inter.className} bg-gray-50`}>
        <MetaPixel />
        <Navbar />
        <CartDrawer />
        <main className="min-h-screen">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
