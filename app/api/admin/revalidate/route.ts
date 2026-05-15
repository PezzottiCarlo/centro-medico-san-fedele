import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { revalidatePath } from 'next/cache'
import { adminAuth } from '@/lib/firebase/admin'
import { HERO_SLUG_TO_PATH, HERO_PAGE_SLUGS, HeroPageSlug } from '@/lib/heroDefaults'

const KNOWN_PATHS = new Set<string>(['/', '/contatti', '/prenota'])

export async function POST(req: Request) {
  const cookieStore = cookies()
  const session = cookieStore.get('session')?.value
  if (!session) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  try {
    await adminAuth.verifySessionCookie(session, true)
  } catch {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  }

  let body: { slug?: string; path?: string } = {}
  try {
    body = (await req.json()) as { slug?: string; path?: string }
  } catch {
    return NextResponse.json({ error: 'invalid body' }, { status: 400 })
  }

  const revalidated: string[] = []

  if (body.slug && HERO_PAGE_SLUGS.includes(body.slug as HeroPageSlug)) {
    const path = HERO_SLUG_TO_PATH[body.slug as HeroPageSlug]
    revalidatePath(path)
    revalidated.push(path)
  }

  if (body.path && KNOWN_PATHS.has(body.path)) {
    revalidatePath(body.path)
    revalidated.push(body.path)
  }

  return NextResponse.json({ ok: true, revalidated })
}
