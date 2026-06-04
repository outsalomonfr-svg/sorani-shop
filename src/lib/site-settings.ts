import 'server-only';
import { createClient } from '@/lib/supabase/server';
import { DEFAULT_SETTINGS, type SiteSettings } from '@/types/site-settings';

export async function getSiteSettings(): Promise<SiteSettings> {
  try {
    const supabase = await createClient();

    const [settingsRes, navPagesRes] = await Promise.all([
      supabase.from('site_settings').select('data').eq('id', 1).single(),
      supabase
        .from('pages')
        .select('title, slug')
        .eq('status', 'published')
        .eq('show_in_nav', true)
        .order('title'),
    ]);

    const base: SiteSettings = settingsRes.data?.data
      ? { ...DEFAULT_SETTINGS, ...(settingsRes.data.data as Partial<SiteSettings>) }
      : DEFAULT_SETTINGS;

    const cmsLinks = (navPagesRes.data || []).map((p) => ({ label: p.title, href: `/${p.slug}` }));

    return {
      ...base,
      nav: {
        links: [...base.nav.links, ...cmsLinks],
      },
    };
  } catch {
    return DEFAULT_SETTINGS;
  }
}
