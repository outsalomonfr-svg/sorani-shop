'use client';

import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
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

  // false par défaut → sur mobile la photo ne remonte pas sous la barre (qui reste blanche)
  const [isDesktop, setIsDesktop] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia('(min-width: 640px)');
    const on = () => setIsDesktop(mq.matches);
    on();
    mq.addEventListener('change', on);
    return () => mq.removeEventListener('change', on);
  }, []);

  if (hideChrome) {
    return <main className="min-h-screen">{children}</main>;
  }

  return (
    <>
      <ScrollReveal />
      <Navbar />
      <CartDrawer />
      {/* Sur l'accueil (desktop), la photo remonte sous la barre transparente (façon ZAG) */}
      <main className="min-h-screen" style={isHome && isDesktop ? { marginTop: '-80px' } : undefined}>
        {children}
      </main>
      <Footer />
      <CookieBanner />
    </>
  );
}
