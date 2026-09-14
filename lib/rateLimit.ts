/**
 * Rate limiting best-effort, in memoria.
 *
 * Il conteggio vive nell'istanza che serve la richiesta: con più istanze attive
 * il limite reale è il valore configurato moltiplicato per il numero di
 * istanze. Basta a fermare un flusso automatico banale, non un attacco
 * distribuito; per quello servirebbe un contatore condiviso (Redis) o le regole
 * di Cloud Armor davanti al backend.
 */

interface Finestra {
  colpi: number[]
  ultimoUso: number
}

const registro = new Map<string, Finestra>()
const PULIZIA_OGNI_MS = 5 * 60 * 1000
let ultimaPulizia = Date.now()

/**
 * Indirizzo del chiamante, per quanto è affidabile dietro il load balancer.
 *
 * Il client può inviare un proprio `X-Forwarded-For`: Google gli accoda il vero
 * indirizzo e poi quello del bilanciatore, quindi il primo valore è quello che
 * l'attaccante controlla e il penultimo è quello vero. Prendere il primo, come
 * si fa di solito, rende il limite aggirabile cambiando header a ogni richiesta.
 */
export function ipChiamante(headers: Headers): string {
  const xff = headers.get('x-forwarded-for')
  if (!xff) return 'sconosciuto'
  const parti = xff.split(',').map((p) => p.trim()).filter(Boolean)
  if (parti.length === 0) return 'sconosciuto'
  if (parti.length === 1) return parti[0]
  return parti[parti.length - 2]
}

/**
 * Registra un colpo e dice se la soglia è stata superata.
 * @returns `true` se la richiesta va rifiutata.
 */
export function limiteSuperato(
  chiave: string,
  max: number,
  finestraMs: number
): boolean {
  const ora = Date.now()

  // Senza potatura la mappa cresce con ogni IP mai visto: perdita di memoria
  // lenta, e quindi una leva per far cadere l'istanza.
  if (ora - ultimaPulizia > PULIZIA_OGNI_MS) {
    ultimaPulizia = ora
    registro.forEach((v, k) => {
      if (ora - v.ultimoUso > finestraMs * 2) registro.delete(k)
    })
  }

  const finestra = registro.get(chiave) ?? { colpi: [], ultimoUso: ora }
  const recenti = finestra.colpi.filter((t) => ora - t < finestraMs)
  recenti.push(ora)
  registro.set(chiave, { colpi: recenti, ultimoUso: ora })

  return recenti.length > max
}
