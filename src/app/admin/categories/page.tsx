import { getSiteSettings } from '@/lib/site-settings';
import CategoriesClient from './CategoriesClient';

export default async function AdminCategoriesPage() {
  const settings = await getSiteSettings();
  return <CategoriesClient initialHidden={settings.hiddenCategorySlugs ?? []} />;
}
