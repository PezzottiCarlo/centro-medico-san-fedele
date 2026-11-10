import { NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { leggiSessione } from '@/lib/firebase/sessione'
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
  '/privacy',
  '/cookie-policy',
])

// Prefissi di route dinamiche consentiti: es. /ambulatori/<slug>, /medici/<slug>
// (le patologie non hanno più pagine singole: si aprono in una finestra su /patologie)
const DYNAMIC_PREFIXES = ['/ambulatori/', '/medici/', '/news/']

function isAllowed(path: string): boolean {
  if (STATIC_PATHS.has(path)) return true
  return DYNAMIC_PREFIXES.some(
    (prefix) => path.startsWith(prefix) && path.length > prefix.length && !path.slice(prefix.length).includes('/')
  )
}

const CorpoSchema = z.object({
  slug: z.string().max(100).optional(),
  path: z.string().max(300).optional(),
  paths: z.array(z.string().max(300)).max(100).optional(),
  // Dati usati in molte pagine (contatti, specialistiche, medici): si
  // invalida tutto il sito pubblico invece di elencare decine di pagine
  tutto: z.boolean().optional(),
})

export async function POST(req: Request) {
  if (!(await leggiSessione())) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  }

  let body: z.infer<typeof CorpoSchema>
  try {
    body = CorpoSchema.parse(await req.json())
  } catch {
    return NextResponse.json({ error: 'invalid body' }, { status: 400 })
  }

  const revalidated: string[] = []

  if (body.tutto) {
    revalidatePath('/', 'layout')
    return NextResponse.json({ ok: true, revalidated: ['/ (layout)'] })
  }

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
