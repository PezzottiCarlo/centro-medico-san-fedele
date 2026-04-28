import type { Metadata } from 'next'

const BASE_URL = 'https://sanfedele.it'
const DEFAULT_TITLE = 'Centro Medico San Fedele'
const DEFAULT_DESCRIPTION =
  'Centro medico d\'eccellenza a Longone al Segrino (CO). Specialistiche mediche, medici esperti, diagnosi e trattamenti. Prenota la tua visita.'

export function generatePageMetadata({
  title,
  description,
  slug,
  image,
}: {
  title?: string
  description?: string
  slug?: string
  image?: string
}): Metadata {
  const fullTitle = title ? `${title} | Centro Medico San Fedele` : DEFAULT_TITLE
  const desc = description ?? DEFAULT_DESCRIPTION
  const url = slug ? `${BASE_URL}/${slug}` : BASE_URL
  const ogImage = image ?? `${BASE_URL}/og-image.jpg`

  return {
    title: fullTitle,
    description: desc,
    openGraph: {
      title: fullTitle,
      description: desc,
      url,
      siteName: 'Centro Medico San Fedele',
      images: [{ url: ogImage, width: 1200, height: 630 }],
      locale: 'it_IT',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: fullTitle,
      description: desc,
      images: [ogImage],
    },
    alternates: {
      canonical: url,
    },
  }
}

export function generatePhysicianJsonLd(medico: {
  nome: string
  bio: string
  foto?: string
  slug: string
  specialistiche?: string[]
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Physician',
    name: medico.nome,
    description: medico.bio,
    image: medico.foto,
    url: `${BASE_URL}/medici/${medico.slug}`,
    medicalSpecialty: medico.specialistiche,
    worksFor: {
      '@type': 'MedicalOrganization',
      name: 'Centro Medico San Fedele',
      url: BASE_URL,
    },
  }
}

export function generateSpecialtyJsonLd(spec: {
  nome: string
  descrizione: string
  slug: string
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'MedicalSpecialty',
    name: spec.nome,
    description: spec.descrizione,
    url: `${BASE_URL}/ambulatori/${spec.slug}`,
  }
}

export function generateOrganizationJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'MedicalOrganization',
    name: 'Centro Medico San Fedele',
    url: BASE_URL,
    logo: `${BASE_URL}/logo.png`,
    contactPoint: {
      '@type': 'ContactPoint',
      telephone: '+39-031-333-3585',
      contactType: 'customer service',
      availableLanguage: 'Italian',
    },
    address: {
      '@type': 'PostalAddress',
      streetAddress: 'Via Risorgimento, 1',
      addressLocality: 'Longone al Segrino',
      addressRegion: 'CO',
      postalCode: '22030',
      addressCountry: 'IT',
    },
  }
}
