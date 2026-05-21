import Link from 'next/link';
import { ArrowRight, Sparkles, Truck, Shield } from 'lucide-react';

export default function HomePage() {
  return (
    <div>
      {/* Hero Section */}
      <section className="relative bg-[#1B4965] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32">
          <div className="max-w-2xl">
            <h1 className="text-4xl md:text-6xl font-bold leading-tight">
              Bijoux faits
              <br />
              <span className="text-[#BEE9E8]">avec amour</span>
            </h1>
            <p className="mt-6 text-lg text-gray-300 max-w-lg">
              Chaque bijou SORANI est une piece unique, creee avec passion pour sublimer
              votre beaute naturelle au quotidien.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link
                href="/shop"
                className="inline-flex items-center gap-2 bg-white text-[#1B4965] px-8 py-3 rounded-lg font-semibold hover:bg-[#BEE9E8] transition"
              >
                Decouvrir la collection
                <ArrowRight size={18} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h2 className="text-2xl md:text-3xl font-bold text-center mb-12 text-gray-800">
          Nos categories
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {[
            { name: 'Colliers', slug: 'colliers' },
            { name: 'Bracelets', slug: 'bracelets' },
            { name: "Boucles d'oreilles", slug: 'boucles-oreilles' },
            { name: 'Bagues', slug: 'bagues' },
          ].map((cat) => (
            <Link
              key={cat.slug}
              href={`/shop?category=${cat.slug}`}
              className="group bg-white rounded-xl p-8 text-center shadow-sm hover:shadow-md transition-all hover:-translate-y-1"
            >
              <h3 className="font-semibold text-gray-800 group-hover:text-[#1B4965] transition">
                {cat.name}
              </h3>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured Products placeholder */}
      <section className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-12">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-800">
              Nos coups de coeur
            </h2>
            <Link href="/shop" className="text-[#1B4965] hover:underline font-medium flex items-center gap-1">
              Voir tout <ArrowRight size={16} />
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="bg-gray-50 rounded-xl aspect-square flex items-center justify-center text-gray-400">
              <p className="text-sm text-center px-4">Ajoutez vos produits depuis le dashboard admin</p>
            </div>
          </div>
        </div>
      </section>

      {/* Trust badges */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-[#BEE9E8] rounded-full mb-4">
              <Sparkles className="text-[#1B4965]" size={28} />
            </div>
            <h3 className="font-semibold text-gray-800 mb-2">Fait main avec amour</h3>
            <p className="text-gray-600 text-sm">Chaque piece est unique et fabriquee artisanalement</p>
          </div>
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-[#BEE9E8] rounded-full mb-4">
              <Truck className="text-[#1B4965]" size={28} />
            </div>
            <h3 className="font-semibold text-gray-800 mb-2">Livraison soignee</h3>
            <p className="text-gray-600 text-sm">Expedition rapide dans un ecrin elegant</p>
          </div>
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-[#BEE9E8] rounded-full mb-4">
              <Shield className="text-[#1B4965]" size={28} />
            </div>
            <h3 className="font-semibold text-gray-800 mb-2">Paiement securise</h3>
            <p className="text-gray-600 text-sm">Vos transactions sont 100% securisees via Stripe</p>
          </div>
        </div>
      </section>

      {/* Newsletter */}
      <section className="bg-[#1B4965] py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
            Restez informee
          </h2>
          <p className="text-gray-300 mb-8 max-w-md mx-auto">
            Inscrivez-vous pour recevoir nos nouveautes et offres exclusives
          </p>
          <form className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
            <input
              type="email"
              placeholder="Votre adresse email"
              className="flex-1 px-4 py-3 rounded-lg text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#BEE9E8]"
            />
            <button
              type="submit"
              className="bg-[#BEE9E8] text-[#1B4965] px-6 py-3 rounded-lg font-semibold hover:bg-white transition"
            >
              S&apos;inscrire
            </button>
          </form>
        </div>
      </section>
    </div>
  );
}
