import { ReviewsSlider } from '@/components/home/ReviewsSlider'
import { ConvenzioniScroller } from '@/components/home/ConvenzioniScroller'
import { DoctorScroller } from '@/components/home/DoctorScroller'
import { HomeContactForm } from '@/components/home/HomeContactForm'
import { HomeHeroZoom } from '@/components/home/HomeHeroZoom'
import { SpecialtySearchGrid } from '@/components/home/SpecialtySearchGrid'
import { MelaButton } from '@/components/ui/MelaButton'
import { generatePageMetadata } from '@/lib/seo'
import { adminDb } from '@/lib/firebase/admin'
import type { Specialistica, Convenzione, Medico, Patologia } from '@/types'

export const revalidate = 3600

export const metadata = generatePageMetadata({})

async function getHomeData() {
  try {
    const [specSnap, reviewsSnap, convSnap, mediciSnap, patSnap] = await Promise.all([
      adminDb.collection('specialistiche').where('pubblicata', '==', true).get(),
      adminDb.collection('recensioni_statiche').orderBy('data', 'desc').limit(6).get(),
      adminDb.collection('convenzioni').where('attiva', '==', true).get(),
      adminDb.collection('medici').where('pubblicato', '==', true).get(),
      adminDb.collection('patologie').get(),
    ])

    const specialistiche: Specialistica[] = specSnap.docs
      .map((d) => ({ id: d.id, ...(d.data() as Omit<Specialistica, 'id'>) }))
      .sort((a, b) => (a.order ?? 999) - (b.order ?? 999))

    const reviews = reviewsSnap.docs.map((d) => ({
      autore: d.data().autore as string,
      testo: d.data().testo as string,
      stelle: d.data().stelle as number,
      data: d.data().data as string,
      fonte: d.data().fonte as 'google' | 'editoriale',
    }))

    const convenzioni: Convenzione[] = convSnap.docs.map((d) => ({
      id: d.id,
      ...(d.data() as Omit<Convenzione, 'id'>),
    }))

    const medici: Medico[] = mediciSnap.docs.map((d) => ({
      id: d.id,
      ...(d.data() as Omit<Medico, 'id'>),
    }))

    const patologie: Patologia[] = patSnap.docs.map((d) => ({
      id: d.id,
      ...(d.data() as Omit<Patologia, 'id'>),
    }))

    return { specialistiche, reviews, convenzioni, medici, patologie }
  } catch {
    return { specialistiche: [], reviews: [], convenzioni: [], medici: [], patologie: [] }
  }
}

