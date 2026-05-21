import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, Sparkles, Truck, Shield, Droplets } from 'lucide-react';

const exampleProducts = [
  {
    id: '1',
    name: 'Collier Perles Soleil',
    price: 34.90,
    compare_at_price: 44.90,
    image: '/images/hero-2.png',
    category: 'Colliers',
  },
  {
    id: '2',
    name: 'Boucles Luna Perles',
    price: 28.90,
    image: '/images/hero-4.png',
    category: 'Boucles d\'oreilles',
  },
  {
    id: '3',
    name: 'Bracelet Dore Chaine',
    price: 24.90,
    image: '/images/hero-5.png',
    category: 'Bracelets',
  },
  {
    id: '4',
    name: 'Collier Celestia Lune',
    price: 32.90,
    compare_at_price: 39.90,
    image: '/images/hero-1.png',
    category: 'Colliers',
  },
];

export default function HomePage() {
  return (
    <div>
      {/* Hero Section - Full width image */}
      <section className="relative h-[90vh] min-h-[600px] overflow-hidden">
        <Image
          src="/images/hero-1.png"
          alt="Bijoux Sorani"
          fill
          className="object-cover animate-scale-in"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#1B4965]/80 via-[#1B4965]/50 to-transparent" />
        <div className="absolute inset-0 flex items-center">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
            <div className="max-w-xl">
              <h1 className="text-5xl md:text-7xl font-bold leading-tight text-white animate-fade-in-up">
                Bijoux faits
                <br />
                <span className="text-[#BEE9E8]">avec amour</span>
              </h1>
              <p className="mt-6 text-lg text-white/80 max-w-lg animate-fade-in-up-delay">
                Chaque bijou SORANI est une piece unique, creee avec passion pour sublimer
                votre beaute naturelle au quotidien.
              </p>
              <div className="mt-8 animate-fade-in-up-delay-2">
                <Link
                  href="/shop"
                  className="inline-flex items-center gap-2 bg-white text-[#1B4965] px-8 py-4 rounded-full font-semibold hover:bg-[#BEE9E8] transition-all hover:scale-105"
                >
                  Decouvrir la collection
                  <ArrowRight size={18} />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Nos coups de coeur - Product cards */}
      <section className="bg-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-12">
            <h2 className="text-2xl md:text-3xl font-bold text-[#1B4965]">
              Nos coups de coeur
            </h2>
            <Link href="/shop" className="text-[#1B4965] hover:underline font-medium flex items-center gap-1">
              Voir tout <ArrowRight size={16} />
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {exampleProducts.map((product) => (
              <Link key={product.id} href="/shop" className="group">
                <div className="bg-white rounded-2xl overflow-hidden border border-gray-100 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                  <div className="relative aspect-square bg-gray-50 overflow-hidden">
                    <Image
                      src={product.image}
                      alt={product.name}
                      fill
                      className="object-cover group-hover:scale-110 transition-transform duration-700"
                    />
                    {product.compare_at_price && (
                      <span className="absolute top-3 left-3 bg-[#1B4965] text-white text-xs font-bold px-3 py-1 rounded-full">
                        -{Math.round((1 - product.price / product.compare_at_price) * 100)}%
                      </span>
                    )}
                  </div>
                  <div className="p-4">
                    <p className="text-xs text-[#1B4965] font-medium mb-1">{product.category}</p>
                    <h3 className="font-semibold text-gray-800 group-hover:text-[#1B4965] transition">
                      {product.name}
                    </h3>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-[#1B4965] font-bold">{product.price.toFixed(2)} EUR</span>
                      {product.compare_at_price && (
                        <span className="text-gray-400 line-through text-sm">
                          {product.compare_at_price.toFixed(2)} EUR
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Brand Story */}
      <section className="bg-[#1B4965] py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div className="relative h-[500px] rounded-2xl overflow-hidden">
              <Image
                src="/images/sorani-card.jpg"
                alt="Sorani - Bijoux artisanaux"
                fill
                className="object-cover"
              />
            </div>
            <div className="text-white">
              <h2 className="text-3xl md:text-4xl font-bold mb-6">L&apos;histoire Sorani</h2>
              <p className="text-white/80 leading-relaxed mb-4 text-lg">
                SORANI, c&apos;est l&apos;histoire de bijoux fabriques avec amour, a la commande,
                specialement pour vous.
              </p>
              <p className="text-white/80 leading-relaxed mb-8 text-lg">
                Chaque piece est unique et reflete notre passion pour l&apos;artisanat.
                Des modeles tendances et elegants, resistants a l&apos;eau,
                concus pour durer et garder leur eclat.
              </p>
              <Link
                href="/shop"
                className="inline-flex items-center gap-2 bg-white text-[#1B4965] px-8 py-3 rounded-full font-semibold hover:bg-[#BEE9E8] transition-all hover:scale-105"
              >
                Decouvrir nos creations
                <ArrowRight size={18} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 4 Bonnes raisons */}
      <section className="bg-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-4 text-[#1B4965]">
            4 bonnes raisons d&apos;acheter un bijou Sorani
          </h2>
          <p className="text-center text-gray-500 mb-12 max-w-md mx-auto">
            Des bijoux de qualite, faits pour vous accompagner au quotidien
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { src: '/images/hero-2.png', title: 'Unique', desc: 'Fabrique a la commande specialement pour vous' },
              { src: '/images/hero-3.png', title: 'Intemporel', desc: 'Des modeles tendances a porter toute l\'annee' },
              { src: '/images/hero-4.png', title: 'Resistant', desc: 'Resiste a l\'eau et ne ternit pas' },
              { src: '/images/hero-5.png', title: 'Durable', desc: 'Concu pour durer et garder son eclat' },
            ].map((item) => (
              <div key={item.title} className="group">
                <div className="relative aspect-[3/4] rounded-2xl overflow-hidden mb-4">
                  <Image
                    src={item.src}
                    alt={item.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                  <div className="absolute bottom-4 left-4 right-4 text-white">
                    <h3 className="font-bold text-lg">{item.title}</h3>
                    <p className="text-sm text-white/80">{item.desc}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="bg-gray-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-12 text-[#1B4965]">
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
                className="group bg-white rounded-2xl p-8 text-center shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-2 border border-gray-100"
              >
                <h3 className="font-semibold text-[#1B4965] text-lg">
                  {cat.name}
                </h3>
                <span className="text-sm text-gray-400 mt-2 block group-hover:text-[#1B4965] transition">
                  Decouvrir →
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Trust badges */}
      <section className="bg-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { icon: Sparkles, title: 'Fait main', desc: 'Chaque piece est unique et artisanale' },
              { icon: Droplets, title: 'Waterproof', desc: 'Resiste a l\'eau et ne ternit pas' },
              { icon: Truck, title: 'Livraison soignee', desc: 'Expedition rapide en ecrin elegant' },
              { icon: Shield, title: 'Paiement securise', desc: 'Transactions 100% securisees' },
            ].map((item) => (
              <div key={item.title} className="text-center group">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-[#1B4965] rounded-full mb-4 group-hover:scale-110 transition-transform">
                  <item.icon className="text-white" size={28} />
                </div>
                <h3 className="font-semibold text-gray-800 mb-1">{item.title}</h3>
                <p className="text-gray-500 text-sm">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter */}
      <section className="bg-[#1B4965] py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
            Restez informee
          </h2>
          <p className="text-white/70 mb-8 max-w-md mx-auto">
            Inscrivez-vous pour recevoir nos nouveautes et offres exclusives
          </p>
          <form className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
            <input
              type="email"
              placeholder="Votre adresse email"
              className="flex-1 px-6 py-4 rounded-full text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#BEE9E8]"
            />
            <button
              type="submit"
              className="bg-[#BEE9E8] text-[#1B4965] px-8 py-4 rounded-full font-semibold hover:bg-white transition-all hover:scale-105"
            >
              S&apos;inscrire
            </button>
          </form>
        </div>
      </section>
    </div>
  );
}
