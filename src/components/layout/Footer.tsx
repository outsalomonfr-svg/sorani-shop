import Link from 'next/link';
import { Instagram, Mail } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-[#1B4965] text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-1 md:col-span-2">
            <h3 className="text-2xl font-bold mb-4">SORANI</h3>
            <p className="text-gray-300 mb-4 max-w-md">
              Bijoux faits avec amour. Chaque piece est unique et creee avec passion
              pour sublimer votre beaute naturelle.
            </p>
            <div className="flex space-x-4">
              <a href="https://instagram.com/sorani" target="_blank" rel="noopener noreferrer" className="text-gray-300 hover:text-white transition">
                <Instagram size={24} />
              </a>
              <a href="mailto:contact@sorani.fr" className="text-gray-300 hover:text-white transition">
                <Mail size={24} />
              </a>
            </div>
          </div>

          {/* Links */}
          <div>
            <h4 className="font-semibold mb-4">Boutique</h4>
            <ul className="space-y-2 text-gray-300">
              <li><Link href="/shop?category=colliers" className="hover:text-white transition">Colliers</Link></li>
              <li><Link href="/shop?category=bracelets" className="hover:text-white transition">Bracelets</Link></li>
              <li><Link href="/shop?category=boucles-oreilles" className="hover:text-white transition">Boucles d&apos;oreilles</Link></li>
              <li><Link href="/shop?category=bagues" className="hover:text-white transition">Bagues</Link></li>
            </ul>
          </div>

          {/* Info */}
          <div>
            <h4 className="font-semibold mb-4">Informations</h4>
            <ul className="space-y-2 text-gray-300">
              <li><Link href="/about" className="hover:text-white transition">A propos</Link></li>
              <li><Link href="/contact" className="hover:text-white transition">Contact</Link></li>
              <li><Link href="/livraison" className="hover:text-white transition">Livraison</Link></li>
              <li><Link href="/cgv" className="hover:text-white transition">CGV</Link></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-600 mt-8 pt-8 text-center text-gray-400 text-sm">
          <p>&copy; {new Date().getFullYear()} SORANI. Tous droits reserves.</p>
        </div>
      </div>
    </footer>
  );
}
