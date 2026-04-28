import { MetadataRoute } from 'next'
import { adminDb } from '@/lib/firebase/admin'

const BASE_URL = 'https://sanfedele.it'

export const revalidate = 3600

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const routes: MetadataRoute.Sitemap = [
    { url: BASE_URL, lastModified: new Date(), changeFrequency: 'daily', priority: 1 },
    { url: `${BASE_URL}/ambulatori`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.9 },
    { url: `${BASE_URL}/medici`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.9 },
    { url: `${BASE_URL}/patologie`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.8 },
    { url: `${BASE_URL}/news`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.8 },
    { url: `${BASE_URL}/dsa`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.7 },
    { url: `${BASE_URL}/contatti`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.6 },
    { url: `${BASE_URL}/prenota`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.7 },
    { url: `${BASE_URL}/chi-siamo`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.7 },
    { url: `${BASE_URL}/dove-siamo`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.6 },
    { url: `${BASE_URL}/convenzioni`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.6 },
    { url: `${BASE_URL}/servizi`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.7 },
    { url: `${BASE_URL}/storia`, lastModified: new Date(), changeFrequency: 'yearly', priority: 0.5 },
    { url: `${BASE_URL}/privacy`, lastModified: new Date(), changeFrequency: 'yearly', priority: 0.3 },
    { url: `${BASE_URL}/cookie-policy`, lastModified: new Date(), changeFrequency: 'yearly', priority: 0.3 },
    { url: `${BASE_URL}/lavora-con-noi`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.4 },
  ]

  try {
    // Dynamic specialistiche
    const specSnap = await adminDb.collection('specialistiche').where('pubblicata', '==', true).get()
    specSnap.docs.forEach((d) => {
      routes.push({
        url: `${BASE_URL}/ambulatori/${d.data().slug}`,
        lastModified: new Date(),
        changeFrequency: 'monthly',
        priority: 0.8,
      })
    })

    // Dynamic medici
    const mediciSnap = await adminDb
      .collection('medici')
      .where('pubblicato', '==', true)
      .get()
    mediciSnap.docs.forEach((d) => {
      routes.push({
        url: `${BASE_URL}/medici/${d.data().slug}`,
        lastModified: new Date(),
        changeFrequency: 'monthly',
        priority: 0.7,
      })
    })

    // Dynamic patologie
    const patSnap = await adminDb.collection('patologie').get()
    patSnap.docs.forEach((d) => {
      routes.push({
        url: `${BASE_URL}/patologie/${d.data().slug}`,
        lastModified: new Date(),
        changeFrequency: 'monthly',
        priority: 0.7,
      })
    })

    // Dynamic news
    const newsSnap = await adminDb
      .collection('news_eventi')
      .where('pubblicato', '==', true)
      .get()
    newsSnap.docs.forEach((d) => {
      routes.push({
        url: `${BASE_URL}/news/${d.data().slug}`,
        lastModified: new Date(d.data().dataPublicazione),
        changeFrequency: 'yearly',
        priority: 0.6,
      })
    })
  } catch (e) {
    console.error('Sitemap generation error:', e)
  }

  return routes
}
