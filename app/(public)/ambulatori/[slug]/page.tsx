import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { adminDb } from '@/lib/firebase/admin'
import { generatePageMetadata, generateSpecialtyJsonLd } from '@/lib/seo'
import type { Specialistica, Medico, Patologia } from '@/types'
import { ArrowRight } from 'lucide-react'
import { DoctorScroller } from '@/components/home/DoctorScroller'
import { SottoSpecialisticheSection } from '@/components/specialistiche/SottoSpecialisticheSection'

export const revalidate = 3600

export async function generateStaticParams() {
  try {
    const snap = await adminDb.collection('specialistiche').where('pubblicata', '==', true).get()
    return snap.docs
      .map((d) => d.data().slug as string)
      .filter((slug) => slug !== 'medicina-sportiva' && slug !== 'equipe-dsa')
      .map((slug) => ({ slug }))
  } catch {
    return []
  }
}

async function getData(slug: string) {
  const [specSnap, mediciSnap, patSnap] = await Promise.all([
    adminDb.collection('specialistiche').where('slug', '==', slug).limit(1).get(),
    adminDb.collection('medici').where('pubblicato', '==', true).get(),
    adminDb.collection('patologie').get(),
  ])

  if (specSnap.empty) return null

  const specDoc = specSnap.docs[0]
  const spec: Specialistica = { id: specDoc.id, ...(specDoc.data() as Omit<Specialistica, 'id'>) }

  // Bozza → non visibile sul sito pubblico
  if (!spec.pubblicata) return null

  const medici: Medico[] = mediciSnap.docs
    .filter((d) => (d.data().specialisticheIds as string[])?.includes(specDoc.id))
    .map((d) => ({ id: d.id, ...(d.data() as Omit<Medico, 'id'>) }))

  const patologie: Patologia[] = patSnap.docs
    .filter((d) => d.data().specialisticaId === specDoc.id)
    .map((d) => ({ id: d.id, ...(d.data() as Omit<Patologia, 'id'>) }))

  return { spec, medici, patologie }
}

export async function generateMetadata({ params }: { params: { slug: string } }) {
  try {
    const data = await getData(params.slug)
    if (!data) return {}
    return generatePageMetadata({
      title: data.spec.metaTitle || data.spec.nome,
      description: data.spec.metaDescription || data.spec.descrizioneBreve,
      slug: `ambulatori/${params.slug}`,
    })
  } catch {
    return {}
  }
}

export default async function SpecialisticaPage({ params }: { params: { slug: string } }) {
  if (params.slug === 'medicina-sportiva') redirect('/sport')
  if (params.slug === 'equipe-dsa') redirect('/dsa')
  const data = await getData(params.slug)
  if (!data) notFound()

  const { spec, medici, patologie } = data
  const jsonLd = generateSpecialtyJsonLd({ nome: spec.nome, descrizione: spec.descrizione, slug: spec.slug })

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      {/* Hero */}
      {spec.immagine ? (
        <div className="relative w-full aspect-[4/5] sm:aspect-[16/9] max-h-[80vh] overflow-hidden">
          <Image
            src={spec.immagine}
            alt=""
            fill
            priority
            className="object-cover object-center"
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
          <div className="absolute inset-x-0 bottom-0">
            <div className="container-main pb-8 md:pb-14">
              <span className="block h-1 w-10 rounded-full bg-white/80 mb-4 drop-shadow" />
              <h1 className="heading-1 !text-white drop-shadow-md">{spec.nome}</h1>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-gradient-to-br from-primary/10 to-secondary/10 py-16">
          <div className="container-main">
            <div className="text-5xl mb-4">{spec.icona}</div>
            <h1 className="heading-1 mb-4">{spec.nome}</h1>
            <p className="text-xl text-gray-500 max-w-2xl">{spec.descrizioneBreve}</p>
          </div>
        </div>
      )}

      <div className="section">
        <div className="container-main space-y-16">
          {/* Informazioni */}
          <div>
            <h2 className="heading-3 mb-4">Informazioni</h2>
            <div
              className="prose-content text-gray-600 leading-relaxed max-w-3xl"
              dangerouslySetInnerHTML={{ __html: spec.descrizione }}
            />
          </div>

          {/* Prestazioni e terapie (sotto-specialistiche) */}
          {spec.sottoSpecialistiche && spec.sottoSpecialistiche.length > 0 && (
            <SottoSpecialisticheSection
              sottoSpecialistiche={spec.sottoSpecialistiche}
              specSlug={spec.slug}
              specNome={spec.nome}
              icona={spec.icona}
            />
          )}

          {/* Patologie trattate */}
          {patologie.length > 0 && (
            <div>
              <h2 className="heading-3 mb-6">Patologie Trattate</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {patologie.map((p) => (
                  <Link
                    key={p.id}
                    href={`/patologie/${p.slug}`}
                    className="glass-card hover:shadow-card-hover transition-all hover:-translate-y-1 group"
                  >
                    {p.immagine && (
                      <div className="relative w-full h-32 rounded-lg overflow-hidden mb-3 -mt-1 bg-bg-soft">
                        <Image src={p.immagine} alt={p.nome} fill className="object-contain p-2" sizes="(max-width: 768px) 100vw, 33vw" />
                      </div>
                    )}
                    <h3 className="font-semibold text-text-main mb-1">{p.nome}</h3>
                    <p className="text-gray-500 text-sm line-clamp-2">
                      {p.descrizione?.replace(/<[^>]*>/g, '').substring(0, 100)}
                    </p>
                    <span className="inline-flex items-center gap-1 text-primary text-xs font-medium mt-2 group-hover:gap-2 transition-all">
                      Approfondisci <ArrowRight size={12} />
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Medici — horizontal scroller */}
          {medici.length > 0 && (
            <div>
              <h2 className="heading-3 mb-6">I Medici</h2>
              <DoctorScroller
                medici={medici.map((m) => ({
                  id: m.id,
                  nome: m.nome,
                  slug: m.slug,
                  foto: m.foto,
                }))}
              />
            </div>
          )}

          {/* Prenota CTA */}
          <div className="glass-card text-center">
            <h3 className="heading-3 mb-3">Prenota una visita</h3>
            <p className="text-gray-500 mb-6 max-w-lg mx-auto">
              I nostri specialisti sono a tua disposizione. Prenota una visita per {spec.nome.toLowerCase()}.
            </p>
            <Link href={`/prenota?specialistica=${spec.slug}`} className="btn-primary">
              Prenota ora
            </Link>
          </div>
        </div>
      </div>
    </>
  )
}
