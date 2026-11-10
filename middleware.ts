import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Protect admin routes (except login)
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
  matcher: ['/admin/:path*'],
}
