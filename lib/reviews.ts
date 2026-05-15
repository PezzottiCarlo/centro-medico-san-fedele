import { adminDb } from '@/lib/firebase/admin'
import type { RecensioneStatica } from '@/types'

export type Review = Pick<RecensioneStatica, 'autore' | 'testo' | 'stelle' | 'data' | 'fonte'>

interface GooglePlaceReview {
  author_name: string
  rating: number
  text: string
  time: number
}

async function fetchGoogleReviews(): Promise<Review[]> {
  const apiKey = process.env.GOOGLE_PLACES_API_KEY
  const placeId = process.env.GOOGLE_PLACE_ID
  if (!apiKey || !placeId) return []

  try {
    const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=reviews&key=${apiKey}&language=it`
    const res = await fetch(url, { next: { revalidate: 3600 } })
    if (!res.ok) return []
    const data = (await res.json()) as { result?: { reviews?: GooglePlaceReview[] } }
    const items = data.result?.reviews ?? []
    return items
      .filter((r) => r.rating >= 3.5)
      .map<Review>((r) => ({
        autore: r.author_name,
        testo: r.text,
        stelle: r.rating,
        data: new Date(r.time * 1000).toISOString(),
        fonte: 'google',
      }))
  } catch (err) {
    console.error('[reviews] Google Places fetch failed:', err)
    return []
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
