import { adminDb } from '@/lib/firebase/admin'
import { generatePageMetadata } from '@/lib/seo'
import type { Medico, Specialistica } from '@/types'
import Image from 'next/image'
import Link from 'next/link'
import { DSASwitch } from '@/components/accessibility/DSASwitch'
import { DyslexiaSimulation } from '@/components/accessibility/DyslexiaSimulation'
import { PageHero } from '@/components/layout/PageHero'
import { getHeroConfig } from '@/lib/firebase/hero'
import { ArrowRight, CheckCircle2 } from 'lucide-react'

export const revalidate = 60
export const metadata = generatePageMetadata({
  title: 'Area DSA - Disturbi Specifici dell\'Apprendimento',
  description: 'Percorsi specializzati per la diagnosi e il supporto ai DSA. Centro Medico San Fedele, Longone al Segrino.',
  slug: 'dsa',
})

async function getDSAData(): Promise<{ spec: Specialistica | null; medici: Medico[] }> {
  try {
    // La specialistica può essere "equipe-dsa" o "dsa" — supportiamo entrambi
    const dsaSpecSnap = await adminDb.collection('specialistiche')
      .where('slug', 'in', ['equipe-dsa', 'dsa'])
      .get()

    const snap = await adminDb.collection('medici').where('pubblicato', '==', true).get()

    if (dsaSpecSnap.empty) return { spec: null, medici: [] }

    const specDoc = dsaSpecSnap.docs[0]
    const spec: Specialistica = { id: specDoc.id, ...(specDoc.data() as Omit<Specialistica, 'id'>) }
    const dsaSpecIds = dsaSpecSnap.docs.map((d) => d.id)

    const medici = snap.docs
      .filter((d) => {
        const ids = (d.data().specialisticheIds as string[]) || []
        return ids.some((id) => dsaSpecIds.includes(id))
      })
      .map((d) => ({ id: d.id, ...(d.data() as Omit<Medico, 'id'>) }))

    return { spec, medici }
  } catch {
    return { spec: null, medici: [] }
  }
}

