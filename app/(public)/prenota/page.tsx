import { Suspense } from 'react'
import { adminDb } from '@/lib/firebase/admin'
import { generatePageMetadata } from '@/lib/seo'
import { PrenotaForm } from '@/components/prenota/PrenotaForm'

export const metadata = generatePageMetadata({
  title: 'Prenota una Visita',
  description: 'Prenota facilmente la tua visita medica al Centro Medico San Fedele.',
  slug: 'prenota',
})

async function getData() {
  try {
    const [specSnap, mediciSnap] = await Promise.all([
      adminDb.collection('specialistiche').where('pubblicata', '==', true).get(),
      adminDb.collection('medici').where('pubblicato', '==', true).get(),
    ])

    const specialistiche = specSnap.docs
      .map((d) => {
        const data = d.data()
        return {
          id: d.id,
          nome: data.nome as string,
          slug: data.slug as string,
          icona: data.icona as string,
          order: (data.order ?? 999) as number,
          sottoSpecialistiche: (data.sottoSpecialistiche || []) as {
            id: string
            nome: string
          }[],
        }
      })
      .sort((a, b) => a.order - b.order)

    const medici = mediciSnap.docs.map((d) => {
      const data = d.data()
      return {
        id: d.id,
        nome: data.nome as string,
        slug: data.slug as string,
        specialisticheIds: (data.specialisticheIds || []) as string[],
        sottoSpecialisticheIds: (data.sottoSpecialisticheIds || []) as string[],
        suChiamata: (data.suChiamata ?? false) as boolean,
      }
    })

    return { specialistiche, medici }
  } catch {
    return { specialistiche: [], medici: [] }
  }
}

export default async function PrenotaPage() {
  const { specialistiche, medici } = await getData()

  return (
    <div className="section">
      <div className="container-main">
        <div className="text-center mb-12">
          <h1 className="heading-1 mb-4">Prenota la tua visita</h1>
          <p className="text-gray-500 text-xl max-w-xl mx-auto">
            Pochi semplici passi per prenotare. Ti contatteremo entro 24 ore per confermare.
          </p>
        </div>
        <Suspense fallback={<div className="text-center py-12 text-gray-400">Caricamento...</div>}>
          <PrenotaForm specialistiche={specialistiche} medici={medici} />
        </Suspense>
      </div>
    </div>
  )
}
