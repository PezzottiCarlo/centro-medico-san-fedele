import type { HeroConfig, HeroCTA, SiteConfig } from '@/types'

export const HERO_PAGE_SLUGS = [
  'home',
  'medici',
  'ambulatori',
  'contatti',
  'storia',
  'news',
  'convenzioni',
  'lavora-con-noi',
  'dsa',
  'sport',
  'patologie',
] as const

export type HeroPageSlug = (typeof HERO_PAGE_SLUGS)[number]

export const HERO_PAGE_LABELS: Record<HeroPageSlug, string> = {
  home: 'Home',
  medici: 'Medici',
  ambulatori: 'Ambulatori / Specialistiche',
  contatti: 'Contatti',
  storia: 'Storia',
  news: 'News',
  convenzioni: 'Convenzioni',
  'lavora-con-noi': 'Lavora con Noi',
  dsa: 'DSA',
  sport: 'Medicina Sportiva',
  patologie: 'Patologie',
}

export const HERO_SLUG_TO_PATH: Record<HeroPageSlug, string> = {
  home: '/',
  medici: '/medici',
  ambulatori: '/ambulatori',
  contatti: '/contatti',
  storia: '/storia',
  news: '/news',
  convenzioni: '/convenzioni',
  'lavora-con-noi': '/lavora-con-noi',
  dsa: '/dsa',
  sport: '/sport',
  patologie: '/patologie',
}

/**
 * Segnaposto per i link dei bottoni della hero. Al posto del numero scritto a
 * mano, il link punta ai contatti in /admin/dashboard/site-config: cambiando il
 * numero lì si aggiornano anche i bottoni, senza toccare le hero una per una.
 */
export const CTA_SEGNAPOSTO_TELEFONO = '{telefono}'
export const CTA_SEGNAPOSTO_WHATSAPP = '{whatsapp}'
export const CTA_SEGNAPOSTO_EMAIL = '{email}'
export const CTA_LINK_TELEFONO = `tel:${CTA_SEGNAPOSTO_TELEFONO}`
export const CTA_LINK_WHATSAPP = `https://wa.me/${CTA_SEGNAPOSTO_WHATSAPP}`
export const CTA_LINK_EMAIL = `mailto:${CTA_SEGNAPOSTO_EMAIL}`

// I link salvati prima dei segnaposto, col vecchio numero del centro scritto a
// mano: vengono letti come se fossero i segnaposto.
const CTA_LINK_STORICI: Record<string, string> = {
  'tel:+390313333585': CTA_LINK_TELEFONO,
  'https://wa.me/390313333585': CTA_LINK_WHATSAPP,
}

/** Porta i link storici ai segnaposto; gli altri restano come sono. */
export function normalizzaLinkCta(href: string): string {
  return CTA_LINK_STORICI[href.trim()] ?? href
}

/** Sostituisce i segnaposto con i contatti attuali del sito. */
export function risolviLinkCta(href: string, site: SiteConfig): string {
  const soloCifre = (numero: string) => numero.replace(/[^\d+]/g, '')
  const telefono = soloCifre(site.telefonoE164 || site.telefono)
  // wa.me vuole il numero internazionale senza "+" né zeri iniziali
  const whatsapp = soloCifre(site.whatsappE164 || telefono).replace(/^\+|^00/, '')
  return normalizzaLinkCta(href)
    .replaceAll(CTA_SEGNAPOSTO_TELEFONO, telefono)
    .replaceAll(CTA_SEGNAPOSTO_WHATSAPP, whatsapp)
    .replaceAll(CTA_SEGNAPOSTO_EMAIL, site.email)
}

export function risolviCta(cta: HeroCTA | undefined, site: SiteConfig): HeroCTA | undefined {
  return cta && { ...cta, href: risolviLinkCta(cta.href, site) }
}

