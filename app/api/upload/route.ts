import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { adminAuth, getAdminApp } from '@/lib/firebase/admin'
import { getStorage } from 'firebase-admin/storage'

export const runtime = 'nodejs'

// Questa route scrive con l'Admin SDK, che scavalca le storage rules, e rende
// pubblico l'oggetto: senza il controllo di sessione sarebbe hosting pubblico
// gratuito per chiunque conosca l'URL.

/** Cartelle usate dal pannello admin: il client non può inventarne altre. */
const CARTELLE_AMMESSE = new Set([
  'medici',
  'specialistiche',
  'patologie',
  'convenzioni',
  'storia',
  'news',
  'hero',
  'uploads',
])

/**
 * Niente SVG: è un documento eseguibile e, servito pubblico dal bucket,
 * diventerebbe un vettore di script sotto un URL riconducibile al centro.
 */
const TIPI_AMMESSI: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/avif': 'avif',
  'image/gif': 'gif',
}

const DIMENSIONE_MAX = 8 * 1024 * 1024 // 8 MB

export async function POST(request: NextRequest) {
  // ── Solo admin autenticati ────────────────────────────────
  const session = cookies().get('session')?.value
  if (!session) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  }
  try {
    await adminAuth.verifySessionCookie(session, true)
  } catch {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  }

  try {
    const formData = await request.formData()
    const file = formData.get('file') as File | null
    const folder = (formData.get('folder') as string) || 'uploads'

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }
    if (!CARTELLE_AMMESSE.has(folder)) {
      return NextResponse.json({ error: 'Cartella non consentita' }, { status: 400 })
    }
    if (file.size > DIMENSIONE_MAX) {
      return NextResponse.json(
        { error: 'File troppo grande (massimo 8 MB)' },
        { status: 413 }
      )
    }

    const buffer = Buffer.from(await file.arrayBuffer())

    // Il tipo dichiarato dal client non è una prova: lo confrontiamo con i
    // magic bytes del contenuto e teniamo buono solo ciò che combacia.
    const tipoReale = riconosciTipo(buffer)
    if (!tipoReale || !TIPI_AMMESSI[tipoReale]) {
      return NextResponse.json(
        { error: 'Formato non supportato: carica JPEG, PNG, WebP, AVIF o GIF' },
        { status: 415 }
      )
    }

    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_').slice(0, 80)
    const filename = `${Date.now()}_${safeName}`

    const bucket = getStorage(getAdminApp()).bucket()
    const fileRef = bucket.file(`${folder}/${filename}`)

    await fileRef.save(buffer, {
      metadata: {
        contentType: tipoReale,
        // Evita che il browser reinterpreti il file come qualcos'altro
        contentDisposition: 'inline',
        cacheControl: 'public, max-age=31536000, immutable',
      },
    })
    await fileRef.makePublic()

    const url = `https://storage.googleapis.com/${bucket.name}/${folder}/${filename}`
    return NextResponse.json({ url })
  } catch (error) {
    console.error('[Upload] Failed:', error)
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 })
  }
}

/** Riconosce il formato dai primi byte del file, ignorando ciò che dichiara il client. */
function riconosciTipo(buf: Buffer): string | null {
  if (buf.length < 12) return null

  // JPEG: FF D8 FF
  if (buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) return 'image/jpeg'

  // PNG: 89 50 4E 47 0D 0A 1A 0A
  if (buf.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))) {
    return 'image/png'
  }

  // GIF: "GIF87a" o "GIF89a"
  if (buf.subarray(0, 6).toString('ascii').match(/^GIF8[79]a$/)) return 'image/gif'

  // Contenitori RIFF/ISO-BMFF: il tipo sta dopo la firma
  if (buf.subarray(0, 4).toString('ascii') === 'RIFF' && buf.subarray(8, 12).toString('ascii') === 'WEBP') {
    return 'image/webp'
  }
  if (buf.subarray(4, 8).toString('ascii') === 'ftyp') {
    const brand = buf.subarray(8, 12).toString('ascii')
    if (brand === 'avif' || brand === 'avis') return 'image/avif'
  }

  return null
}
