import 'server-only';
import { createPublicClient } from '@/lib/supabase/admin';

export type HomeProduct = {
  id: string;
  slug: string;
  name: string;
  price: number;
  compare_at_price: number | null;
  image: string | null;
  category: string | null;
  rating: number | null;       // moyenne 1-5 (null si aucun avis)
  reviewCount: number;          // nb d'avis approuves
  // Champs nécessaires à l'ajout rapide au panier
  images: string[];
  description: string;
  stock: number;
  variant_type: string | null;
  show_add_to_cart: boolean;
};

export type HomeCategory = {
  id: string;
  slug: string;
  name: string;
  description: string | null;
};

export type HomeData = {
  featuredProducts: HomeProduct[];
  categories: HomeCategory[];
};

export async function getHomeData(): Promise<HomeData> {
  try {
    const supabase = createPublicClient();

    const [featuredRes, recentRes, catsRes] = await Promise.all([
      supabase
        .from('products')
        .select('id, slug, name, price, compare_at_price, images, description, stock, variant_type, show_add_to_cart, category:categories(name)')
        .eq('is_active', true)
        .eq('is_featured', true)
        .order('created_at', { ascending: false })
        .limit(6),
      supabase
        .from('products')
        .select('id, slug, name, price, compare_at_price, images, description, stock, variant_type, show_add_to_cart, category:categories(name)')
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(6),
      supabase.from('categories').select('id, slug, name, description').order('name'),
    ]);

    const featured = featuredRes.data?.length ? featuredRes.data : recentRes.data || [];

    // Charge les notes moyennes pour les produits affichés
    const productIds = featured.map((p) => p.id);
    const { data: ratings } = productIds.length > 0
      ? await supabase
          .from('product_reviews')
          .select('product_id, rating')
          .in('product_id', productIds)
          .eq('status', 'approved')
      : { data: [] };

    const ratingsByProduct = (ratings || []).reduce<Record<string, number[]>>((acc, r) => {
      if (!acc[r.product_id]) acc[r.product_id] = [];
      acc[r.product_id].push(Number(r.rating));
      return acc;
    }, {});

    const featuredProducts: HomeProduct[] = featured.map((p) => {
      const list = ratingsByProduct[p.id] || [];
      return {
        id: p.id,
        slug: p.slug,
        name: p.name,
        price: Number(p.price),
        compare_at_price: p.compare_at_price ? Number(p.compare_at_price) : null,
        image: p.images?.[0] || null,
        category: (p.category as { name?: string } | null)?.name || null,
        rating: list.length > 0 ? list.reduce((s, r) => s + r, 0) / list.length : null,
        reviewCount: list.length,
        images: p.images || [],
        description: p.description || '',
        stock: p.stock ?? 0,
        variant_type: p.variant_type ?? null,
        show_add_to_cart: p.show_add_to_cart ?? true,
      };
    });

    const categories: HomeCategory[] = (catsRes.data || []).map((c) => ({
      id: c.id,
      slug: c.slug,
      name: c.name,
      description: c.description,
    }));

    return { featuredProducts, categories };
  } catch {
    return { featuredProducts: [], categories: [] };
  }
}
