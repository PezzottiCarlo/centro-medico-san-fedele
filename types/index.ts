// ============================================================
// FIRESTORE DATA MODELS
// ============================================================

export interface SottoSpecialistica {
  id: string
  nome: string
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
  fonte: 'form'
}

export interface Convenzione {
  id: string
  nome: string
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
