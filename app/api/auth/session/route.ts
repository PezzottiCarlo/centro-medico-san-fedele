import { NextRequest, NextResponse } from 'next/server'
import { adminAuth } from '@/lib/firebase/admin'

export async function POST(request: NextRequest) {
  try {
    const { idToken } = await request.json()

    // Verify the ID token
    await adminAuth.verifyIdToken(idToken)

    // Create session cookie (5 days)
    const expiresIn = 60 * 60 * 24 * 5 * 1000
    const sessionCookie = await adminAuth.createSessionCookie(idToken, { expiresIn })

    const isSecure = request.headers.get('x-forwarded-proto') === 'https' ||
      request.nextUrl.protocol === 'https:'

    const response = NextResponse.json({ success: true })
    response.cookies.set('session', sessionCookie, {
      httpOnly: true,
      secure: isSecure,
      sameSite: isSecure ? 'strict' : 'lax',
      maxAge: expiresIn / 1000,
      path: '/',
    })

    return response
  } catch (error) {
    console.error('Session creation failed:', error)
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
  }
}

export async function DELETE() {
  const response = NextResponse.json({ success: true })
  response.cookies.delete('session')
  return response
}
