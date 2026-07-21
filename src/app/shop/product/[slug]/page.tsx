import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { createPublicClient } from '@/lib/supabase/admin';
import type { Product, ProductVariant } from '@/types';
import ProductDetail from './ProductDetail';

export const revalidate = 300;

async function fetchProduct(slug: string): Promise<Product | null> {
  const supabase = createPublicClient();
  const { data } = await supabase
    .from('products')
    .select('*, category:categories(*)')
    .eq('slug', slug)
    .single();
  return (data as Product) || null;
}

async function fetchVariants(productId: string): Promise<ProductVariant[]> {
  const supabase = createPublicClient();
  const { data } = await supabase
    .from('product_variants')
    .select('*')
    .eq('product_id', productId)
    .eq('is_active', true)
    .order('position', { ascending: true });
  return (data as ProductVariant[]) || [];
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = await fetchProduct(slug);
  if (!product) return { title: 'Bijou introuvable | SORANI' };

  const name = product.name.trim();
  const description =
    (product.description || '').trim().slice(0, 160) ||
    `${name} — bijou artisanal SORANI, fait avec amour.`;
  const image = product.images?.[0];

  return {
    title: `${name} | SORANI`,
    description,
    openGraph: {
      title: `${name} — SORANI Bijoux`,
      description,
      type: 'website',
      images: image ? [{ url: image, width: 1200, height: 1200, alt: name }] : undefined,
    },
    alternates: { canonical: `/shop/product/${slug}` },
  };
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = await fetchProduct(slug);

  if (!product || product.is_active === false) notFound();

  const variants = await fetchVariants(product.id);

  // Donnees structurees : permet a Google d'afficher le prix et la disponibilite
  // directement dans les resultats de recherche.
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name.trim(),
    description: (product.description || '').trim(),
    image: product.images || [],
    ...(product.materials ? { material: product.materials } : {}),
    brand: { '@type': 'Brand', name: 'SORANI' },
    offers: {
      '@type': 'Offer',
      price: product.price,
      priceCurrency: 'EUR',
      availability:
        (product.stock ?? 0) > 0
          ? 'https://schema.org/InStock'
          : 'https://schema.org/OutOfStock',
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <ProductDetail product={product} variants={variants} />
    </>
  );
}
