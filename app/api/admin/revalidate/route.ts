import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { revalidatePath } from 'next/cache'
import { adminAuth } from '@/lib/firebase/admin'
import { HERO_SLUG_TO_PATH, HERO_PAGE_SLUGS, HeroPageSlug } from '@/lib/heroDefaults'

// Route di contenuto statiche note (senza segmenti dinamici)
const STATIC_PATHS = new Set<string>([
  '/',
  '/contatti',
  '/prenota',
  '/ambulatori',
  '/medici',
  '/patologie',
  '/convenzioni',
  '/news',
  '/storia',
  '/sport',
  '/dsa',
  '/lavora-con-noi',
])

// Prefissi di route dinamiche consentiti: es. /ambulatori/<slug>, /medici/<slug>
const DYNAMIC_PREFIXES = ['/ambulatori/', '/medici/', '/patologie/', '/news/']

function isAllowed(path: string): boolean {
  if (STATIC_PATHS.has(path)) return true
  return DYNAMIC_PREFIXES.some(
    (prefix) => path.startsWith(prefix) && path.length > prefix.length && !path.slice(prefix.length).includes('/')
  )
}

export async function POST(req: Request) {
  const cookieStore = cookies()
  const session = cookieStore.get('session')?.value
  if (!session) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  try {
    await adminAuth.verifySessionCookie(session, true)
  } catch {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  }

  let body: { slug?: string; path?: string; paths?: string[] } = {}
  try {
    body = (await req.json()) as { slug?: string; path?: string; paths?: string[] }
  } catch {
    return NextResponse.json({ error: 'invalid body' }, { status: 400 })
  }

  const revalidated: string[] = []

  // Retrocompatibilità: revalidate tramite hero slug
  if (body.slug && HERO_PAGE_SLUGS.includes(body.slug as HeroPageSlug)) {
    const path = HERO_SLUG_TO_PATH[body.slug as HeroPageSlug]
    revalidatePath(path)
    revalidated.push(path)
  }

  // Raccogli tutti i path richiesti (singolo `path` legacy + array `paths`)
  const requested = [...(body.path ? [body.path] : []), ...(body.paths ?? [])]
  for (const path of requested) {
    if (isAllowed(path) && !revalidated.includes(path)) {
      revalidatePath(path)
      revalidated.push(path)
    }
  }

  return NextResponse.json({ ok: true, revalidated })
}