export default async function DSAPage() {
  const [{ spec, medici }, hero] = await Promise.all([getDSAData(), getHeroConfig('dsa')])

  return (
    <>
      <PageHero config={hero} />

      {/* Accessibility toggle */}
      <section className="py-6 bg-white border-b border-gray-100">
        <div className="container-main flex justify-center">
          <div className="flex items-center gap-4 bg-secondary/5 rounded-lg px-6 py-3">
            <span className="text-sm text-gray-600 font-medium">Attiva modalità accessibile:</span>
            <DSASwitch />
          </div>
        </div>
      </section>

      {/* Cosa sono i DSA */}
      <section className="section bg-white">
        <div className="container-main">
          <div className="max-w-3xl mx-auto text-center mb-10">
            <p className="text-primary uppercase text-sm tracking-wide mb-2 font-medium">
              Comprendere i DSA
            </p>
            <h2 className="heading-2 mb-6">Cosa sono i Disturbi Specifici dell&apos;Apprendimento?</h2>
            {spec?.descrizione ? (
              <div
                className="prose-content text-gray-500 text-lg leading-relaxed text-left md:text-center"
                dangerouslySetInnerHTML={{ __html: spec.descrizione }}
              />
            ) : (
              <div className="text-gray-500 text-lg leading-relaxed space-y-4">
                <p>
                  I Disturbi Specifici dell&apos;Apprendimento (DSA) sono disturbi del neurosviluppo che
                  riguardano le abilità di lettura (<strong>dislessia</strong>), scrittura (<strong>disgrafia</strong> e <strong>disortografia</strong>)
                  e calcolo (<strong>discalculia</strong>). Non dipendono dall&apos;intelligenza, ma da una diversa
                  organizzazione neurologica.
                </p>
                <p>
                  Una diagnosi precoce e un supporto adeguato sono fondamentali per permettere
                  a bambini, ragazzi e adulti di esprimere il proprio potenziale e affrontare
                  il percorso scolastico e lavorativo con gli strumenti giusti.
                </p>
              </div>
            )}
          </div>

          {/* Simulazione dislessia */}
          <div className="max-w-4xl mx-auto mb-16">
            <DyslexiaSimulation />
          </div>

          {/* Services grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
            {[
              {
                icon: '🔍',
                title: 'Diagnosi',
                desc: 'Valutazione neuropsicologica completa secondo le linee guida nazionali.',
                details: [
                  'Colloquio clinico iniziale con la famiglia',
                  'Somministrazione di test standardizzati (lettura, scrittura, calcolo)',
                  'Valutazione cognitiva e delle funzioni esecutive',
                  'Relazione diagnostica per la scuola (L. 170/2010)',
                ],
              },
              {
                icon: '🎯',
                title: 'Trattamento',
                desc: 'Percorsi riabilitativi personalizzati con specialisti esperti.',
                details: [
                  'Piano di intervento individualizzato',
                  'Sedute di logopedia e neuropsicomotricità',
                  'Training sulle strategie compensative',
                  'Monitoraggio periodico dei progressi',
                ],
              },
              {
                icon: '👨‍👩‍👧',
                title: 'Supporto familiare',
                desc: 'Consulenza e sostegno per affrontare i DSA con serenità.',
                details: [
                  'Parent training: gestione quotidiana dei compiti',
                  'Consulenza scolastica per PDP e strumenti compensativi',
                  'Supporto psicologico per il bambino e la famiglia',
                  'Laboratori pratici e gruppi di confronto',
                ],
              },
            ].map((s) => (
              <div key={s.title} className="bg-white rounded-lg p-6 shadow-card border border-gray-100">
                <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center text-3xl mb-4">
                  {s.icon}
                </div>
                <h3 className="font-semibold text-text-main text-lg mb-2">{s.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed mb-4">{s.desc}</p>
                <ul className="space-y-2">
                  {s.details.map((d) => (
                    <li key={d} className="flex items-start gap-2 text-sm text-gray-600">
                      <CheckCircle2 size={16} className="text-secondary mt-0.5 flex-shrink-0" />
                      <span>{d}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Come funziona il percorso */}
      <section className="section bg-muted/50">
        <div className="container-main">
          <div className="text-center mb-12">
            <p className="text-primary uppercase text-sm tracking-wide mb-2 font-medium">
              Il percorso
            </p>
            <h2 className="heading-2 mb-4">Come funziona?</h2>
            <p className="text-gray-500 text-lg max-w-2xl mx-auto">
              Un percorso strutturato e personalizzato, dalla prima valutazione all&apos;intervento.
            </p>
          </div>

          <div className="max-w-3xl mx-auto">
            <div className="space-y-0">
              {[
                {
                  step: '1',
                  title: 'Primo contatto',
                  desc: 'Ci contatti telefonicamente o tramite il form online. Il nostro team ti guiderà nella scelta dello specialista più adatto.',
                },
                {
                  step: '2',
                  title: 'Valutazione iniziale',
                  desc: 'Colloquio con i genitori e primo incontro con il bambino per raccogliere la storia clinica e scolastica.',
                },
                {
                  step: '3',
                  title: 'Testing diagnostico',
                  desc: 'Somministrazione di batterie di test standardizzati su lettura, scrittura, calcolo e funzioni cognitive. Durata: 2-3 incontri.',
                },
                {
                  step: '4',
                  title: 'Restituzione e relazione',
                  desc: 'Colloquio di restituzione con la famiglia, consegna della relazione clinica valida ai sensi della Legge 170/2010 per la richiesta del PDP a scuola.',
                },
                {
                  step: '5',
                  title: 'Intervento e follow-up',
                  desc: 'Se necessario, avvio del percorso riabilitativo personalizzato con monitoraggio periodico dei progressi.',
                },
              ].map((item, i, arr) => (
                <div key={item.step} className="flex gap-5">
                  <div className="flex flex-col items-center">
                    <div className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center font-bold text-sm flex-shrink-0">
                      {item.step}
                    </div>
                    {i < arr.length - 1 && (
                      <div className="w-0.5 flex-1 bg-primary/20 my-1" />
                    )}
                  </div>
                  <div className="pb-8">
                    <h3 className="font-semibold text-text-main text-lg mb-1">{item.title}</h3>
                    <p className="text-gray-500 text-sm leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Medici */}
      {medici.length > 0 && (
        <section className="section bg-white">
          <div className="container-main">
            <div className="text-center mb-10">
              <p className="text-primary uppercase text-sm tracking-wide mb-2 font-medium">
                Il team
              </p>
              <h2 className="heading-2 mb-4">I Nostri Specialisti DSA</h2>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-5 md:gap-6">
              {medici.map((m) => (
                <Link key={m.id} href={`/medici/${m.slug}`} className="group bg-white rounded-lg p-3 sm:p-5 shadow-card border border-gray-100 text-center hover:shadow-card-hover transition-all hover:-translate-y-1">
                  {m.foto ? (
                    <Image
                      src={m.foto}
                      alt={m.nome}
                      width={80}
                      height={80}
                      className="rounded-full object-cover mx-auto mb-2 sm:mb-3 ring-2 ring-primary/20 group-hover:ring-primary/40 transition-all w-14 h-14 sm:w-20 sm:h-20"
                    />
                  ) : (
                    <div className="w-14 h-14 sm:w-20 sm:h-20 rounded-full bg-primary/10 flex items-center justify-center text-primary text-2xl sm:text-3xl font-bold mx-auto mb-2 sm:mb-3">
                      {m.nome.charAt(0)}
                    </div>
                  )}
                  <h3 className="font-semibold text-text-main text-xs sm:text-sm leading-tight">{m.nome}</h3>
                  {m.mansione && (
                    <p className="text-[10px] sm:text-xs text-text-main/60 mt-1 line-clamp-2">{m.mansione}</p>
                  )}
                  <span className="hidden sm:block text-primary text-xs font-medium group-hover:underline mt-2">
                    Vedi profilo →
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="relative py-12 md:py-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary to-primary-dark" />
        <div className="container-main text-center relative">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-light tracking-tight text-white mb-3 sm:mb-4">Prenota una valutazione</h2>
          <p className="text-white/80 text-base sm:text-lg mb-6 sm:mb-8 max-w-xl mx-auto">
            Il percorso inizia con una valutazione specialistica. I nostri esperti ti guideranno in ogni fase.
          </p>
          <Link href="/prenota?specialistica=equipe-dsa" className="bg-white text-primary font-medium px-6 sm:px-8 py-3 rounded-sm hover:bg-gray-50 transition-colors inline-flex items-center gap-2 text-base sm:text-lg min-h-[44px]">
            Prenota adesso <ArrowRight size={18} />
          </Link>
        </div>
      </section>
    </>
  )
}
