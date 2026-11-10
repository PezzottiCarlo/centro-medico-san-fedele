import { NextResponse } from 'next/server'

/**
 * Controlli comuni alle API pubbliche che ricevono JSON dai moduli del sito.
 *
 * - Content-Type `application/json` obbligatorio: un sito terzo può far partire
 *   dal browser dei suoi visitatori solo POST "semplici" (form, text/plain);
 *   per mandare JSON il browser chiederebbe prima il permesso (CORS), che qui
 *   non viene dato. Niente controllo sull'Origin: dietro App Hosting l'host
 *   visto dal server (run.app) è diverso da quello del sito.
 * - Corpo limitato: `request.json()` leggerebbe qualunque dimensione (Cloud Run
 *   accetta fino a 32 MB) e poche richieste bastano a esaurire la memoria.
 */
export async function leggiJson(
  request: Request,
  maxByte: number
): Promise<{ dati: unknown } | { errore: NextResponse }> {
  const tipo = request.headers.get('content-type') ?? ''
  if (!tipo.toLowerCase().startsWith('application/json')) {
    return { errore: NextResponse.json({ success: false, message: 'Formato non valido' }, { status: 415 }) }
  }

  if (Number(request.headers.get('content-length') || 0) > maxByte) {
    return { errore: troppoGrande() }
  }

  // Il content-length può mancare o mentire: si legge lo stream con un tetto
  const lettore = request.body?.getReader()
  if (!lettore) return { errore: nonValido() }
  const pezzi: Uint8Array[] = []
  let totale = 0
  for (;;) {
    const { done, value } = await lettore.read()
    if (done) break
    totale += value.byteLength
    if (totale > maxByte) {
      await lettore.cancel().catch(() => {})
      return { errore: troppoGrande() }
    }
    pezzi.push(value)
  }

  try {
    return { dati: JSON.parse(Buffer.concat(pezzi).toString('utf8')) }
  } catch {
    return { errore: nonValido() }
  }
}

function troppoGrande() {
  return NextResponse.json({ success: false, message: 'Richiesta troppo grande' }, { status: 413 })
}

function nonValido() {
  return NextResponse.json({ success: false, message: 'Richiesta non valida' }, { status: 400 })
}

/** Codice di un errore da loggare senza dati personali (es. indirizzi nei messaggi SMTP). */
export function codiceErrore(errore: unknown): string {
  const e = errore as { code?: unknown; responseCode?: unknown; name?: unknown } | null
  return [e?.code, e?.responseCode, e?.name].filter(Boolean).join(' ') || 'errore'
}
