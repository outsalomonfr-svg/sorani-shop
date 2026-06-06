'use client';

import Link from 'next/link';
import Image from 'next/image';
import { ShoppingBag, Menu, X, Search, User } from 'lucide-react';
import { useState } from 'react';
import { useCart } from '@/hooks/useCart';
import { useSiteSettings } from '@/components/settings/SettingsProvider';

export default function Navbar() {
  const settings = useSiteSettings();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { openCart, totalItems } = useCart();
  const itemCount = totalItems();

  return (
    <>
      {settings.announcement.enabled && settings.announcement.text && (
        <div
          className="text-white text-center text-xs py-2 px-4"
          style={{ background: 'var(--brand-blue)' }}
          data-sorani-edit="announcement"
          data-sorani-label="Barre d'annonce"
        >
          {settings.announcement.link ? (
            <Link href={settings.announcement.link} className="hover:underline">
              {settings.announcement.text}
            </Link>
          ) : (
            settings.announcement.text
          )}
        </div>
      )}

      <header className="bg-white border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="sm:hidden p-2 text-gray-600 transition"
              style={{ color: isMenuOpen ? 'var(--brand-blue)' : undefined }}
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>

            <Link
              href="/"
              className="flex items-center"
              data-sorani-edit="brand"
              data-sorani-label="Logo / nom de la marque"
            >
              {settings.brand.logoUrl ? (
                <Image
                  src={settings.brand.logoUrl}
                  alt={settings.brand.name}
                  width={120}
                  height={40}
                  className="h-10 w-auto"
                />
              ) : (
                <span
                  className="text-xl font-bold tracking-tight"
                  style={{ color: 'var(--brand-blue)' }}
                >
                  {settings.brand.name}
                </span>
              )}
            </Link>

            <nav
              className="hidden sm:flex items-center space-x-8"
              data-sorani-edit="nav"
              data-sorani-label="Menu de navigation"
              style={{ fontFamily: 'var(--font-nav)' }}
            >
              {settings.nav.links.filter((l) => l.visible !== false).map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-gray-700 transition font-medium hover:opacity-75 text-[17px] tracking-wide"
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            <div className="flex items-center space-x-4">
              <button className="p-2 text-gray-600 hover:opacity-75 transition">
                <Search size={20} />
              </button>
              <Link href="/login" className="p-2 text-gray-600 hover:opacity-75 transition">
                <User size={20} />
              </Link>
              <button
                onClick={openCart}
                className="relative p-2 text-gray-600 hover:opacity-75 transition"
              >
                <ShoppingBag size={20} />
                {itemCount > 0 && (
                  <span
                    className="absolute -top-1 -right-1 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center"
                    style={{ background: 'var(--brand-blue)' }}
                  >
                    {itemCount}
                  </span>
                )}
              </button>
            </div>
          </div>

          {isMenuOpen && (
            <div className="sm:hidden pb-4 border-t border-gray-100">
              <nav
                className="flex flex-col space-y-3 pt-4"
                style={{ fontFamily: 'var(--font-nav)' }}
              >
                {settings.nav.links.filter((l) => l.visible !== false).map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="text-gray-700 font-medium text-lg"
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
