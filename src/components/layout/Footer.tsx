'use client';

import Link from 'next/link';
import { Mail } from 'lucide-react';
import { useSiteSettings } from '@/components/settings/SettingsProvider';

export default function Footer() {
  const settings = useSiteSettings();

  return (
    <footer className="text-white" style={{ background: 'var(--brand-blue)' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-2">
            <h3 className="text-2xl font-bold mb-4">{settings.brand.name}</h3>
            <p className="text-gray-300 mb-4 max-w-md">{settings.footer.about}</p>
            <div className="flex space-x-4">
              {settings.footer.social.instagram && (
                <a
                  href={settings.footer.social.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-300 hover:text-white transition"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/></svg>
                </a>
              )}
              {settings.footer.social.facebook && (
                <a
                  href={settings.footer.social.facebook}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-300 hover:text-white transition"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
                </a>
              )}
              {settings.footer.social.tiktok && (
                <a
                  href={settings.footer.social.tiktok}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-300 hover:text-white transition"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M16.6 5.82s.51.5 0 0A4.28 4.28 0 0 1 15.54 3h-3.09v12.4a2.6 2.6 0 0 1-2.6 2.5c-1.43 0-2.6-1.17-2.6-2.6 0-1.72 1.66-3.01 3.37-2.48V9.66c-3.45-.46-6.47 2.22-6.47 5.64 0 3.33 2.76 5.7 5.69 5.7 3.14 0 5.69-2.55 5.69-5.7V9.01a7.35 7.35 0 0 0 4.3 1.38V7.3s-1.88.09-3.23-1.48z"/></svg>
                </a>
              )}
              {settings.footer.contactEmail && (
                <a
                  href={`mailto:${settings.footer.contactEmail}`}
                  className="text-gray-300 hover:text-white transition"
                >
                  <Mail size={22} />
                </a>
              )}
            </div>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Boutique</h4>
            <ul className="space-y-2 text-gray-300">
              <li><Link href="/shop?category=colliers" className="hover:text-white transition">Colliers</Link></li>
              <li><Link href="/shop?category=bracelets" className="hover:text-white transition">Bracelets</Link></li>
              <li><Link href="/shop?category=boucles-oreilles" className="hover:text-white transition">Boucles d&apos;oreilles</Link></li>
              <li><Link href="/shop?category=bagues" className="hover:text-white transition">Bagues</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Informations</h4>
            <ul className="space-y-2 text-gray-300">
              <li><Link href="/about" className="hover:text-white transition">À propos</Link></li>
              <li><Link href="/contact" className="hover:text-white transition">Contact</Link></li>
              <li><Link href="/livraison" className="hover:text-white transition">Livraison</Link></li>
              <li><Link href="/cgv" className="hover:text-white transition">CGV</Link></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/15 mt-8 pt-8 text-center text-gray-400 text-sm">
          <p>&copy; {new Date().getFullYear()} {settings.brand.name}. Tous droits réservés.</p>
        </div>
      </div>
    </footer>
  );
}
