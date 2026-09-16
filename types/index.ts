// ============================================================
// FIRESTORE DATA MODELS
// ============================================================

export interface SottoSpecialistica {
  id: string
  nome: string
  descrizione?: string // breve descrizione mostrata nel modale sulla pagina specialistica
  genere?: 'donna' | 'uomo' | 'entrambi' // usato dal selettore Donna/Uomo (es. Medicina Estetica)
}

export interface Specialistica {
  id: string
  slug: string
  nome: string
  descrizione: string
  descrizioneBreve: string
  icona: string
  metaTitle: string
  metaDescription: string
  order: number
  pubblicata?: boolean
  categoria?: 'fisioterapia' | 'specialistica_medica'
  sottoSpecialistiche?: SottoSpecialistica[]
  immagine?: string
}

export interface Orario {
  giorno: string
  ore: string
  tipo: 'appuntamento' | 'fisso'
}

export interface Medico {
  id: string
  slug: string
  nome: string
  foto: string
  bio: string
  curriculum: string
  mansione?: string
  specialisticheIds: string[]
  sottoSpecialisticheIds: string[]
  patologieIds: string[]
  orari: Orario[]
  telefono?: string
  email?: string
  pubblicato?: boolean
  suChiamata?: boolean
}

export interface Patologia {
  id: string
  slug: string
  nome: string
  descrizione: string
  specialisticaId: string
  mediciIds: string[]
  metaTitle: string
  metaDescription: string
  immagine?: string
}

export interface NewsEvento {
  id: string
  slug: string
  titolo: string
  corpo: string // HTML
  categoria: 'news' | 'evento' | 'articolo'
  dataPublicazione: string // ISO string
  autore: string
  immagine?: string
  pubblicato: boolean
}

export interface StoriaEvento {
  id: string
  anno: string
  titolo: string
  descrizione: string // HTML from RichEditor
  immagine?: string
  order: number
  pubblicato: boolean
  sportivo?: boolean // Tappa specifica della medicina sportiva
}

export interface Riconoscimento {
  id: string
  titolo: string
  anno: string
  descrizione: string
  pubblicato: boolean
}

export interface Lead {
  id: string
  nome: string
  cognome?: string
  telefono: string
  email: string
  messaggio: string
  specialistica?: string
  sottoSpecialistica?: string
  medico?: string
  timestamp: string // ISO string
  letto: boolean
  evaso?: boolean
  evasoIl?: string // ISO string
  fonte: 'form'
  // Prova del consenso raccolto al momento dell'invio (art. 7 §1 GDPR)
  consensoDati?: boolean // obbligatorio: gestione della richiesta, anche dati sanitari
  consensoMarketing?: boolean // facoltativo: comunicazioni e iniziative del centro
}

export interface Convenzione {
  id: string
  nome: string
  sottotitolo?: string // sconto/beneficio mostrato sotto il nome (es. "Sconto 30%")
  logo?: string
  url?: string
  attiva: boolean
  descrizione?: string
}

export interface RecensioneStatica {
  id: string
  autore: string
  testo: string
  stelle: number
  data: string
  fonte: 'google' | 'editoriale'
}

export type HeroVariant = 'standard' | 'home-zoom' | 'dark' | 'gradient-soft'
export type HeroCtaIcon = 'phone' | 'whatsapp' | 'calendar' | 'arrow' | 'none'

export interface HeroCTA {
  testo: string
  href: string
  icona?: HeroCtaIcon
}

export interface HeroConfig {
  pageSlug: string
  titolo: string
  titoloEvidenziato?: string
  sottotitolo?: string
  immagine?: string
  imageScale?: number
  variant: HeroVariant
  ctaPrimaria?: HeroCTA
  ctaSecondaria?: HeroCTA
  pubblicato: boolean
  aggiornatoIl?: string
}

export interface SiteConfigOrario {
  giorno: string
  ore: string
}

export interface SiteConfig {
  telefono: string
  telefonoE164: string
  whatsappE164?: string
  email: string
  indirizzo: string
  indirizzoCompleto: string
  citta: string
  cap: string
  provincia: string
  orari: SiteConfigOrario[]
  mapsUrl?: string
  chatbotDomande?: string[] // domande pre-impostate mostrate all'apertura del chatbot
  // ── Profili social del centro, mostrati nel footer solo se compilati ──
  instagramUrl?: string
  facebookUrl?: string
  linkedinUrl?: string
  // ── Dati del titolare del trattamento, usati dalle pagine legali ──
  ragioneSociale?: string
  partitaIva?: string
  codiceFiscale?: string
  pec?: string
  // ── Responsabile della Protezione dei Dati (DPO/RPD), se nominato ──
  dpoNome?: string
  dpoEmail?: string
  aggiornatoIl?: string
}

// ============================================================
// UI & COMPONENT TYPES
// ============================================================

export interface SearchResult {
  id: string
  type: 'medico' | 'specialistica' | 'patologia'
  nome: string
  slug: string
  descrizione?: string
}

export interface AccessibilityState {
  dsaMode: boolean
  highContrast: boolean
}

export interface PrenotaFormData {
  specialistica: string
  sottoSpecialistica?: string
  medico?: string
  nome: string
  cognome: string
  telefono: string
  email: string
  messaggio: string
}

export interface NavigationItem {
  label: string
  href: string
  children?: NavigationItem[]
}
