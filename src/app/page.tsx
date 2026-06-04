import HomePageClient from '@/components/home/HomePageClient';
import { getHomeData } from '@/lib/home-data';

export default async function HomePage() {
  const { featuredProducts, categories } = await getHomeData();
  return <HomePageClient featuredProducts={featuredProducts} categories={categories} />;
}
