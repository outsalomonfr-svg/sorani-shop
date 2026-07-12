import 'server-only';
import { createPublicClient } from '@/lib/supabase/admin';
import { DEFAULT_SETTINGS, type SiteSettings } from '@/types/site-settings';

export async function getSiteSettings(): Promise<SiteSettings> {
  try {
    const supabase = createPublicClient();

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

    // Fusionne les liens manuels + liens de pages CMS, en dédoublonnant par URL.
    // Évite le doublon "Contact" quand un lien manuel et une page CMS pointent vers
    // la même URL (ou quand d'anciennes sauvegardes ont "cuit" des liens CMS en base).
    const seenHrefs = new Set<string>();
    const links = [...base.nav.links, ...cmsLinks].filter((l) => {
      if (seenHrefs.has(l.href)) return false;
      seenHrefs.add(l.href);
      return true;
    });

    return {
      ...base,
      nav: {
        ...base.nav, // préserve layout, background, sticky, couleurs, etc.
        links,
      },
    };
  } catch {
    return DEFAULT_SETTINGS;
  }
}
