import type { Metadata, Viewport } from 'next'
import { Inter, Lexend } from 'next/font/google'
import './globals.css'
import { descrizionePredefinita, generateOrganizationJsonLd } from '@/lib/seo'
import { getSiteConfig } from '@/lib/firebase/siteConfig'
import { jsonLdSicuro } from '@/lib/sanitizeHtml'
import { SITE_URL } from '@/lib/siteUrl'

// Font serviti dal sito stesso (scaricati in build): prima l'@import di Google
// Fonts finiva a metà del CSS e il browser lo ignorava, quindi si vedeva il
// font di sistema; in più ogni visita passava l'IP a Google.
const inter = Inter({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '800', '900'],
  display: 'swap',
  variable: '--font-inter',
})
const lexend = Lexend({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  display: 'swap',
  variable: '--font-lexend',
})

// Applica le preferenze di accessibilità prima del primo disegno, così chi usa
// l'alto contrasto o la modalità DSA non vede un lampo della grafica normale
const SCRIPT_ACCESSIBILITA = `try{var a=JSON.parse(localStorage.getItem('accessibility')||'{}');var c=document.documentElement.classList;if(a.dsaMode)c.add('dsa-mode');if(a.highContrast)c.add('high-contrast')}catch(e){}`

export const viewport: Viewport = {
  themeColor: '#406EA0',
}

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
    <html lang="it" className={`${inter.variable} ${lexend.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: SCRIPT_ACCESSIBILITA }} />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: jsonLdSicuro(orgJsonLd) }}
        />
      </head>
      <body>{children}</body>
    </html>
  )
}
