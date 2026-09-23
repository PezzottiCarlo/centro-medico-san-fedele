import type { SiteConfig } from '@/types'

/** Anno di apertura del centro: da qui si contano gli anni di attività. */
export const ANNO_FONDAZIONE = 2008

/** Anni compiuti dall'apertura, aggiornati da soli ogni anno. */
export function anniDiAttivita(): number {
  return new Date().getFullYear() - ANNO_FONDAZIONE
}

/** Orari di apertura su una riga, per i messaggi brevi (chatbot, email). */
export function orariInBreve(site: Pick<SiteConfig, 'orari'>): string {
  return site.orari
    .filter((o) => o.giorno && o.ore && o.ore.toLowerCase() !== 'chiuso')
    .map((o) => `${o.giorno} ${o.ore}`)
    .join(' · ')
}

// Usato solo quando Firestore non risponde o non ha il doc site_config/main:
// i contatti ricalcano quelli salvati da /admin/dashboard/site-config, così
// anche nel caso peggiore il sito mostra un numero che risponde.

export const SITE_CONFIG_DEFAULT: SiteConfig = {
  telefono: '+39 3318001997',
  telefonoE164: '+393318001997',
  whatsappE164: '+393318001997',
  email: 'info@sanfedele.it',
  indirizzo: 'Via Risorgimento, 1',
  indirizzoCompleto: 'Via Risorgimento, 1 — 22030 Longone al Segrino (CO)',
  citta: 'Longone al Segrino',
  cap: '22030',
  provincia: 'CO',
  orari: [
    { giorno: 'Lunedì – Venerdì', ore: '09:00 – 19:30' },
    { giorno: 'Sabato – Domenica', ore: 'Chiuso' },
  ],
  mapsUrl: 'https://maps.google.com/?q=Via+Risorgimento+1+Longone+al+Segrino',
  // Vuoti di proposito: vanno compilati da /admin/dashboard/site-config.
  // Le pagine legali segnalano in modo esplicito i campi ancora mancanti.
  ragioneSociale: '',
  partitaIva: '',
  codiceFiscale: '',
  pec: '',
  dpoNome: '',
  dpoEmail: '',
  chatbotDomande: [
    'Quali visite specialistiche offrite?',
    'Come posso prenotare una visita?',
    'Dove siete e quali sono gli orari?',
    'Con quali assicurazioni siete convenzionati?',
  ],
}
