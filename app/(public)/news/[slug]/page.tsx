import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { adminDb } from '@/lib/firebase/admin'
import { generatePageMetadata } from '@/lib/seo'
import type { NewsEvento } from '@/types'
import { formatDate } from '@/lib/utils'
import { ArrowLeft } from 'lucide-react'

export const revalidate = 60

export async function generateStaticParams() {
  try {
    const snap = await adminDb.collection('news_eventi').where('pubblicato', '==', true).get()
    return snap.docs.map((d) => ({ slug: d.data().slug as string }))
  } catch {
    return []
  }
}

async function getData(slug: string): Promise<NewsEvento | null> {
  const snap = await adminDb.collection('news_eventi').where('slug', '==', slug).limit(1).get()
  if (snap.empty) return null
  const d = snap.docs[0]
  return { id: d.id, ...(d.data() as Omit<NewsEvento, 'id'>) }
}

export async function generateMetadata({ params }: { params: { slug: string } }) {
  try {
    const news = await getData(params.slug)
    if (!news) return {}
    return generatePageMetadata({
      title: news.titolo,
      description: news.corpo?.replace(/<[^>]*>/g, '').substring(0, 160),
      slug: `news/${params.slug}`,
      image: news.immagine,
    })
  } catch {
    return {}
  }
}

export default async function NewsDetailPage({ params }: { params: { slug: string } }) {
  const news = await getData(params.slug)
  if (!news) notFound()

  return (
    <article className="section">
      <div className="container-main max-w-4xl">
        <Link href="/news" className="inline-flex items-center gap-2 text-primary hover:underline mb-8 text-sm">
          <ArrowLeft size={16} /> Torna alle news
        </Link>

        {news.immagine && (
          <div className="relative h-64 md:h-96 rounded-lg overflow-hidden mb-8">
            <Image src={news.immagine} alt={news.titolo} fill className="object-cover" />
          </div>
        )}

        <div className="flex items-center gap-3 mb-4">
          <span className="text-xs font-medium text-primary bg-primary/10 px-3 py-1 rounded-full">
            {news.categoria}
          </span>
          <time className="text-sm text-gray-400">{formatDate(news.dataPublicazione)}</time>
          {news.autore && <span className="text-sm text-gray-400">di {news.autore}</span>}
        </div>

        <h1 className="heading-1 mb-8">{news.titolo}</h1>

        <div
          className="prose-content text-gray-600 leading-relaxed text-lg"
          dangerouslySetInnerHTML={{ __html: news.corpo }}
        />

        <div className="border-t border-gray-100 mt-12 pt-8">
          <Link href="/prenota" className="btn-primary">
            Prenota una visita
          </Link>
        </div>
      </div>
    </article>
  )
}
