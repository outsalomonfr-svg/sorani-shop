import HomePageClient from '@/components/home/HomePageClient';
import { getHomeData } from '@/lib/home-data';

// Mise en cache (ISR) : régénéré au plus toutes les 5 min → accueil rapide
export const revalidate = 300;

export default async function HomePage() {
  const { featuredProducts, categories } = await getHomeData();
  return <HomePageClient featuredProducts={featuredProducts} categories={categories} />;
}
