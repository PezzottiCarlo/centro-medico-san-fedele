/**
 * Verifica lato server dei token reCAPTCHA v3.
 *
 * Usiamo la v3 "invisibile": nessun rompicapo da risolvere, Google assegna alla
 * richiesta un punteggio da 0 (quasi certamente un bot) a 1 (quasi certamente
 * una persona). Per un centro medico è la scelta giusta: bloccare un paziente
 * vero perché ha sbagliato a riconoscere dei semafori costa più di qualche
 * messaggio di spam.
 *
 * Se le chiavi non sono configurate la verifica viene saltata, così il modulo
 * continua a funzionare prima che le chiavi esistano. In quel caso l'unica
 * difesa resta il rate limit: vedi `lib/rateLimit.ts`.
 */

const ENDPOINT = 'https://www.google.com/recaptcha/api/siteverify'

/** Sotto questo punteggio la richiesta è considerata automatica. */
const SOGLIA = 0.5

export interface EsitoRecaptcha {
  ok: boolean
  /** `true` quando la verifica non è stata eseguita perché non configurata. */
  saltata?: boolean
  punteggio?: number
  motivo?: string
}

export async function verificaRecaptcha(
  token: string | undefined | null,
  azioneAttesa: string
): Promise<EsitoRecaptcha> {
  const secret = process.env.RECAPTCHA_SECRET_KEY?.trim()
  if (!secret) {
    console.warn('[recaptcha] RECAPTCHA_SECRET_KEY non configurata: verifica saltata')
    return { ok: true, saltata: true }
  }

  if (!token) {
    return { ok: false, motivo: 'token assente' }
  }

  try {
    const res = await fetch(ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ secret, response: token }),
      // Se Google non risponde in fretta non teniamo l'utente in attesa
      signal: AbortSignal.timeout(5000),
    })
    const dati = (await res.json()) as {
      success?: boolean
      score?: number
      action?: string
      'error-codes'?: string[]
    }

    if (!dati.success) {
      return { ok: false, motivo: (dati['error-codes'] ?? []).join(', ') || 'token rifiutato' }
    }
    // L'azione lega il token al modulo da cui arriva: senza questo controllo un
    // token preso da un'altra pagina del sito varrebbe qui.
    if (dati.action && dati.action !== azioneAttesa) {
      return { ok: false, motivo: `azione inattesa: ${dati.action}` }
    }
    const punteggio = dati.score ?? 0
    if (punteggio < SOGLIA) {
      return { ok: false, punteggio, motivo: 'punteggio troppo basso' }
    }
    return { ok: true, punteggio }
  } catch (err) {
    // Google irraggiungibile non deve impedire a un paziente di prenotare:
    // lasciamo passare e ci affidiamo al rate limit.
    console.error('[recaptcha] verifica non riuscita, richiesta lasciata passare', err)
    return { ok: true, saltata: true }
  }
}
