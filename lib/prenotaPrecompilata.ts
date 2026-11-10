/**
 * Dati personali con cui MelaBot precompila il modulo di prenotazione.
 *
 * Il bot li mette dopo il "#" del link a /prenota; al clic il chatbot li toglie
 * dal link e li lascia qui, in sessionStorage, dove il modulo li legge una volta
 * sola. Così nome, telefono e motivo della visita non finiscono mai nell'URL
 * (né nei log del server, né nella cronologia del browser).
 */

const CHIAVE = 'sanfedele:prenota-precompilata'

/**
 * Avvisa il modulo già aperto che sono arrivati dati nuovi. Va mandato solo se
 * il link del bot porta esattamente alla pagina in cui si è: con parametri
 * diversi il modulo si rimonta e li legge da sé (se lo ricevesse il modulo
 * vecchio, li consumerebbe un attimo prima di sparire).
 */
export const EVENTO_PRECOMPILA = 'sanfedele:precompila'

export interface DatiPrecompilati {
  nome?: string
  cognome?: string
  telefono?: string
  email?: string
  messaggio?: string
}

const LIMITI: Record<keyof DatiPrecompilati, number> = {
  nome: 100,
  cognome: 100,
  telefono: 20,
  email: 200,
  messaggio: 1000,
}

/** Legge i dati dal frammento "#nome=...&telefono=..." del link del bot. */
export function datiDaFrammento(frammento: string): DatiPrecompilati {
  const parametri = new URLSearchParams(frammento.replace(/^#/, ''))
  const dati: DatiPrecompilati = {}
  for (const campo of Object.keys(LIMITI) as (keyof DatiPrecompilati)[]) {
    const valore = parametri.get(campo)?.trim()
    if (valore) dati[campo] = valore.slice(0, LIMITI[campo])
  }
  return dati
}

export function salvaPrecompilazione(dati: DatiPrecompilati): void {
  if (Object.keys(dati).length === 0) return
  try {
    sessionStorage.setItem(CHIAVE, JSON.stringify(dati))
  } catch {
    /* sessionStorage non disponibile: il modulo resterà vuoto */
  }
}

/** Restituisce i dati salvati e li cancella: valgono per una sola apertura del modulo. */
export function prendiPrecompilazione(): DatiPrecompilati | null {
  try {
    const grezzo = sessionStorage.getItem(CHIAVE)
    if (!grezzo) return null
    sessionStorage.removeItem(CHIAVE)
    const dati = JSON.parse(grezzo) as DatiPrecompilati
    return typeof dati === 'object' && dati ? dati : null
  } catch {
    return null
  }
}
