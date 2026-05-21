import { createClient } from '@/lib/supabase/server';
import ProductCard from '@/components/product/ProductCard';
import type { Product } from '@/types';

export default async function ShopPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; search?: string }>;
}) {
  const params = await searchParams;
  const supabase = await createClient();

  let query = supabase
    .from('products')
    .select('*, category:categories(*)')
    .eq('is_active', true)
    .order('created_at', { ascending: false });

  if (params.category) {
    query = query.eq('categories.slug', params.category);
  }

  if (params.search) {
    query = query.ilike('name', `%${params.search}%`);
  }

  const { data: products } = await query;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Boutique</h1>
        <p className="text-gray-600 mt-2">Decouvrez toutes nos creations</p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-8">
        {['Tous', 'Colliers', 'Bracelets', "Boucles d'oreilles", 'Bagues'].map((cat) => {
          const slug = cat === 'Tous' ? '' : cat.toLowerCase().replace(/[' ]/g, '-');
          const isActive = (params.category || '') === slug;
          return (
            <a
              key={cat}
              href={slug ? `/shop?category=${slug}` : '/shop'}
              className={`px-4 py-2 rounded-full text-sm font-medium transition ${
                isActive
                  ? 'bg-[#1B4965] text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100 border'
              }`}
            >
              {cat}
            </a>
          );
        })}
      </div>

      {/* Products Grid */}
      {products && products.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {products.map((product: Product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <p className="text-gray-500 text-lg">Aucun produit pour le moment</p>
          <p className="text-gray-400 mt-2">Ajoutez vos produits depuis le dashboard admin</p>
        </div>
      )}
    </div>
  );
}
