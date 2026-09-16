import type { Metadata } from 'next'
import './globals.css'
import { descrizionePredefinita, generateOrganizationJsonLd } from '@/lib/seo'
import { getSiteConfig } from '@/lib/firebase/siteConfig'
import { jsonLdSicuro } from '@/lib/sanitizeHtml'
import { SITE_URL } from '@/lib/siteUrl'

export async function generateMetadata(): Promise<Metadata> {
  const site = await getSiteConfig()
  return {
    title: {
      default: 'Centro Medico San Fedele',
      template: '%s | Centro Medico San Fedele',
    },
    description: descrizionePredefinita(site),
    keywords: [
      `centro medico ${site.citta}`,
      'specialistiche mediche',
      'prenotazione visite',
      'medici esperti',
      'San Fedele',
    ],
    authors: [{ name: 'Centro Medico San Fedele' }],
    metadataBase: new URL(SITE_URL),
    openGraph: {
      type: 'website',
      locale: 'it_IT',
      siteName: 'Centro Medico San Fedele',
    },
    robots: {
      index: true,
      follow: true,
    },
    icons: {
      icon: '/logo-san-fedele.ico',
      shortcut: '/logo-san-fedele.ico',
    },
  }
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const site = await getSiteConfig()
  const orgJsonLd = generateOrganizationJsonLd(site)

  return (
    <html lang="it">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: jsonLdSicuro(orgJsonLd) }}
        />
      </head>
      <body>{children}</body>
    </html>
  )
}
