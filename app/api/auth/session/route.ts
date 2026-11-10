import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { adminAuth } from '@/lib/firebase/admin'
import { COOKIE_SESSIONE, leggiSessione } from '@/lib/firebase/sessione'

const DURATA_MS = 60 * 60 * 24 * 5 * 1000 // 5 giorni

// Un ID token vale un'ora: per creare la sessione si accetta solo un login
// appena fatto. Così un token rubato non si trasforma in un cookie da 5 giorni.
const LOGIN_RECENTE_S = 5 * 60

const CorpoSchema = z.object({ idToken: z.string().min(1).max(4096) })

function cookieSicuro(request: NextRequest): boolean {
  return (
    request.headers.get('x-forwarded-proto') === 'https' || request.nextUrl.protocol === 'https:'
  )
}

export async function POST(request: NextRequest) {
  let idToken: string
  try {
    idToken = CorpoSchema.parse(await request.json()).idToken
  } catch {
    return NextResponse.json({ success: false, error: 'Richiesta non valida' }, { status: 400 })
  }

  try {
    const decodificato = await adminAuth.verifyIdToken(idToken, true)
    if (Date.now() / 1000 - decodificato.auth_time > LOGIN_RECENTE_S) {
      return NextResponse.json(
        { success: false, error: 'Accesso troppo vecchio, rifai il login' },
        { status: 401 }
      )
    }

    const sessionCookie = await adminAuth.createSessionCookie(idToken, { expiresIn: DURATA_MS })
    const sicuro = cookieSicuro(request)

    const response = NextResponse.json({ success: true })
    response.cookies.set(COOKIE_SESSIONE, sessionCookie, {
      httpOnly: true,
      secure: sicuro,
      sameSite: sicuro ? 'strict' : 'lax',
      maxAge: DURATA_MS / 1000,
      path: '/',
    })
    return response
  } catch (error) {
    console.error('[sessione] creazione rifiutata:', (error as { code?: string })?.code ?? 'errore')
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
  }
}

/**
 * "Esci": oltre a cancellare il cookie revoca i refresh token dell'utente, così
 * anche le altre sessioni aperte (altri PC, il cookie se fosse stato copiato)
 * smettono di valere. La revoca è best-effort: il cookie si cancella comunque.
 */
export async function DELETE() {
  const utente = await leggiSessione()
  if (utente) {
    try {
      await adminAuth.revokeRefreshTokens(utente.uid)
    } catch (error) {
      console.error('[sessione] revoca fallita:', (error as { code?: string })?.code ?? 'errore')
    }
  }
  const response = NextResponse.json({ success: true })
  response.cookies.delete(COOKIE_SESSIONE)
  return response
}
