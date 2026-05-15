import type { HeroConfig } from '@/types'

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

export const HERO_DEFAULTS: Record<HeroPageSlug, HeroConfig> = {
  home: {
    pageSlug: 'home',
    titolo: 'La tua salute,',
    titoloEvidenziato: 'la nostra missione',
    immagine: '/hero-bg.jpg',
    variant: 'home-zoom',
    ctaPrimaria: { testo: 'Chiamaci ora', href: 'tel:+390313333585', icona: 'phone' },
    ctaSecondaria: { testo: 'Chatta ora', href: 'https://wa.me/390313333585', icona: 'whatsapp' },
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
