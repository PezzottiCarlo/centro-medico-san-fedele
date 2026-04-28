import { NextResponse } from 'next/server'
import { adminDb } from '@/lib/firebase/admin'

export const revalidate = 3600 // 1 hour cache

interface GoogleReview {
  author_name: string
  rating: number
  text: string
  time: number
}

export async function GET() {
  const reviews: {
    autore: string
    testo: string
    stelle: number
    data: string
    fonte: 'google' | 'editoriale'
  }[] = []

  // Fetch Google Places reviews
  if (process.env.GOOGLE_PLACES_API_KEY && process.env.GOOGLE_PLACE_ID) {
    try {
      const googleUrl = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${process.env.GOOGLE_PLACE_ID}&fields=reviews&key=${process.env.GOOGLE_PLACES_API_KEY}&language=it`
      const res = await fetch(googleUrl, { next: { revalidate: 3600 } })
      const data = await res.json()

      if (data.result?.reviews) {
        const googleReviews = (data.result.reviews as GoogleReview[])
          .filter((r) => r.rating >= 3.5)
          .map((r) => ({
            autore: r.author_name,
            testo: r.text,
            stelle: r.rating,
            data: new Date(r.time * 1000).toISOString(),
            fonte: 'google' as const,
          }))
        reviews.push(...googleReviews)
      }
    } catch (e) {
      console.error('Google Reviews fetch failed:', e)
    }
  }

  // Fetch static reviews from Firestore
  try {
    const snap = await adminDb
      .collection('recensioni_statiche')
      .orderBy('data', 'desc')
      .get()

    const static_reviews = snap.docs.map((d) => ({
      autore: d.data().autore,
      testo: d.data().testo,
      stelle: d.data().stelle,
      data: d.data().data,
      fonte: d.data().fonte as 'google' | 'editoriale',
    }))
    reviews.push(...static_reviews)
  } catch (e) {
    console.error('Firestore reviews fetch failed:', e)
  }

  // Sort by date desc, limit to 10
  reviews.sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime())

  return NextResponse.json(reviews.slice(0, 10))
}
