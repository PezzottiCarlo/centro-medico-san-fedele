/**
 * Ordinamento alfabetico dei medici.
 *
 * Su Firestore il medico ha un solo campo `nome`, che contiene titolo + cognome +
 * nome in un'unica stringa, nella forma usata in redazione: "Dott.ssa Nava
 * Alessandra". Non essendoci un campo `cognome` a sé, non si può ordinare con un
 * `orderBy` lato database: la chiave va calcolata qui.
 *
 * Poiché il cognome viene già per primo, la chiave è semplicemente il nome
 * ripulito dal titolo professionale — senza euristiche su quale parola sia il
 * cognome, che sbaglierebbero sui cognomi composti ("Di Stefano", "De Luca").
 * Il titolo va tolto, altrimenti tutti i "Dott." finirebbero prima dei "Dott.ssa".
 *
 * Attenzione: una scheda inserita al contrario ("Dott. Mario Rossi") si ordina
 * sotto la M. È un limite del campo unico, non dell'ordinamento.
 */

// Titoli professionali da ignorare, normalizzati senza punti (vedi `normalize`)
const TITOLI = new Set([
  'dott',
  'dottssa',
  'dottore',
  'dottoressa',
  'dr',
  'drssa',
  'dra',
  'prof',
  'profssa',
  'professore',
  'professoressa',
  'sig',
  'sigra',
])

function normalize(token: string): string {
  return token.toLowerCase().replace(/[.'’]/g, '')
}

/**
 * Chiave di ordinamento di un medico: il nome senza titolo e con gli spazi
 * normalizzati. Un nome mancante produce una chiave vuota, che
 * `compareMedicoNames` spinge in fondo alla lista.
 */
export function medicoSortKey(nome: string | null | undefined): string {
  const parti = (nome ?? '').trim().split(/\s+/).filter(Boolean)

  // Via i titoli in testa ("Dott.", "Prof.ssa", ...), anche se più di uno
  while (parti.length > 1 && TITOLI.has(normalize(parti[0]))) {
    parti.shift()
  }

  return parti.join(' ')
}

/** Confronta due medici per cognome; i nomi mancanti finiscono in fondo. */
export function compareMedicoNames(
  a: string | null | undefined,
  b: string | null | undefined
): number {
  const ka = medicoSortKey(a)
  const kb = medicoSortKey(b)
  if (!ka) return kb ? 1 : 0
  if (!kb) return -1
  return ka.localeCompare(kb, 'it', { sensitivity: 'base', numeric: true })
}

/**
 * Ritorna una nuova lista di medici ordinata alfabeticamente per cognome.
 * Da usare per le letture con l'SDK client (`getDocs`): quelle lato server
 * passano da `adminDb`, che ordina già da sé.
 */
export function sortMedici<T extends { nome?: string | null }>(medici: T[]): T[] {
  return [...medici].sort((a, b) => compareMedicoNames(a.nome, b.nome))
}
