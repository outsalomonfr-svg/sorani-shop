import 'server-only';
import { createClient } from '@/lib/supabase/server';

export type HomeProduct = {
  id: string;
  slug: string;
  name: string;
  price: number;
  compare_at_price: number | null;
  image: string | null;
  category: string | null;
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
    const supabase = await createClient();

    const [featuredRes, recentRes, catsRes] = await Promise.all([
      supabase
        .from('products')
        .select('id, slug, name, price, compare_at_price, images, category:categories(name)')
        .eq('is_active', true)
        .eq('is_featured', true)
        .order('created_at', { ascending: false })
        .limit(4),
      supabase
        .from('products')
        .select('id, slug, name, price, compare_at_price, images, category:categories(name)')
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(4),
      supabase.from('categories').select('id, slug, name, description').order('name'),
    ]);

    const featured = featuredRes.data?.length ? featuredRes.data : recentRes.data || [];

    const featuredProducts: HomeProduct[] = featured.map((p) => ({
      id: p.id,
      slug: p.slug,
      name: p.name,
      price: Number(p.price),
      compare_at_price: p.compare_at_price ? Number(p.compare_at_price) : null,
      image: p.images?.[0] || null,
      category: (p.category as { name?: string } | null)?.name || null,
    }));

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
