import { getSiteSettings } from '@/lib/site-settings';
import { DEFAULT_SETTINGS } from '@/types/site-settings';
import FaqEditorClient from './FaqEditorClient';

export default async function AdminFaqPage() {
  const settings = await getSiteSettings();
  const faq = settings.faq ?? DEFAULT_SETTINGS.faq ?? [];
  return <FaqEditorClient initialFaq={faq} />;
}
