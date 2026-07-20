'use client';

import { usePathname } from 'next/navigation';
import Navbar from './Navbar';
import Footer from './Footer';
import CartDrawer from '@/components/cart/CartDrawer';
import ScrollReveal from '@/components/animations/ScrollReveal';
import CookieBanner from './CookieBanner';

export default function PublicChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdmin = pathname?.startsWith('/admin');
  const isAuth = pathname === '/login' || pathname === '/register';
  const hideChrome = isAdmin || isAuth;

  if (hideChrome) {
    return <main className="min-h-screen">{children}</main>;
  }

  return (
    <>
      <ScrollReveal />
      <Navbar />
      <CartDrawer />
      {/* Barre nette et stable : plus de remontée de la photo (qui provoquait un saut au chargement) */}
      <main className="min-h-screen">{children}</main>
      <Footer />
      <CookieBanner />
    </>
  );
}
