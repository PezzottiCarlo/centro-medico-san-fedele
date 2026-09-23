import { adminDb } from '@/lib/firebase/admin'
import type { RecensioneStatica } from '@/types'

export type Review = Pick<RecensioneStatica, 'autore' | 'testo' | 'stelle' | 'data' | 'fonte'>

interface GooglePlaceReview {
  author_name: string
  rating: number
  text: string
  time: number
}

interface GooglePlaceDetails {
  rating?: number
  user_ratings_total?: number
  url?: string
  reviews?: GooglePlaceReview[]
}

/** Voto medio e numero di recensioni della scheda Google del centro. */
export interface GoogleRiepilogo {
  voto: number
  totale: number
  /** Scheda del centro su Google Maps, con tutte le recensioni */
  url: string
  /** Pagina di Google per lasciare una recensione */
  scriviUrl: string
}

/**
 * Una sola chiamata a Google Places (in cache un'ora) per voto, totale e
 * recensioni. Senza GOOGLE_PLACES_API_KEY e GOOGLE_PLACE_ID restituisce null e
 * il sito mostra solo le recensioni inserite dall'admin.
 */
async function fetchGooglePlace(): Promise<GooglePlaceDetails | null> {
  const apiKey = process.env.GOOGLE_PLACES_API_KEY
  const placeId = process.env.GOOGLE_PLACE_ID
  if (!apiKey || !placeId) return null

  try {
    const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${encodeURIComponent(
      placeId
    )}&fields=rating,user_ratings_total,url,reviews&key=${apiKey}&language=it&reviews_sort=newest`
    const res = await fetch(url, { next: { revalidate: 3600 } })
    if (!res.ok) return null
    const data = (await res.json()) as { status?: string; result?: GooglePlaceDetails }
    if (data.status && data.status !== 'OK') {
      console.error('[reviews] Google Places ha risposto', data.status)
      return null
    }
    return data.result ?? null
  } catch (err) {
    console.error('[reviews] Google Places fetch failed:', err)
    return null
  }
}

async function fetchGoogleReviews(): Promise<Review[]> {
  const place = await fetchGooglePlace()
  return (place?.reviews ?? [])
    .filter((r) => r.rating >= 3.5 && r.text?.trim())
    .map<Review>((r) => ({
      autore: r.author_name,
      testo: r.text,
      stelle: r.rating,
      data: new Date(r.time * 1000).toISOString(),
      fonte: 'google',
    }))
}

export async function getGoogleRiepilogo(): Promise<GoogleRiepilogo | null> {
  const place = await fetchGooglePlace()
  const placeId = process.env.GOOGLE_PLACE_ID
  if (!place?.rating || !place.user_ratings_total || !placeId) return null
  return {
    voto: place.rating,
    totale: place.user_ratings_total,
    url: place.url || `https://www.google.com/maps/place/?q=place_id:${placeId}`,
    scriviUrl: `https://search.google.com/local/writereview?placeid=${encodeURIComponent(placeId)}`,
  }
}

async function fetchStaticReviews(): Promise<Review[]> {
  try {
    const snap = await adminDb.collection('recensioni_statiche').orderBy('data', 'desc').get()
    return snap.docs.map<Review>((d) => {
      const data = d.data()
      return {
        autore: data.autore,
        testo: data.testo,
        stelle: data.stelle,
        data: data.data,
        fonte: data.fonte ?? 'editoriale',
      }
    })
  } catch (err) {
    console.error('[reviews] Firestore static fetch failed:', err)
    return []
  }
}

export async function getReviews({ limit = 10 }: { limit?: number } = {}): Promise<Review[]> {
  const [google, statiche] = await Promise.all([fetchGoogleReviews(), fetchStaticReviews()])
  const merged = [...google, ...statiche]
  merged.sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime())
  return merged.slice(0, limit)
}