export const HERO_DEFAULTS: Record<HeroPageSlug, HeroConfig> = {
  home: {
    pageSlug: 'home',
    titolo: 'La tua salute,',
    titoloEvidenziato: 'la nostra missione',
    immagine: '/hero-bg.jpg',
    variant: 'home-zoom',
    ctaPrimaria: { testo: 'Chiamaci ora', href: CTA_LINK_TELEFONO, icona: 'phone' },
    ctaSecondaria: { testo: 'Chatta ora', href: CTA_LINK_WHATSAPP, icona: 'whatsapp' },
    pubblicato: true,
  },
  medici: {
    pageSlug: 'medici',
    titolo: 'I Nostri Medici',
    sottotitolo:
      'Un team di professionisti esperti e dedicati alla tua salute, con competenze trasversali e anni di esperienza clinica.',
    immagine: '/medici.jpg',
    variant: 'standard',
    pubblicato: true,
  },
  ambulatori: {
    pageSlug: 'ambulatori',
    titolo: 'Specialistiche e Servizi',
    sottotitolo:
      'Un centro multidisciplinare con tutte le aree specialistiche e i servizi dedicati per ogni esigenza di salute, dalla diagnosi alla riabilitazione.',
    immagine: '/ambulatori.jpg',
    variant: 'standard',
    pubblicato: true,
  },
  contatti: {
    pageSlug: 'contatti',
    titolo: 'Scrivici, chiamaci o vieni a trovarci',
    sottotitolo:
      'Siamo a tua disposizione per qualsiasi informazione o richiesta. Nel cuore della Provincia di Como.',
    immagine: '/contatti.jpg',
    variant: 'standard',
    pubblicato: true,
  },
  storia: {
    pageSlug: 'storia',
    titolo: 'La nostra storia',
    sottotitolo:
      'Dal 2008 al fianco dei nostri pazienti. Un percorso di crescita, innovazione e dedizione alla cura della persona.',
    immagine: '/storia.jpg',
    variant: 'standard',
    pubblicato: true,
  },
  news: {
    pageSlug: 'news',
    titolo: 'News, Articoli & Eventi',
    sottotitolo:
      'Aggiornamenti, approfondimenti e notizie dal mondo della salute e dal nostro centro medico.',
    immagine: '/news.jpg',
    variant: 'standard',
    pubblicato: true,
  },
  convenzioni: {
    pageSlug: 'convenzioni',
    titolo: 'Convenzioni',
    sottotitolo:
      'Grazie alle nostre convenzioni, le prestazioni sono più accessibili. Verifica se la tua assicurazione o il tuo ente è tra i nostri partner.',
    immagine: '/convenzioni.jpg',
    variant: 'standard',
    pubblicato: true,
  },
  'lavora-con-noi': {
    pageSlug: 'lavora-con-noi',
    titolo: 'Lavora con Noi',
    sottotitolo: 'Cerchiamo professionisti appassionati e competenti per ampliare il nostro team.',
    immagine: '/lavora-con-noi.jpg',
    variant: 'standard',
    pubblicato: true,
  },
  dsa: {
    pageSlug: 'dsa',
    titolo: 'Area DSA',
    sottotitolo:
      'Percorsi specializzati di diagnosi, trattamento e supporto per bambini, adolescenti e adulti.',
    immagine: '/dsa.jpg',
    variant: 'standard',
    pubblicato: true,
  },
  sport: {
    pageSlug: 'sport',
    titolo: 'Medicina',
    titoloEvidenziato: 'Sportiva',
    sottotitolo:
      'Certificazioni medico-sportive, valutazioni funzionali e supporto nutrizionale per atleti di ogni livello. La tua performance inizia dalla salute.',
    variant: 'dark',
    ctaPrimaria: {
      testo: 'Prenota visita',
      href: '/prenota?specialistica=medicina-sportiva',
      icona: 'arrow',
    },
    ctaSecondaria: { testo: 'Scopri i servizi', href: '#servizi', icona: 'none' },
    pubblicato: true,
  },
  patologie: {
    pageSlug: 'patologie',
    titolo: 'Patologie Trattate',
    sottotitolo: 'Approfondisci le patologie trattate dai nostri specialisti.',
    variant: 'gradient-soft',
    pubblicato: true,
  },
}
