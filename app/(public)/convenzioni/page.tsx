import { adminDb } from '@/lib/firebase/admin'
import { generatePageMetadata } from '@/lib/seo'
import type { Convenzione } from '@/types'
import { PageHero } from '@/components/layout/PageHero'
import { ConvenzioniGrid } from '@/components/convenzioni/ConvenzioniGrid'

export const revalidate = 3600

export const metadata = generatePageMetadata({
  title: 'Convenzioni',
  description: 'Scopri le convenzioni attive presso il Centro Medico San Fedele. Assicurazioni, enti e aziende convenzionate.',
  slug: 'convenzioni',
})

async function getConvenzioni(): Promise<Convenzione[]> {
  try {
    const snap = await adminDb.collection('convenzioni').where('attiva', '==', true).get()
    return snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Convenzione, 'id'>) }))
  } catch {
    return []
  }
}

export default async function ConvenzioniPage() {
  const convenzioni = await getConvenzioni()

  return (
    <>
      <PageHero
        title="Convenzioni"
        label="Partner"
        subtitle="Grazie alle nostre convenzioni, le prestazioni sono più accessibili. Verifica se la tua assicurazione o il tuo ente è tra i nostri partner."
        imageSrc="/convenzioni.jpg"
      />

      <div className="section">
        <div className="container-main">
          {convenzioni.length === 0 ? (
            <p className="text-center text-gray-400">Nessuna convenzione disponibile al momento.</p>
          ) : (
            <ConvenzioniGrid convenzioni={convenzioni} />
          )}

          {/* CTA */}
          <div className="bg-white rounded-lg p-6 shadow-card border border-gray-100 text-center mt-16">
            <h3 className="heading-3 mb-3">Hai domande sulle convenzioni?</h3>
            <p className="text-gray-500 mb-6">
              Contattaci per verificare se il tuo ente o la tua assicurazione è convenzionata con noi.
            </p>
            <a href="tel:+390313333585" className="btn-primary">
              Chiama il 031 333 3585
            </a>
          </div>
        </div>
      </div>
    </>
  )
}
