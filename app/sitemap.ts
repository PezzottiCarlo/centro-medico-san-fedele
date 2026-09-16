import { MetadataRoute } from 'next'
import { adminDb } from '@/lib/firebase/admin'
import { SITE_URL } from '@/lib/siteUrl'
import { specialisticaHref } from '@/lib/utils'

const BASE_URL = SITE_URL

export const revalidate = 3600

type Voce = MetadataRoute.Sitemap[number]

// Solo pagine che rispondono 200 con contenuto proprio: niente redirect
// (/dove-siamo, /servizi) né indirizzi che non esistono. `lastModified` è
// indicato solo dove c'è una data vera, altrimenti Google impara a ignorarlo.
const PAGINE_FISSE: Voce[] = [
  { url: BASE_URL, changeFrequency: 'daily', priority: 1 },
  { url: `${BASE_URL}/ambulatori`, changeFrequency: 'weekly', priority: 0.9 },
  { url: `${BASE_URL}/medici`, changeFrequency: 'weekly', priority: 0.9 },
  { url: `${BASE_URL}/patologie`, changeFrequency: 'monthly', priority: 0.8 },
  { url: `${BASE_URL}/news`, changeFrequency: 'daily', priority: 0.8 },
  { url: `${BASE_URL}/dsa`, changeFrequency: 'monthly', priority: 0.7 },
  { url: `${BASE_URL}/sport`, changeFrequency: 'monthly', priority: 0.7 },
  { url: `${BASE_URL}/prenota`, changeFrequency: 'monthly', priority: 0.7 },
  { url: `${BASE_URL}/contatti`, changeFrequency: 'monthly', priority: 0.6 },
  { url: `${BASE_URL}/convenzioni`, changeFrequency: 'monthly', priority: 0.6 },
  { url: `${BASE_URL}/storia`, changeFrequency: 'yearly', priority: 0.5 },
  { url: `${BASE_URL}/lavora-con-noi`, changeFrequency: 'monthly', priority: 0.4 },
  { url: `${BASE_URL}/privacy`, changeFrequency: 'yearly', priority: 0.3 },
  { url: `${BASE_URL}/cookie-policy`, changeFrequency: 'yearly', priority: 0.3 },
]

function slugValido(slug: unknown): slug is string {
  return typeof slug === 'string' && slug.trim() !== ''
}

/** Data ISO valida, altrimenti niente: una data non valida farebbe fallire l'intera sitemap. */
function dataValida(valore: unknown): Date | undefined {
  if (typeof valore !== 'string' || !valore) return undefined
  const data = new Date(valore)
  return Number.isNaN(data.getTime()) ? undefined : data
}

async function specialistiche(): Promise<Voce[]> {
  const snap = await adminDb.collection('specialistiche').where('pubblicata', '==', true).get()
  return snap.docs
    .map((d) => d.data().slug)
    .filter(slugValido)
    .map((slug) => specialisticaHref(slug))
    // Le specialistiche con una pagina dedicata (/sport, /dsa) sono già tra le fisse
    .filter((href) => href.startsWith('/ambulatori/'))
    .map((href) => ({ url: `${BASE_URL}${href}`, changeFrequency: 'monthly', priority: 0.8 }))
}

async function medici(): Promise<Voce[]> {
  const snap = await adminDb.collection('medici').where('pubblicato', '==', true).get()
  return snap.docs
    .map((d) => d.data().slug)
    .filter(slugValido)
    .map((slug) => ({ url: `${BASE_URL}/medici/${slug}`, changeFrequency: 'monthly', priority: 0.7 }))
}

async function patologie(): Promise<Voce[]> {
  const snap = await adminDb.collection('patologie').get()
  return snap.docs
    .map((d) => d.data().slug)
    .filter(slugValido)
    .map((slug) => ({ url: `${BASE_URL}/patologie/${slug}`, changeFrequency: 'monthly', priority: 0.7 }))
}

async function news(): Promise<Voce[]> {
  const snap = await adminDb.collection('news_eventi').where('pubblicato', '==', true).get()
  return snap.docs.flatMap((d) => {
    const { slug, dataPublicazione } = d.data()
    if (!slugValido(slug)) return []
    return [
      {
        url: `${BASE_URL}/news/${slug}`,
        lastModified: dataValida(dataPublicazione),
        changeFrequency: 'yearly',
        priority: 0.6,
      } satisfies Voce,
    ]
  })
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Ogni collezione per conto suo: se una query fallisce, le altre pagine restano
  const risultati = await Promise.allSettled([specialistiche(), medici(), patologie(), news()])

  const dinamiche = risultati.flatMap((r) => {
    if (r.status === 'fulfilled') return r.value
    console.error('[sitemap] generazione parziale:', r.reason)
    return []
  })

  // Due documenti con lo stesso slug darebbero URL doppi
  const visti = new Set<string>()
  return [...PAGINE_FISSE, ...dinamiche].filter((voce) => {
    if (visti.has(voce.url)) return false
    visti.add(voce.url)
    return true
  })
}
