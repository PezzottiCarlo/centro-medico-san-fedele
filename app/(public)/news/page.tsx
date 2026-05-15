import { adminDb } from '@/lib/firebase/admin'
import { generatePageMetadata } from '@/lib/seo'
import type { NewsEvento } from '@/types'
import Link from 'next/link'
import Image from 'next/image'
import { formatDate } from '@/lib/utils'
import { ArrowRight, Newspaper, BookOpen, CalendarDays } from 'lucide-react'
import { PageHero } from '@/components/layout/PageHero'
import { getHeroConfig } from '@/lib/firebase/hero'

export const revalidate = 60
export const metadata = generatePageMetadata({
  title: 'News & Articoli',
  description: 'News, articoli e aggiornamenti dal Centro Medico San Fedele.',
  slug: 'news',
})

async function getNews(): Promise<NewsEvento[]> {
  try {
    const snap = await adminDb
      .collection('news_eventi')
      .where('pubblicato', '==', true)
      .orderBy('dataPublicazione', 'desc')
      .get()
    return snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<NewsEvento, 'id'>) }))
  } catch (error) {
    console.error('[News] Failed to fetch news:', error)
    return []
  }
}

const SECTIONS = [
  { key: 'news' as const, label: 'News', icon: Newspaper, description: 'Le ultime notizie dal Centro Medico' },
  { key: 'articolo' as const, label: 'Articoli', icon: BookOpen, description: 'Approfondimenti e consigli per la tua salute' },
  { key: 'evento' as const, label: 'Eventi', icon: CalendarDays, description: 'Eventi, giornate e iniziative in programma' },
]

const CATEGORY_LABELS: Record<string, string> = {
  news: 'News',
  articolo: 'Articolo',
  evento: 'Evento',
}

function FeaturedCard({ item }: { item: NewsEvento }) {
  return (
    <Link
      href={`/news/${item.slug}`}
      className="group block bg-white rounded-lg shadow-card border border-gray-100 hover:shadow-card-hover transition-all hover:-translate-y-1 overflow-hidden"
    >
      <div className="flex flex-col md:flex-row">
        {/* Image */}
        <div className="relative aspect-video md:aspect-auto md:w-2/5 bg-gradient-to-br from-primary/10 to-secondary/10 flex-shrink-0">
          {item.immagine ? (
            <Image src={item.immagine} alt={item.titolo} fill className="object-cover" />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <Newspaper size={48} className="text-primary/30" />
            </div>
          )}
        </div>
        {/* Content */}
        <div className="p-6 md:p-8 flex flex-col justify-center flex-1">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-xs font-medium text-primary bg-primary/10 px-2 py-1 rounded">
              {CATEGORY_LABELS[item.categoria] || item.categoria}
            </span>
            <span className="text-xs text-gray-400">{formatDate(item.dataPublicazione)}</span>
          </div>
          <h3 className="font-semibold text-text-main text-xl md:text-2xl mb-3 group-hover:text-primary transition-colors">
            {item.titolo}
          </h3>
          <span className="inline-flex items-center gap-1 text-primary text-sm font-medium group-hover:gap-2 transition-all mt-auto">
            Leggi l&apos;articolo <ArrowRight size={14} />
          </span>
        </div>
      </div>
    </Link>
  )
}

function NewsCard({ item }: { item: NewsEvento }) {
  return (
    <Link
      href={`/news/${item.slug}`}
      className="group block bg-white rounded-lg shadow-card border border-gray-100 hover:shadow-card-hover transition-all hover:-translate-y-1 overflow-hidden"
    >
      {/* Image */}
      <div className="relative h-48 bg-gradient-to-br from-primary/10 to-secondary/10">
        {item.immagine ? (
          <Image src={item.immagine} alt={item.titolo} fill className="object-cover" />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <Newspaper size={32} className="text-primary/30" />
          </div>
        )}
      </div>
      {/* Content */}
      <div className="p-5">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-xs font-medium text-primary bg-primary/10 px-2 py-0.5 rounded">
            {CATEGORY_LABELS[item.categoria] || item.categoria}
          </span>
          <span className="text-xs text-gray-400">{formatDate(item.dataPublicazione)}</span>
        </div>
        <h3 className="font-semibold text-text-main text-lg mb-3 group-hover:text-primary transition-colors line-clamp-2">
          {item.titolo}
        </h3>
        <span className="inline-flex items-center gap-1 text-primary text-sm font-medium group-hover:gap-2 transition-all">
          Leggi <ArrowRight size={14} />
        </span>
      </div>
    </Link>
  )
}

export default async function NewsPage() {
  const [allItems, hero] = await Promise.all([getNews(), getHeroConfig('news')])

  const grouped = {
    news: allItems.filter((n) => n.categoria === 'news'),
    articolo: allItems.filter((n) => n.categoria === 'articolo'),
    evento: allItems.filter((n) => n.categoria === 'evento'),
  }

  const hasContent = allItems.length > 0

  // Most recent items (first 2) get the featured treatment
  const featured = allItems.slice(0, 2)
  const rest = allItems.slice(2)

  return (
    <>
      <PageHero config={hero} />

      {!hasContent ? (
        <div className="section">
          <div className="container-main">
            <p className="text-center text-gray-400">Nessun contenuto disponibile al momento.</p>
          </div>
        </div>
      ) : (
        <>
          {/* Featured / most recent */}
          {featured.length > 0 && (
            <section className="section bg-white">
              <div className="container-main">
                <div className="text-center mb-10">
                  <p className="text-primary uppercase text-sm tracking-wide mb-2 font-medium">
                    In primo piano
                  </p>
                  <h2 className="heading-2">Ultime pubblicazioni</h2>
                </div>
                <div className="space-y-6">
                  {featured.map((item) => (
                    <FeaturedCard key={item.id} item={item} />
                  ))}
                </div>
              </div>
            </section>
          )}

          {/* Sections by category */}
          <section className="section bg-muted/30">
            <div className="container-main">
              <div className="space-y-16">
                {SECTIONS.map(({ key, label, icon: Icon, description }) => {
                  const items = grouped[key]
                  if (items.length === 0) return null

                  return (
                    <div key={key}>
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                          <Icon size={20} className="text-primary" />
                        </div>
                        <h2 className="heading-2">{label}</h2>
                      </div>
                      <p className="text-gray-500 mb-8 ml-[52px]">{description}</p>

                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {items.map((item) => (
                          <NewsCard key={item.id} item={item} />
                        ))}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </section>
        </>
      )}
    </>
  )
}
