import { getSiteSettings } from '@/lib/site-settings';
import CustomizerClient from './CustomizerClient';

export default async function CustomizePage() {
  const settings = await getSiteSettings();
  return <CustomizerClient initialSettings={settings} />;
}
