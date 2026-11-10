import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Next 14 accetta qualunque qualità da 1 a 100 per /_next/image: ogni valore è
// una variante nuova da generare con sharp, e un estraneo potrebbe chiederne a
// raffica per saturare il server. Il sito usa solo la qualità di default.
const QUALITA_AMMESSE = new Set(['75'])

export async function middleware(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl

  if (pathname === '/_next/image') {
    if (!QUALITA_AMMESSE.has(searchParams.get('q') ?? '')) {
      return new NextResponse('Qualità non ammessa', { status: 400 })
    }
    return NextResponse.next()
  }

  // Area admin (tranne il login)
  if (pathname.startsWith('/admin') && !pathname.startsWith('/admin/login')) {
    const sessionCookie = request.cookies.get('session')

    if (!sessionCookie?.value) {
      return NextResponse.redirect(new URL('/admin/login', request.url))
    }

    // Qui si controlla solo che il cookie ci sia, per un redirect veloce: la
    // verifica vera (firma, scadenza, revoca) la fanno il layout della
    // dashboard, le pagine server e le API (lib/firebase/sessione.ts).
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*', '/_next/image'],
}
