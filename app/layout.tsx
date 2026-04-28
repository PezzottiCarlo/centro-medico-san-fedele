import type { Metadata } from 'next'
import './globals.css'
import { generateOrganizationJsonLd } from '@/lib/seo'

export const metadata: Metadata = {
  title: {
    default: 'Centro Medico San Fedele',
    template: '%s | Centro Medico San Fedele',
  },
  description:
    "Centro medico d'eccellenza a Milano. Specialistiche mediche, medici esperti, diagnosi e trattamenti. Prenota la tua visita online.",
  keywords: [
    'centro medico Milano',
    'specialistiche mediche',
    'prenotazione visite',
    'medici esperti',
    'San Fedele',
  ],
  authors: [{ name: 'Centro Medico San Fedele' }],
  metadataBase: new URL('https://sanfedele.it'),
  openGraph: {
    type: 'website',
    locale: 'it_IT',
    siteName: 'Centro Medico San Fedele',
  },
  robots: {
    index: true,
    follow: true,
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const orgJsonLd = generateOrganizationJsonLd()

  return (
    <html lang="it">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(orgJsonLd) }}
        />
      </head>
      <body>{children}</body>
    </html>
  )
}
