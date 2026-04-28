import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { adminDb } from '@/lib/firebase/admin'
import { generatePageMetadata } from '@/lib/seo'
import type { Patologia, Medico, Specialistica } from '@/types'
import { specialisticaHref } from '@/lib/utils'

export const revalidate = 3600

export async function generateStaticParams() {
  try {
    const snap = await adminDb.collection('patologie').get()
    return snap.docs.map((d) => ({ slug: d.data().slug as string }))
  } catch {
    return []
  }
}

async function getData(slug: string) {
  const patSnap = await adminDb.collection('patologie').where('slug', '==', slug).limit(1).get()
  if (patSnap.empty) return null

  const patDoc = patSnap.docs[0]
  const patologia: Patologia = { id: patDoc.id, ...(patDoc.data() as Omit<Patologia, 'id'>) }

  const [mediciSnap, specSnap] = await Promise.all([
    adminDb.collection('medici').where('pubblicato', '==', true).get(),
    patologia.specialisticaId
      ? adminDb.collection('specialistiche').doc(patologia.specialisticaId).get()
      : Promise.resolve(null),
  ])

  const medici: Medico[] = mediciSnap.docs
    .filter((d) => (d.data().patologieIds as string[])?.includes(patDoc.id))
    .map((d) => ({ id: d.id, ...(d.data() as Omit<Medico, 'id'>) }))

  const specialistica: Specialistica | null = specSnap && !('empty' in specSnap) && specSnap.exists
    ? { id: specSnap.id, ...(specSnap.data() as Omit<Specialistica, 'id'>) }
    : null

  return { patologia, medici, specialistica }
}

export async function generateMetadata({ params }: { params: { slug: string } }) {
  try {
    const data = await getData(params.slug)
    if (!data) return {}
    return generatePageMetadata({
      title: data.patologia.metaTitle || data.patologia.nome,
      description: data.patologia.metaDescription,
      slug: `patologie/${params.slug}`,
    })
  } catch {
    return {}
  }
}

export default async function PatologiaPage({ params }: { params: { slug: string } }) {
  const data = await getData(params.slug)
  if (!data) notFound()

  const { patologia, medici, specialistica } = data

  return (
    <div>
      {/* Hero with optional image */}
      <div className="relative bg-gradient-to-br from-primary/10 to-secondary/10 py-16">
        {patologia.immagine && (
          <div className="absolute inset-0 -z-10">
            <Image
              src={patologia.immagine}
              alt=""
              fill
              className="object-cover opacity-20"
            />
          </div>
        )}
        <div className="container-main">
          {specialistica && (
            <Link href={specialisticaHref(specialistica.slug)} className="text-primary text-sm hover:underline mb-2 inline-block">
              &larr; {specialistica.nome}
            </Link>
          )}
          <h1 className="heading-1 mb-4">{patologia.nome}</h1>
        </div>
      </div>

      <div className="section">
        <div className="container-main">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            <div className="lg:col-span-2">
              <div
                className="prose-content text-gray-600 leading-relaxed"
                dangerouslySetInnerHTML={{ __html: patologia.descrizione }}
              />
            </div>

            <div className="space-y-6">
              {medici.length > 0 && (
                <div className="glass-card">
                  <h3 className="font-semibold text-text-main mb-4">Medici Specialisti</h3>
                  <div className="space-y-3">
                    {medici.map((m) => (
                      <div key={m.id} className="flex items-center gap-3">
                        {m.foto ? (
                          <Image src={m.foto} alt={m.nome} width={40} height={40} className="rounded-full object-cover" />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                            {m.nome.charAt(0)}
                          </div>
                        )}
                        <Link href={`/medici/${m.slug}`} className="text-sm font-medium text-primary hover:underline">
                          {m.nome}
                        </Link>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              <Link href="/prenota" className="btn-primary block w-full text-center">
                Prenota una visita
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
