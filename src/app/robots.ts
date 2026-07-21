import type { MetadataRoute } from 'next';
import { siteUrl } from '@/lib/supabase/public-config';


export default function robots(): MetadataRoute.Robots {
  const SITE = siteUrl();
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      // Zones sans interet pour les moteurs de recherche.
      disallow: ['/admin', '/api/', '/checkout', '/login', '/register', '/auth/'],
    },
    sitemap: `${SITE}/sitemap.xml`,
  };
}
