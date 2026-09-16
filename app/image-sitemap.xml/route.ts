import { adminDb } from '@/lib/firebase/admin'
import { SITE_URL } from '@/lib/siteUrl'
import type { StoriaEvento } from '@/types'

const BASE_URL = SITE_URL

// Rigenera al massimo ogni ora
export const revalidate = 3600

function escapeXml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim()
}

/**
 * Image sitemap dedicato: espone le foto della storia del centro (URL originali
 * Firebase Storage) con titolo/didascalia, così Google Immagini può indicizzarle.
 * Next 14 non supporta il campo `images` in sitemap.ts, quindi generiamo l'XML a mano.
 */
export async function GET() {
  let eventi: StoriaEvento[] = []
  try {
    const snap = await adminDb.collection('storia_eventi').where('pubblicato', '==', true).get()
    eventi = snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<StoriaEvento, 'id'>) }))
  } catch (e) {
    console.error('[image-sitemap] fetch error', e)
  }

  const withImages = eventi.filter((e) => !!e.immagine)

  // Raggruppa tutte le immagini della storia sotto la pagina /storia e /sport (le sportive)
  const storiaImgs = withImages
  const sportImgs = withImages.filter((e) => e.sportivo)

  function urlBlock(pageUrl: string, list: StoriaEvento[]): string {
    if (list.length === 0) return ''
    const images = list
      .map((e) => {
        const title = escapeXml(e.anno ? `${e.titolo} (${e.anno})` : e.titolo)
        const caption = escapeXml(stripHtml(e.descrizione || e.titolo).slice(0, 200))
        return `    <image:image>\n      <image:loc>${escapeXml(e.immagine as string)}</image:loc>\n      <image:title>${title}</image:title>\n      <image:caption>${caption}</image:caption>\n    </image:image>`
      })
      .join('\n')
    return `  <url>\n    <loc>${pageUrl}</loc>\n${images}\n  </url>`
  }

  const body = [urlBlock(`${BASE_URL}/storia`, storiaImgs), urlBlock(`${BASE_URL}/sport`, sportImgs)]
    .filter(Boolean)
    .join('\n')

  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">\n${body}\n</urlset>`

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600',
    },
  })
}
