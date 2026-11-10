import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import type { DecodedIdToken } from 'firebase-admin/auth'
import { adminAuth } from './admin'

export const COOKIE_SESSIONE = 'session'

/**
 * Utente della sessione admin, se il cookie è valido e non revocato
 * (`checkRevoked`: dopo "Esci" o un cambio password il cookie non vale più).
 */
export async function leggiSessione(): Promise<DecodedIdToken | null> {
  const valore = cookies().get(COOKIE_SESSIONE)?.value
  if (!valore) return null
  try {
    return await adminAuth.verifySessionCookie(valore, true)
  } catch {
    return null
  }
}

/** Per le pagine admin: senza sessione valida si torna al login. */
export async function richiediSessione(): Promise<DecodedIdToken> {
  const utente = await leggiSessione()
  if (!utente) redirect('/admin/login')
  return utente
}
