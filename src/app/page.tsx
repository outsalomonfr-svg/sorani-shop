import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, Sparkles, Truck, Shield, Droplets } from 'lucide-react';

export default function HomePage() {
  return (
    <div>
      {/* Hero Section */}
      <section className="relative bg-[#1B4965] text-white overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
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
            <div className="relative h-[400px] md:h-[500px] rounded-2xl overflow-hidden">
              <Image
                src="/images/hero-1.png"
                alt="Bijoux Sorani - Colliers et boucles d'oreilles"
                fill
                className="object-cover"
                priority
              />
            </div>
          </div>
        </div>
      </section>

      {/* Brand Story with photo */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div className="relative h-[400px] rounded-2xl overflow-hidden">
            <Image
              src="/images/sorani-card.jpg"
              alt="Sorani - Bijoux artisanaux"
              fill
              className="object-cover"
            />
          </div>
          <div>
            <h2 className="text-3xl font-bold text-gray-800 mb-6">L&apos;histoire Sorani</h2>
            <p className="text-gray-600 leading-relaxed mb-4">
              SORANI, c&apos;est l&apos;histoire de bijoux fabriques avec amour, a la commande,
              specialement pour vous. Chaque piece est unique et reflete notre passion
              pour l&apos;artisanat et la beaute.
            </p>
            <p className="text-gray-600 leading-relaxed">
              Des modeles tendances et elegants, que vous pouvez porter toute l&apos;annee.
              Resistants a l&apos;eau, ils ne ternissent pas et sont concus pour durer.
            </p>
          </div>
        </div>
      </section>

      {/* 4 Bonnes raisons - avec les vraies photos */}
      <section className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-12 text-gray-800">
            4 bonnes raisons d&apos;acheter un bijou Sorani
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { src: '/images/hero-2.png', title: 'Unique', desc: 'Fabrique a la commande specialement pour vous' },
              { src: '/images/hero-3.png', title: 'Intemporel', desc: 'Des modeles tendances a porter toute l\'annee' },
              { src: '/images/hero-4.png', title: 'Resistant', desc: 'Resiste a l\'eau et ne ternit pas' },
              { src: '/images/hero-5.png', title: 'Durable', desc: 'Concu pour durer et garder son eclat' },
            ].map((item) => (
              <div key={item.title} className="group">
                <div className="relative aspect-[3/4] rounded-xl overflow-hidden mb-3">
                  <Image
                    src={item.src}
                    alt={item.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <h3 className="font-semibold text-gray-800">{item.title}</h3>
                <p className="text-sm text-gray-600">{item.desc}</p>
              </div>
            ))}
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

      {/* Trust badges */}
      <section className="bg-gray-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-[#BEE9E8] rounded-full mb-4">
                <Sparkles className="text-[#1B4965]" size={28} />
              </div>
              <h3 className="font-semibold text-gray-800 mb-2">Fait main</h3>
              <p className="text-gray-600 text-sm">Chaque piece est unique et fabriquee artisanalement</p>
            </div>
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-[#BEE9E8] rounded-full mb-4">
                <Droplets className="text-[#1B4965]" size={28} />
              </div>
              <h3 className="font-semibold text-gray-800 mb-2">Waterproof</h3>
              <p className="text-gray-600 text-sm">Resiste a l&apos;eau et ne ternit pas</p>
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
              <p className="text-gray-600 text-sm">Transactions 100% securisees via Stripe</p>
            </div>
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
