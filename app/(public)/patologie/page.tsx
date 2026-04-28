import { adminDb } from '@/lib/firebase/admin'
import { generatePageMetadata } from '@/lib/seo'
import type { Patologia, Specialistica } from '@/types'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowRight } from 'lucide-react'

export const revalidate = 3600
export const metadata = generatePageMetadata({
  title: 'Patologie',
  description: 'Informazioni sulle patologie trattate al Centro Medico San Fedele.',
  slug: 'patologie',
})

async function getData() {
  try {
    const [patSnap, specSnap] = await Promise.all([
      adminDb.collection('patologie').get(),
      adminDb.collection('specialistiche').where('pubblicata', '==', true).get(),
    ])
    const patologie: Patologia[] = patSnap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Patologia, 'id'>) }))
    const specialistiche: Specialistica[] = specSnap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Specialistica, 'id'>) }))
    return { patologie, specialistiche }
  } catch {
    return { patologie: [], specialistiche: [] }
  }
}

export default async function PatologiePage() {
  const { patologie, specialistiche } = await getData()

  const getSpec = (id: string) => specialistiche.find((s) => s.id === id)

  return (
    <>
      <section className="bg-gradient-to-br from-primary/10 via-bg to-secondary/10 py-20">
        <div className="container-main text-center">
          <h1 className="heading-1 mb-4">Patologie Trattate</h1>
          <p className="text-gray-500 text-xl max-w-2xl mx-auto">
            Approfondisci le patologie trattate dai nostri specialisti.
          </p>
        </div>
      </section>

      <div className="section">
        <div className="container-main">
          {patologie.length === 0 ? (
            <p className="text-center text-gray-400">Nessuna patologia disponibile al momento.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {patologie.map((p) => {
                const spec = getSpec(p.specialisticaId)
                return (
                  <Link
                    key={p.id}
                    href={`/patologie/${p.slug}`}
                    className="group block glass-card hover:shadow-card-hover transition-all hover:-translate-y-1"
                  >
                    {p.immagine ? (
                      <div className="relative w-full h-40 rounded-lg overflow-hidden mb-4 -mt-1 bg-bg-soft">
                        <Image src={p.immagine} alt={p.nome} fill className="object-contain p-2" sizes="(max-width: 768px) 100vw, 33vw" />
                      </div>
                    ) : spec ? (
                      <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-2xl mb-4">
                        {spec.icona}
                      </div>
                    ) : null}
                    {spec && (
                      <span className="text-xs font-medium text-primary bg-primary/10 px-3 py-1 rounded-full">
                        {spec.icona} {spec.nome}
                      </span>
                    )}
                    <h2 className="font-semibold text-text-main text-lg mt-3 mb-2">{p.nome}</h2>
                    <p className="text-gray-500 text-sm leading-relaxed line-clamp-3">
                      {p.descrizione?.replace(/<[^>]*>/g, '').substring(0, 120)}...
                    </p>
                    <span className="inline-flex items-center gap-1 text-primary text-sm font-medium mt-4 group-hover:gap-2 transition-all">
                      Scopri di più <ArrowRight size={14} />
                    </span>
                  </Link>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </>
  )
}
