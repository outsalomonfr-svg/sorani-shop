'use client';

import Link from 'next/link';
import Image from 'next/image';
import { ShoppingBag, Menu, X, Search, User } from 'lucide-react';
import { useState } from 'react';
import { useCart } from '@/hooks/useCart';

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { openCart, totalItems } = useCart();
  const itemCount = totalItems();

  return (
    <header className="bg-white border-b border-gray-100 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Mobile menu button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="sm:hidden p-2 text-gray-600 hover:text-[#1B4965]"
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>

          {/* Logo */}
          <Link href="/" className="flex items-center">
            <Image
              src="/images/logo.png"
              alt="SORANI"
              width={120}
              height={40}
              className="h-10 w-auto"
            />
          </Link>

          {/* Navigation desktop */}
          <nav className="hidden sm:flex items-center space-x-8">
            <Link href="/shop" className="text-gray-700 hover:text-[#1B4965] transition font-medium">
              Boutique
            </Link>
            <Link href="/shop?category=colliers" className="text-gray-700 hover:text-[#1B4965] transition font-medium">
              Colliers
            </Link>
            <Link href="/shop?category=bracelets" className="text-gray-700 hover:text-[#1B4965] transition font-medium">
              Bracelets
            </Link>
            <Link href="/shop?category=boucles-oreilles" className="text-gray-700 hover:text-[#1B4965] transition font-medium">
              Boucles d&apos;oreilles
            </Link>
            <Link href="/shop?category=bagues" className="text-gray-700 hover:text-[#1B4965] transition font-medium">
              Bagues
            </Link>
          </nav>

          {/* Actions */}
          <div className="flex items-center space-x-4">
            <button className="p-2 text-gray-600 hover:text-[#1B4965] transition">
              <Search size={20} />
            </button>
            <Link href="/login" className="p-2 text-gray-600 hover:text-[#1B4965] transition">
              <User size={20} />
            </Link>
            <button
              onClick={openCart}
              className="relative p-2 text-gray-600 hover:text-[#1B4965] transition"
            >
              <ShoppingBag size={20} />
              {itemCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-[#1B4965] text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {itemCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {isMenuOpen && (
          <div className="sm:hidden pb-4 border-t border-gray-100">
            <nav className="flex flex-col space-y-3 pt-4">
              <Link href="/shop" className="text-gray-700 hover:text-[#1B4965] font-medium" onClick={() => setIsMenuOpen(false)}>
                Boutique
              </Link>
              <Link href="/shop?category=colliers" className="text-gray-700 hover:text-[#1B4965] font-medium" onClick={() => setIsMenuOpen(false)}>
                Colliers
              </Link>
              <Link href="/shop?category=bracelets" className="text-gray-700 hover:text-[#1B4965] font-medium" onClick={() => setIsMenuOpen(false)}>
                Bracelets
              </Link>
              <Link href="/shop?category=boucles-oreilles" className="text-gray-700 hover:text-[#1B4965] font-medium" onClick={() => setIsMenuOpen(false)}>
                Boucles d&apos;oreilles
              </Link>
              <Link href="/shop?category=bagues" className="text-gray-700 hover:text-[#1B4965] font-medium" onClick={() => setIsMenuOpen(false)}>
                Bagues
              </Link>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
