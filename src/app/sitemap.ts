import type { MetadataRoute } from 'next';
import { siteUrl } from '@/lib/supabase/public-config';
import { createPublicClient } from '@/lib/supabase/admin';


export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const SITE = siteUrl();
  const supabase = createPublicClient();

  const [{ data: products }, { data: pages }, { data: categories }] = await Promise.all([
    supabase.from('products').select('slug, updated_at').eq('is_active', true),
    supabase.from('pages').select('slug, updated_at').eq('status', 'published'),
    supabase.from('categories').select('slug'),
  ]);

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: SITE, changeFrequency: 'weekly', priority: 1 },
    { url: `${SITE}/shop`, changeFrequency: 'daily', priority: 0.9 },
    { url: `${SITE}/about`, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${SITE}/contact`, changeFrequency: 'yearly', priority: 0.5 },
    { url: `${SITE}/faq`, changeFrequency: 'monthly', priority: 0.5 },
  ];

  const productRoutes: MetadataRoute.Sitemap = (products || []).map((p) => ({
    url: `${SITE}/shop/product/${p.slug}`,
    lastModified: p.updated_at ? new Date(p.updated_at) : undefined,
    changeFrequency: 'weekly',
    priority: 0.8,
  }));

  const categoryRoutes: MetadataRoute.Sitemap = (categories || []).map((c) => ({
    url: `${SITE}/shop?categorie=${c.slug}`,
    changeFrequency: 'weekly',
    priority: 0.6,
  }));

  const pageRoutes: MetadataRoute.Sitemap = (pages || []).map((p) => ({
    url: `${SITE}/${p.slug}`,
    lastModified: p.updated_at ? new Date(p.updated_at) : undefined,
    changeFrequency: 'yearly',
    priority: 0.3,
  }));

  return [...staticRoutes, ...productRoutes, ...categoryRoutes, ...pageRoutes];
}
