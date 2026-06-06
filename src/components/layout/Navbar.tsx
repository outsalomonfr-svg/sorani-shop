'use client';

import Link from 'next/link';
import Image from 'next/image';
import { ShoppingBag, Menu, X, Search, User } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useCart } from '@/hooks/useCart';
import { useSiteSettings } from '@/components/settings/SettingsProvider';

export default function Navbar() {
  const settings = useSiteSettings();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { openCart, totalItems } = useCart();
  const itemCount = totalItems();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const visibleLinks = settings.nav.links.filter((l) => l.visible !== false);

  return (
    <>
      {settings.announcement.enabled && settings.announcement.text && (
        <div
          className="text-white text-center text-[10px] uppercase tracking-[0.32em] py-2.5 px-4"
          style={{ background: 'var(--brand-blue)' }}
          data-sorani-edit="announcement"
          data-sorani-label="Barre d'annonce"
        >
          {settings.announcement.link ? (
            <Link href={settings.announcement.link} className="hover:opacity-80 transition-opacity">
              {settings.announcement.text}
            </Link>
          ) : (
            settings.announcement.text
          )}
        </div>
      )}

      <header
        className="sticky top-0 z-50 transition-all duration-500"
        style={{
          background: 'rgba(255,255,255,0.92)',
          backdropFilter: 'blur(14px)',
          WebkitBackdropFilter: 'blur(14px)',
          borderBottom: scrolled ? '1px solid rgba(0,0,0,0.06)' : '1px solid transparent',
        }}
      >
        <div className="max-w-7xl mx-auto px-6 lg:px-10">
          <div
            className="grid items-center transition-all duration-500"
            style={{
              gridTemplateColumns: '1fr auto 1fr',
              height: scrolled ? '56px' : '76px',
            }}
          >
            {/* Left : mobile menu + nav desktop */}
            <div className="flex items-center justify-start gap-8">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="sm:hidden p-1.5 -ml-1.5 transition"
                aria-label="Menu"
              >
                {isMenuOpen ? <X size={18} strokeWidth={1.5} /> : <Menu size={18} strokeWidth={1.5} />}
              </button>

              <nav
                className="hidden sm:flex items-center gap-7 lg:gap-9"
                data-sorani-edit="nav"
                data-sorani-label="Menu de navigation"
                style={{ fontFamily: 'var(--font-nav)' }}
              >
                {visibleLinks.slice(0, Math.ceil(visibleLinks.length / 2)).map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="link-underline text-[10px] uppercase tracking-[0.32em] text-gray-700 hover:text-black transition-colors"
                    style={{ fontWeight: 400 }}
                  >
                    {link.label}
                  </Link>
                ))}
              </nav>
            </div>

            {/* Center : Logo */}
            <Link
              href="/"
              className="flex items-center justify-center"
              data-sorani-edit="brand"
              data-sorani-label="Logo / nom de la marque"
            >
              {settings.brand.logoUrl ? (
                <Image
                  src={settings.brand.logoUrl}
                  alt={settings.brand.name}
                  width={140}
                  height={42}
                  className="w-auto transition-all duration-500"
                  style={{ height: scrolled ? '24px' : '30px' }}
                />
              ) : (
                <span
                  className="tracking-[0.42em] uppercase transition-all duration-500"
                  style={{
                    color: 'var(--brand-blue)',
                    fontFamily: 'var(--font-heading)',
                    fontSize: scrolled ? '13px' : '16px',
                    fontWeight: 400,
                  }}
                >
                  {settings.brand.name}
                </span>
              )}
            </Link>

            {/* Right : second half of nav + icons */}
            <div className="flex items-center justify-end gap-7">
              <nav
                className="hidden sm:flex items-center gap-7 lg:gap-9"
                style={{ fontFamily: 'var(--font-nav)' }}
              >
                {visibleLinks.slice(Math.ceil(visibleLinks.length / 2)).map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="link-underline text-[10px] uppercase tracking-[0.32em] text-gray-700 hover:text-black transition-colors"
                    style={{ fontWeight: 400 }}
                  >
                    {link.label}
                  </Link>
                ))}
              </nav>

              <div className="flex items-center gap-5">
                <button
                  className="p-1 text-gray-700 hover:text-black transition-colors"
                  aria-label="Recherche"
                >
                  <Search size={16} strokeWidth={1.5} />
                </button>
                <Link
                  href="/login"
                  className="p-1 text-gray-700 hover:text-black transition-colors"
                  aria-label="Compte"
                >
                  <User size={16} strokeWidth={1.5} />
                </Link>
                <button
                  onClick={openCart}
                  className="relative p-1 text-gray-700 hover:text-black transition-colors"
                  aria-label="Panier"
                >
                  <ShoppingBag size={16} strokeWidth={1.5} />
                  {itemCount > 0 && (
                    <span
                      className="absolute -top-1 -right-1 text-white text-[9px] rounded-full h-4 w-4 flex items-center justify-center font-medium"
                      style={{ background: 'var(--brand-blue)' }}
                    >
                      {itemCount}
                    </span>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Mobile menu */}
          {isMenuOpen && (
            <div
              className="sm:hidden pb-8 pt-2"
              style={{ borderTop: '1px solid rgba(0,0,0,0.06)' }}
            >
              <nav
                className="flex flex-col gap-5 pt-6"
                style={{ fontFamily: 'var(--font-nav)' }}
              >
                {visibleLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="text-[11px] uppercase tracking-[0.32em] text-gray-800"
                    style={{ fontWeight: 400 }}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {link.label}
                  </Link>
                ))}
              </nav>
            </div>
          )}
        </div>
      </header>
    </>
  );
}
