import { adminDb } from '@/lib/firebase/admin'
import { generatePageMetadata } from '@/lib/seo'
import type { Medico } from '@/types'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { PageHero } from '@/components/layout/PageHero'
import { getHeroConfig } from '@/lib/firebase/hero'

export const revalidate = 60
export const metadata = generatePageMetadata({
  title: 'I Nostri Medici',
  description: 'Scopri il team di medici specialisti del Centro Medico San Fedele a Longone al Segrino.',
  slug: 'medici',
})

async function getMedici(): Promise<Medico[]> {
  try {
    const snap = await adminDb.collection('medici').where('pubblicato', '==', true).get()
    return snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Medico, 'id'>) }))
  } catch {
    return []
  }
}

export default async function MediciPage() {
  const [medici, hero] = await Promise.all([getMedici(), getHeroConfig('medici')])

  return (
    <>
      <PageHero config={hero} />

      <section className="section bg-muted/30">
        <div className="container-main">
          {medici.length === 0 ? (
            <p className="text-center text-gray-400">Nessun medico disponibile al momento.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {medici.map((m) => (
                <Link
                  key={m.id}
                  href={`/medici/${m.slug}`}
                  className="group bg-white rounded-lg shadow-card border border-gray-100 hover:shadow-card-hover transition-all hover:-translate-y-1 overflow-hidden"
                >
                  {/* Photo header */}
                  <div className="relative h-48 bg-gradient-to-br from-primary/10 to-secondary/10">
                    {m.foto ? (
                      <Image
                        src={m.foto}
                        alt={m.nome}
                        fill
                        className="object-cover object-top"
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-24 h-24 rounded-full bg-white/80 flex items-center justify-center text-primary text-4xl font-bold shadow-card">
                          {m.nome.charAt(0)}
                        </div>
                      </div>
                    )}
                  </div>
                  {/* Info */}
                  <div className="p-6">
                    <h2 className="font-semibold text-text-main text-lg mb-2">{m.nome}</h2>
                    <p className="text-gray-500 text-sm leading-relaxed mb-4 line-clamp-3">{m.bio}</p>
                    <span className="inline-flex items-center gap-1 text-primary text-sm font-medium group-hover:gap-2 transition-all">
                      Visualizza profilo <ArrowRight size={14} />
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  )
}
