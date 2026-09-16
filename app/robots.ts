import type { MetadataRoute } from 'next'
import { SITE_URL } from '@/lib/siteUrl'

// Generato qui invece che in public/robots.txt, così gli indirizzi delle
// sitemap seguono il dominio configurato.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/admin/', '/api/'],
    },
    sitemap: [`${SITE_URL}/sitemap.xml`, `${SITE_URL}/image-sitemap.xml`],
    host: SITE_URL,
  }
}
