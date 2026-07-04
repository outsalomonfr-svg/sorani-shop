import { getSiteSettings } from '@/lib/site-settings';
import SettingsClient from './SettingsClient';

export default async function AdminSettingsPage() {
  const settings = await getSiteSettings();
  return <SettingsClient initialSettings={settings} />;
}
