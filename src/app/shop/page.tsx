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

  // Fetch categories from DB (dynamic, plus de hardcode)
  const { data: categories } = await supabase
    .from('categories')
    .select('id, slug, name')
    .order('name');

  let query = supabase
    .from('products')
    .select('*, category:categories(*)')
    .eq('is_active', true)
    .order('created_at', { ascending: false });

  if (params.category) {
    const matchedCategory = (categories || []).find((c) => c.slug === params.category);
    if (matchedCategory) {
      query = query.eq('category_id', matchedCategory.id);
    } else {
      // Slug inconnu → aucun résultat plutôt que de tout afficher
      query = query.eq('category_id', '00000000-0000-0000-0000-000000000000');
    }
  }

  if (params.search) {
    query = query.ilike('name', `%${params.search}%`);
  }

  const { data: products } = await query;

  // Ordre d'affichage manuel défini dans l'admin (glisser-déposer).
  // Robuste : si la colonne display_order n'existe pas encore, tout vaut 0 → ordre inchangé.
  (products || []).sort((a, b) => (a.display_order ?? 0) - (b.display_order ?? 0));

  // Fetch ratings for displayed products
  const productIds = (products || []).map((p) => p.id);
  const { data: ratings } = productIds.length > 0
    ? await supabase
        .from('product_reviews')
        .select('product_id, rating')
        .in('product_id', productIds)
        .eq('status', 'approved')
    : { data: [] };

  const ratingsByProduct = (ratings || []).reduce<Record<string, { sum: number; count: number }>>(
    (acc, r) => {
      if (!acc[r.product_id]) acc[r.product_id] = { sum: 0, count: 0 };
      acc[r.product_id].sum += Number(r.rating);
      acc[r.product_id].count += 1;
      return acc;
    },
    {}
  );

  const currentCategoryName = params.category
    ? categories?.find((c) => c.slug === params.category)?.name || 'Catégorie'
    : 'Toutes nos créations';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20">
      {/* Editorial header */}
      <div className="text-center mb-14 md:mb-20">
        <p className="text-[11px] uppercase tracking-[0.32em] mb-5 opacity-60">Boutique</p>
        <h1
          className="text-4xl md:text-6xl mb-5 leading-tight"
          style={{ fontFamily: 'var(--font-heading)', color: 'var(--brand-blue)' }}
        >
          {currentCategoryName}
        </h1>
        <div className="w-12 h-px mx-auto mb-6 opacity-30" style={{ background: 'currentColor' }} />
        <p className="text-base opacity-70 max-w-md mx-auto leading-relaxed">
          Bijoux faits main, pensés pour sublimer chaque instant.
        </p>
      </div>

      {/* Filter — pastilles claires (navigation intuitive) */}
      <div className="flex flex-wrap justify-center gap-2.5 mb-16">
        <FilterLink href="/shop" label="Tous" active={!params.category} />
        {(categories || []).map((cat) => (
          <FilterLink
            key={cat.slug}
            href={`/shop?category=${cat.slug}`}
            label={cat.name}
            active={params.category === cat.slug}
          />
        ))}
      </div>

      {/* Products Grid */}
      {products && products.length > 0 ? (
        <>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-x-8 gap-y-14 md:gap-x-12 md:gap-y-16" data-reveal-stagger>
            {products.map((product: Product) => {
              const r = ratingsByProduct[product.id];
              return (
                <ProductCard
                  key={product.id}
                  product={product}
                  rating={r ? r.sum / r.count : null}
                  reviewCount={r?.count || 0}
                />
              );
            })}
          </div>
          <p className="text-center text-[11px] uppercase tracking-[0.32em] opacity-50 mt-20">
            {products.length} {products.length > 1 ? 'créations' : 'création'}
          </p>
        </>
      ) : (
        <div className="text-center py-32">
          <p className="text-[11px] uppercase tracking-[0.32em] mb-3 opacity-50">Aucune création</p>
          <p className="text-lg opacity-70" style={{ fontFamily: 'var(--font-heading)' }}>
            Cette collection sera bientôt disponible
          </p>
        </div>
      )}
    </div>
  );
}

function FilterLink({ href, label, active }: { href: string; label: string; active: boolean }) {
  return (
    <a
      href={href}
      className="text-[11px] uppercase tracking-[0.16em] px-4 py-2 rounded-full transition-all duration-300 whitespace-nowrap"
      style={
        active
          ? { background: 'var(--brand-blue)', color: '#fff' }
          : { background: 'rgba(0,0,0,0.045)', color: 'inherit' }
      }
    >
      {label}
    </a>
  );
}
