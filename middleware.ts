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

    // The actual token verification happens in the admin layout server component
    // Middleware just checks cookie presence for fast redirect
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*'],
}
