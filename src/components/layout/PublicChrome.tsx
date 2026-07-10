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
  const isHome = pathname === '/';

  if (hideChrome) {
    return <main className="min-h-screen">{children}</main>;
  }

  return (
    <>
      <ScrollReveal />
      <Navbar />
      <CartDrawer />
      {/* Sur l'accueil, la photo remonte sous la barre transparente (façon ZAG) */}
      <main className="min-h-screen" style={isHome ? { marginTop: '-80px' } : undefined}>
        {children}
      </main>
      <Footer />
      <CookieBanner />
    </>
  );
}
