import { collection, getDocs, query, where, type Firestore } from 'firebase/firestore'
import { slugify } from '@/lib/utils'

/** Giorni degli orari dei medici: un'unica lista, con gli accenti. */
export const GIORNI = ['Lunedì', 'Martedì', 'Mercoledì', 'Giovedì', 'Venerdì', 'Sabato', 'Domenica']

/**
 * "Lunedi" → "Lunedì". La pagina di modifica usava i giorni senza accento e
 * quella di creazione con: nei dati ci sono entrambi, e la tendina non
 * riconosceva quelli dell'altra versione mostrando un giorno sbagliato.
 */
export function normalizzaGiorno(giorno: string): string {
  const base = (s: string) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').trim()
  return GIORNI.find((g) => base(g) === base(giorno)) ?? giorno
}

/** Vero se l'HTML dell'editor non contiene testo (Tiptap vuoto restituisce "<p></p>"). */
export function htmlVuoto(html: string | undefined | null): boolean {
  if (!html) return true
  if (/<img\b/i.test(html)) return false
  return html.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').trim() === ''
}

/** Id casuale; `crypto.randomUUID` non esiste su http da IP di rete (dev da telefono). */
export function nuovoId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`
}

/**
 * Slug delle pagine su cui il codice conta (/sport e /dsa li cercano per
 * nome): rinominarli dall'admin svuoterebbe quelle pagine senza avviso.
 */
export const SLUG_DI_SISTEMA = new Set(['medicina-sportiva', 'equipe-dsa'])

/**
 * Normalizza lo slug e controlla che non sia già usato da un altro documento
 * della stessa collection (le pagine pubbliche ne leggerebbero solo uno).
 * Restituisce lo slug pulito oppure un messaggio d'errore.
 */
export async function verificaSlug(
  db: Firestore,
  collezione: string,
  slugGrezzo: string,
  idAttuale?: string
): Promise<{ slug: string } | { errore: string }> {
  const slug = slugify(slugGrezzo)
  if (!slug) return { errore: 'Lo slug è obbligatorio (solo lettere, numeri e trattini).' }
  const snap = await getDocs(query(collection(db, collezione), where('slug', '==', slug)))
  if (snap.docs.some((d) => d.id !== idAttuale)) {
    return { errore: `Lo slug "${slug}" è già usato da un altro elemento: scegline uno diverso.` }
  }
  return { slug }
}

/** Data di oggi in ora italiana, per i campi <input type="date"> (YYYY-MM-DD). */
export function oggiLocale(): string {
  return new Intl.DateTimeFormat('sv-SE', { timeZone: 'Europe/Rome' }).format(new Date())
}

/** "2026-03-01" → ISO, o null se la data non è valida (es. campo svuotato). */
export function dataInIso(valore: string): string | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(valore)) return null
  const data = new Date(`${valore}T12:00:00`)
  return Number.isNaN(data.getTime()) ? null : data.toISOString()
}

/** ISO → "YYYY-MM-DD" in ora italiana, per ricaricare la data nel form. */
export function isoInData(iso: string | undefined): string {
  if (!iso) return ''
  const data = new Date(iso)
  return Number.isNaN(data.getTime())
    ? ''
    : new Intl.DateTimeFormat('sv-SE', { timeZone: 'Europe/Rome' }).format(data)
}
