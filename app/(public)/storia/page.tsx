import Image from 'next/image'
import { generatePageMetadata } from '@/lib/seo'
import { adminDb } from '@/lib/firebase/admin'
import type { StoriaEvento, Riconoscimento } from '@/types'
import { Award, ArrowRight } from 'lucide-react'
import { PageHero } from '@/components/layout/PageHero'
import Link from 'next/link'

export const revalidate = 60

export const metadata = generatePageMetadata({
  title: 'La Nostra Storia',
  description:
    'Scopri la storia del Centro Medico San Fedele: oltre 20 anni al servizio della salute a Longone al Segrino, in Provincia di Como.',
  slug: 'storia',
})

async function getData() {
  try {
    const [eventiSnap, ricSnap] = await Promise.all([
      adminDb.collection('storia_eventi').where('pubblicato', '==', true).orderBy('order', 'asc').get(),
      adminDb.collection('riconoscimenti').where('pubblicato', '==', true).get(),
    ])
    const eventi = eventiSnap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<StoriaEvento, 'id'>) }))
    const riconoscimenti = ricSnap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Riconoscimento, 'id'>) }))
    return { eventi, riconoscimenti }
  } catch (error) {
    console.error('[Storia] Failed to fetch:', error)
    return { eventi: [], riconoscimenti: [] }
  }
}