export default async function HomePage() {
  const { specialistiche, reviews, convenzioni, medici, patologie } = await getHomeData()

  return (
    <>
      {/* 1. Hero scroll-reveal: bg pulito → titolo → bottoni */}
      <HomeHeroZoom />

      {/* 3. Convenzioni scroller infinito */}
      {convenzioni.length > 0 && (
        <section className="py-12 bg-white border-y border-bg-soft overflow-hidden">
          <div className="container-main mb-8">
            <p className="text-center text-xs font-bold text-primary uppercase tracking-widest mb-2">
              Convenzioni &amp; Partner
            </p>
            <h2 className="text-center text-2xl md:text-3xl font-light text-text-main">
              Lavoriamo con i principali enti assicurativi
            </h2>
          </div>
          <ConvenzioniScroller convenzioni={convenzioni} />
          <div className="flex justify-center mt-12 md:mt-16">
            <MelaButton href="/convenzioni" mela="welcome">
              Scopri i nostri partner
            </MelaButton>
          </div>
        </section>
      )}

      {/* 4. Specialistiche con search bar */}
      {specialistiche.length > 0 && (
        <section className="section bg-bg-soft">
          <div className="container-main">
            <div className="text-center mb-10">
              <p className="text-primary uppercase text-xs tracking-widest font-bold mb-2">
                I nostri servizi
              </p>
              <h2 className="heading-2 mb-4">Le nostre specialistiche</h2>
              <p className="text-text-main/60 text-lg max-w-2xl mx-auto">
                Un centro multidisciplinare con specialisti dedicati per ogni area della salute.
              </p>
            </div>
            <SpecialtySearchGrid specialistiche={specialistiche} patologie={patologie} />
          </div>
        </section>
      )}

      {/* 5. Medici */}
      {medici.length > 0 && (
        <section className="py-16 bg-white">
          <div className="container-main">
            <div className="text-center mb-10">
              <p className="text-primary uppercase text-xs tracking-widest font-bold mb-2">
                Il team
              </p>
              <h2 className="heading-2">I nostri specialisti</h2>
            </div>
            <DoctorScroller
              medici={medici.map((m) => ({
                id: m.id,
                nome: m.nome,
                slug: m.slug,
                foto: m.foto,
              }))}
            />
            <div className="flex justify-center mt-12 md:mt-16">
              <MelaButton
                href="/medici"
                mela="indica"
                melaPosition="left"
                showArrow={true}
              >
                Tutti i medici
              </MelaButton>
            </div>
          </div>
        </section>
      )}

      {/* 6. Storia — bg azzurrino scuro che stacca */}
      <section className="section bg-bg-deep">
        <div className="container-main">
          <div className="flex flex-col md:flex-row items-center gap-12">
            <div className="flex-1">
              <p className="text-primary-dark uppercase text-xs tracking-widest font-bold mb-2">
                La nostra storia
              </p>
              <h2 className="heading-2 mb-4 text-text-main">Oltre 20 anni al servizio della salute</h2>
              <p className="text-text-main/70 leading-relaxed mb-6 text-lg">
                Nati a Longone al Segrino nel 2008, siamo cresciuti per diventare un punto di
                riferimento nella Provincia di Como per la cura e il benessere della persona.
              </p>
              <div className="mt-2">
                <MelaButton
                  href="/storia"
                  mela="indica"
                  melaPosition="right"
                  showArrow={false}
                >
                  Scopri la nostra storia
                </MelaButton>
              </div>
            </div>
            <div className="flex-shrink-0 grid grid-cols-2 gap-4 md:gap-6">
              <div className="bg-white rounded-lg p-6 text-center shadow-card">
                <div className="text-4xl font-black text-primary">20+</div>
                <div className="text-sm text-text-main/60 mt-1 font-medium">Anni di esperienza</div>
              </div>
              <div className="bg-white rounded-lg p-6 text-center shadow-card mt-6">
                <div className="text-4xl font-black text-primary">12</div>
                <div className="text-sm text-text-main/60 mt-1 font-medium">Medici specialisti</div>
              </div>
              <div className="bg-white rounded-lg p-6 text-center shadow-card">
                <div className="text-4xl font-black text-primary">6</div>
                <div className="text-sm text-text-main/60 mt-1 font-medium">Specialistiche</div>
              </div>
              <div className="bg-white rounded-lg p-6 text-center shadow-card mt-6">
                <div className="text-4xl font-black text-primary">98%</div>
                <div className="text-sm text-text-main/60 mt-1 font-medium">Soddisfazione</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 7. Recensioni — cosa dicono di noi */}
      {reviews.length > 0 && (
        <section className="section bg-white">
          <div className="container-main">
            <div className="text-center mb-12">
              <p className="text-primary uppercase text-xs tracking-widest font-bold mb-2">
                Testimonianze
              </p>
              <h2 className="heading-2 mb-4">Cosa dicono di noi</h2>
              <p className="text-text-main/60 text-lg">
                La soddisfazione dei pazienti è la nostra ricompensa più grande.
              </p>
            </div>
            <ReviewsSlider reviews={reviews} />
          </div>
        </section>
      )}

      {/* 8. Modulo contatto — bottom of page */}
      <section className="section bg-gradient-to-br from-bg-soft via-white to-bg-soft">
        <div className="container-main max-w-3xl">
          <div className="text-center mb-10">
            <p className="text-primary uppercase text-xs tracking-widest font-bold mb-2">
              Modulo contatto
            </p>
            <h2 className="heading-2 mb-4">Contattaci subito</h2>
            <p className="text-text-main/60 text-lg max-w-xl mx-auto">
              Compila il modulo e ti risponderemo il prima possibile.
            </p>
          </div>
          <div className="bg-white rounded-2xl shadow-card-hover border border-primary/10 p-6 md:p-10">
            <HomeContactForm
              specialistiche={specialistiche.map((s) => ({ id: s.id, nome: s.nome }))}
              embedded
            />
          </div>
        </div>
      </section>
    </>
  )
}
