import type { Metadata } from 'next'
import { SITE_CONFIG_DEFAULT } from '@/lib/siteConfig'
import { OG_BASE_URL, SITE_URL } from '@/lib/siteUrl'
import { riassunto, testoReale } from '@/lib/testo'
import type { SiteConfig } from '@/types'

const BASE_URL = SITE_URL
const NOME_SITO = 'Centro Medico San Fedele'
const DEFAULT_TITLE = NOME_SITO
/** Immagine per le anteprime social (1200×630) e logo dei dati strutturati */
const OG_IMAGE = `${OG_BASE_URL}/og-image.jpg`
const LOGO = `${OG_BASE_URL}/logo-san-fedele.png`

/**
 * Titolo di una pagina senza il nome del sito: lo aggiunge il template del
 * layout ("%s | Centro Medico San Fedele"). Toglie il suffisso se l'admin l'ha
 * già scritto nel meta title, altrimenti compariva due o tre volte.
 */
function titoloPulito(titolo: string): string {
  return titolo.replace(/\s*[|–—-]\s*Centro Medico San Fedele\s*$/i, '').trim()
}

/**
 * Meta title dall'admin, se è un titolo vero: un valore di una o due lettere
 * (es. "S", lasciato a metà) cede il posto al nome della pagina.
 */
export function metaTitolo(metaTitle: string | undefined, nome: string): string {
  const pulito = titoloPulito(metaTitle ?? '')
  return pulito.length >= 3 ? pulito : nome
}

/**
 * Meta description dall'admin, se è una frase vera: segnaposto come "da fare"
 * o testi troppo brevi per Google cedono il posto a quella calcolata.
 */
export function metaDescrizione(metaDescription: string | undefined, ripiego: string): string {
  const pulita = testoReale(metaDescription)
  return pulita.length >= 30 ? pulita : ripiego
}

/** "Longone al Segrino (CO)", dai dati di /admin/dashboard/site-config. */
export function localitaCentro(site: Pick<SiteConfig, 'citta' | 'provincia'>): string {
  return site.provincia ? `${site.citta} (${site.provincia})` : site.citta
}

export function descrizionePredefinita(site: SiteConfig = SITE_CONFIG_DEFAULT): string {
  return `Centro medico d'eccellenza a ${localitaCentro(site)}. Specialistiche mediche, medici esperti, diagnosi e trattamenti. Prenota la tua visita.`
}

export function generatePageMetadata({
  title,
  description,
  slug,
  image,
  site,
}: {
  title?: string
  description?: string
  slug?: string
  image?: string
  /** Contatti attuali del centro, per la descrizione predefinita */
  site?: SiteConfig
}): Metadata {
  const titoloPagina = title ? titoloPulito(title) : ''
  // og:title e twitter non passano dal template del layout: lì serve completo
  const fullTitle = titoloPagina ? `${titoloPagina} | ${NOME_SITO}` : DEFAULT_TITLE
  // `||` e non `??`: una description vuota ("" da una bio vuota) toglieva il tag
  const desc = description?.trim() || descrizionePredefinita(site)
  const url = slug ? `${BASE_URL}/${slug}` : BASE_URL
  const ogImage = image || OG_IMAGE

  return {
    // Il layout aggiunge " | Centro Medico San Fedele"; la home usa il titolo intero
    title: titoloPagina ? titoloPagina : { absolute: DEFAULT_TITLE },
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
    description: riassunto(medico.bio, 300) || undefined,
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
    // Testo semplice: la descrizione è HTML dell'editor
    description: riassunto(spec.descrizione, 300) || undefined,
    url: `${BASE_URL}/ambulatori/${spec.slug}`,
  }
}

/**
 * JSON-LD ImageGallery per le foto della storia del centro: aiuta Google Immagini
 * a indicizzare le immagini con nome/didascalia significativi.
 */
export function generateStoriaImageGalleryJsonLd(
  eventi: { titolo: string; descrizione?: string; immagine?: string; anno?: string }[]
) {
  const images = eventi
    .filter((e) => !!e.immagine)
    .map((e) => ({
      '@type': 'ImageObject',
      contentUrl: e.immagine,
      url: e.immagine,
      name: e.anno ? `${e.titolo} (${e.anno})` : e.titolo,
      caption: riassunto(e.descrizione, 200) || e.titolo,
      creditText: 'Centro Medico San Fedele',
    }))

  return {
    '@context': 'https://schema.org',
    '@type': 'ImageGallery',
    name: 'La storia del Centro Medico San Fedele',
    url: `${BASE_URL}/storia`,
    image: images,
  }
}

export function generateOrganizationJsonLd(site?: SiteConfig) {
  return {
    '@context': 'https://schema.org',
    '@type': 'MedicalOrganization',
    name: 'Centro Medico San Fedele',
    url: BASE_URL,
    logo: LOGO,
    contactPoint: {
      '@type': 'ContactPoint',
      telephone: (site?.telefonoE164 || SITE_CONFIG_DEFAULT.telefonoE164).replace(/[^\d+]/g, ''),
      email: site?.email,
      contactType: 'customer service',
      availableLanguage: 'Italian',
    },
    address: {
      '@type': 'PostalAddress',
      streetAddress: site?.indirizzo || SITE_CONFIG_DEFAULT.indirizzo,
      addressLocality: site?.citta || SITE_CONFIG_DEFAULT.citta,
      addressRegion: site?.provincia || SITE_CONFIG_DEFAULT.provincia,
      postalCode: site?.cap || SITE_CONFIG_DEFAULT.cap,
      addressCountry: 'IT',
    },
  }
}