export default async function StoriaPage() {
  const { eventi, riconoscimenti } = await getData()

  return (
    <>
      <PageHero
        title="La nostra storia"
        label="Chi siamo"
        subtitle="Dal 2008 al fianco dei nostri pazienti. Un percorso di crescita, innovazione e dedizione alla cura della persona."
        imageSrc="/storia.jpg"
      />

      

      {/* Timeline — bento serpentina con anno tipografico */}
      {eventi.length > 0 && (
        <section className="relative section bg-gradient-to-b from-bg-soft via-white to-bg-soft overflow-hidden">
          {/* Decor bg dots */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 opacity-[0.04]"
            style={{
              backgroundImage:
                'radial-gradient(circle, var(--color-primary, #1A7BB5) 1px, transparent 1px)',
              backgroundSize: '32px 32px',
            }}
          />

          <div className="container-main relative">
            <div className="text-center mb-14 md:mb-20">
              <p className="text-primary uppercase text-xs tracking-widest font-bold mb-3">
                Il nostro percorso
              </p>
              <h2 className="text-3xl md:text-5xl font-extrabold text-text-main">
                Le tappe fondamentali
              </h2>
              <p className="text-text-main/60 text-base md:text-lg max-w-2xl mx-auto mt-4 font-medium">
                Ogni anno ha lasciato un segno. Scopri i momenti che hanno costruito il
                Centro Medico San Fedele.
              </p>
            </div>

            {/* Curva decorativa SVG — desktop only */}
            <div aria-hidden className="hidden lg:block absolute inset-x-0 top-72 bottom-32 pointer-events-none">
              <svg className="w-full h-full" preserveAspectRatio="none" viewBox="0 0 1000 1000">
                <path
                  d="M 200 0 Q 800 250, 200 500 T 200 1000"
                  fill="none"
                  stroke="url(#storiaGrad)"
                  strokeWidth="2"
                  strokeDasharray="6 10"
                  className="opacity-40"
                />
                <defs>
                  <linearGradient id="storiaGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--color-primary, #1A7BB5)" stopOpacity="0.6" />
                    <stop offset="100%" stopColor="var(--color-secondary, #5BBE49)" stopOpacity="0.4" />
                  </linearGradient>
                </defs>
              </svg>
            </div>

            <div className="relative max-w-6xl mx-auto space-y-20 md:space-y-28">
              {eventi.map((evento, index) => {
                const isLeft = index % 2 === 0
                return (
                  <article
                    key={evento.id}
                    className={`group relative grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-10 items-start ${
                      isLeft ? '' : 'md:[&>*:first-child]:order-2'
                    }`}
                  >
                    {/* Anno tipografico XL — col-span 5, allineato lato esterno, sticky su card lunghe */}
                    <div
                      className={`md:col-span-5 flex ${
                        isLeft ? 'md:justify-end md:text-right' : 'md:justify-start md:text-left'
                      } items-start`}
                    >
                      <div className="relative md:sticky md:top-28">
                        {/* Anno outline gigante — decor */}
                        <span
                          aria-hidden
                          className="select-none block text-[6rem] md:text-[10rem] leading-none font-black tracking-tighter"
                          style={{
                            WebkitTextStroke: '2px rgba(26,123,181,0.18)',
                            color: 'transparent',
                          }}
                        >
                          {evento.anno}
                        </span>
                        {/* Anno solid — sovrapposto, leggermente offset */}
                        <span
                          className={`absolute top-2 ${
                            isLeft ? 'right-3 md:right-4' : 'left-3 md:left-4'
                          } text-3xl md:text-5xl font-black text-primary drop-shadow-sm`}
                        >
                          {evento.anno}
                        </span>
                        {/* Pulsante decorativo per il "punto" della timeline */}
                        <span
                          aria-hidden
                          className={`hidden md:block absolute bottom-0 ${
                            isLeft ? 'right-0 translate-x-1/2' : 'left-0 -translate-x-1/2'
                          } w-3 h-3 rounded-full bg-primary ring-4 ring-primary/15`}
                        />
                      </div>
                    </div>

                    {/* Contenuto — col-span 7, immagine + testo bento */}
                    <div className="md:col-span-7">
                      <div
                        className={`relative bg-white/90 backdrop-blur rounded-2xl p-6 md:p-7 border border-primary/10 shadow-[0_8px_30px_-12px_rgba(26,123,181,0.18)] hover:shadow-[0_16px_40px_-12px_rgba(26,123,181,0.28)] hover:-translate-y-1 transition-all duration-300`}
                      >
                        {evento.immagine && (
                          <div className="relative w-full max-h-80 rounded-xl overflow-hidden mb-5 ring-1 ring-primary/10 bg-bg-soft flex items-center justify-center">
                            <Image
                              src={evento.immagine}
                              alt={evento.titolo}
                              width={1200}
                              height={800}
                              className="w-full h-auto max-h-80 object-contain transition-transform duration-700 group-hover:scale-[1.02]"
                              sizes="(max-width: 768px) 100vw, 520px"
                            />
                            {/* Anno badge mobile sopra immagine */}
                            <div className="md:hidden absolute top-3 left-3 bg-primary text-white text-xs font-black uppercase tracking-wider px-3 py-1.5 rounded-full shadow">
                              {evento.anno}
                            </div>
                          </div>
                        )}

                        {!evento.immagine && (
                          <div className="md:hidden inline-block bg-primary/10 text-primary text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full mb-3">
                            {evento.anno}
                          </div>
                        )}

                        <h3 className="text-xl md:text-2xl font-extrabold text-text-main mb-3 leading-tight group-hover:text-primary transition-colors">
                          {evento.titolo}
                        </h3>
                        <div
                          className="prose-content text-text-main/80 text-sm md:text-base max-w-none"
                          dangerouslySetInnerHTML={{ __html: evento.descrizione }}
                        />
                      </div>
                    </div>
                  </article>
                )
              })}
            </div>
          </div>
        </section>
      )}

      {/* Riconoscimenti — card grandi */}
      {riconoscimenti.length > 0 && (
        <section className="section bg-white">
          <div className="container-main">
            <div className="text-center mb-14">
              <p className="text-primary uppercase text-xs tracking-widest font-bold mb-3">
                Eccellenza riconosciuta
              </p>
              <h2 className="text-3xl md:text-5xl font-extrabold text-text-main mb-4">
                Riconoscimenti e premi
              </h2>
              <p className="text-text-main/60 text-lg md:text-xl max-w-2xl mx-auto font-medium">
                I traguardi che testimoniano il nostro impegno costante per l&apos;eccellenza.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {riconoscimenti.map((r) => (
                <div key={r.id} className="bg-bg-soft rounded-lg p-8 md:p-10 border border-primary/10 text-center hover:shadow-card-hover hover:-translate-y-1 transition-all">
                  <div className="w-20 h-20 rounded-full bg-primary/15 flex items-center justify-center mx-auto mb-5">
                    <Award size={32} className="text-primary" />
                  </div>
                  <p className="text-primary text-base font-black mb-2">{r.anno}</p>
                  <h3 className="font-extrabold text-text-main text-xl md:text-2xl mb-3 leading-tight">{r.titolo}</h3>
                  <p className="text-text-main/70 text-base leading-relaxed font-medium">{r.descrizione}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="relative py-20 md:py-24 overflow-hidden bg-bg-deep">
        <div className="container-main text-center relative">
          <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight text-text-main mb-5">Vieni a trovarci</h2>
          <p className="text-text-main/70 text-lg md:text-xl mb-10 max-w-xl mx-auto font-medium">
            Siamo a Longone al Segrino, in Provincia di Como. Prenota la tua visita o contattaci
            per informazioni.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/prenota" className="btn-primary inline-flex items-center gap-2 text-lg px-8 py-4">
              Prenota una visita <ArrowRight size={18} />
            </Link>
            <Link href="/contatti" className="btn-secondary text-lg px-8 py-4">
              Contatti e orari
            </Link>
          </div>
        </div>
      </section>
    </>
  )
}
