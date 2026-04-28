import { adminDb } from '@/lib/firebase/admin'
import { generatePageMetadata } from '@/lib/seo'
import type { Medico, StoriaEvento, Specialistica, Patologia } from '@/types'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

export const revalidate = 3600
export const metadata = generatePageMetadata({
  title: 'Medicina Sportiva - Certificazioni e Valutazioni',
  description: 'Certificazioni medico-sportive agonistiche e non agonistiche, valutazione funzionale e nutrizione sportiva. Centro Medico San Fedele, Longone al Segrino.',
  slug: 'sport',
})

async function getStoriaSportiva(): Promise<StoriaEvento[]> {
  try {
    // Try composite where: pubblicato + sportivo
    const snap = await adminDb
      .collection('storia_eventi')
      .where('pubblicato', '==', true)
      .where('sportivo', '==', true)
      .get()
    const eventi = snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<StoriaEvento, 'id'>) }))
    eventi.sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
    return eventi
  } catch {
    // Fallback: filter in memory (in case composite index missing)
    try {
      const snap = await adminDb.collection('storia_eventi').where('pubblicato', '==', true).get()
      const eventi = snap.docs
        .map((d) => ({ id: d.id, ...(d.data() as Omit<StoriaEvento, 'id'>) }))
        .filter((e) => e.sportivo === true)
      eventi.sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
      return eventi
    } catch {
      return []
    }
  }
}

async function getSpecialisticaSport(): Promise<{
  spec: Specialistica | null
  medici: Medico[]
  patologie: Patologia[]
}> {
  try {
    const specSnap = await adminDb
      .collection('specialistiche')
      .where('slug', '==', 'medicina-sportiva')
      .limit(1)
      .get()
    if (specSnap.empty) return { spec: null, medici: [], patologie: [] }
    const specDoc = specSnap.docs[0]
    const spec: Specialistica = { id: specDoc.id, ...(specDoc.data() as Omit<Specialistica, 'id'>) }

    const [mediciSnap, patSnap] = await Promise.all([
      adminDb.collection('medici').where('pubblicato', '==', true).get(),
      adminDb.collection('patologie').get(),
    ])

    const medici: Medico[] = mediciSnap.docs
      .filter((d) => (d.data().specialisticheIds as string[])?.includes(specDoc.id))
      .map((d) => ({ id: d.id, ...(d.data() as Omit<Medico, 'id'>) }))

    const patologie: Patologia[] = patSnap.docs
      .filter((d) => d.data().specialisticaId === specDoc.id)
      .map((d) => ({ id: d.id, ...(d.data() as Omit<Patologia, 'id'>) }))

    return { spec, medici, patologie }
  } catch {
    return { spec: null, medici: [], patologie: [] }
  }
}

const SERVICES = [
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-10 h-10">
        <path d="M9 12h6m-3-3v6m-7 4h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    title: 'Certificazioni medico-sportive',
    desc: 'Visite di idoneita agonistica e non agonistica, complete di ECG e valutazione clinica secondo le normative vigenti.',
    tag: 'Agonistica & Non',
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-10 h-10">
        <path d="M3.5 12h2l3-9 4 18 3-9h2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    title: 'Valutazione funzionale',
    desc: 'Test da sforzo, ECG sotto sforzo e spirometria per monitorare performance cardiovascolari e respiratorie.',
    tag: 'Performance',
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-10 h-10">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    title: 'Nutrizione sportiva',
    desc: 'Piani alimentari personalizzati per atleti, studiati per ottimizzare prestazioni, recupero e benessere.',
    tag: 'Nutrizione',
  },
]

const STATS = [
  { value: '500+', label: 'Certificazioni/anno' },
  { value: '98%', label: 'Soddisfazione' },
  { value: '15+', label: 'Discipline sportive' },
  { value: '48h', label: 'Referto medio' },
]

export default async function SportPage() {
  const [storiaSportiva, specSport] = await Promise.all([
    getStoriaSportiva(),
    getSpecialisticaSport(),
  ])
  const medici = specSport.medici.slice(0, 4)

  return (
    <div className="bg-slate-950 text-white">
      {/* Hero — gradient energizzante */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-slate-900 to-emerald-950" />
        <div className="absolute inset-0 opacity-[0.07]" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%2310b981\' fill-opacity=\'1\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")' }} />

        <div className="relative container-main py-24 md:py-32">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 rounded-full px-4 py-1.5 mb-6">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-emerald-400 text-sm font-semibold tracking-wider uppercase">Centro Medico San Fedele</span>
            </div>
            <h1 className="text-5xl md:text-7xl font-black tracking-tight mb-6">
              Medicina<br />
              <span className="bg-gradient-to-r from-emerald-400 via-green-400 to-teal-400 bg-clip-text text-transparent">
                Sportiva
              </span>
            </h1>
            <p className="text-lg md:text-xl text-slate-400 max-w-2xl leading-relaxed mb-8">
              Certificazioni medico-sportive, valutazioni funzionali e supporto nutrizionale
              per atleti di ogni livello. La tua performance inizia dalla salute.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link
                href="/prenota"
                className="inline-flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold px-8 py-4 rounded-lg transition-all hover:shadow-lg hover:shadow-emerald-500/25 text-lg"
              >
                Prenota visita
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-5 h-5">
                  <path d="M13 7l5 5m0 0l-5 5m5-5H6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </Link>
              <a
                href="#servizi"
                className="inline-flex items-center gap-2 border border-slate-700 hover:border-slate-500 text-slate-300 hover:text-white px-8 py-4 rounded-lg transition-all text-lg"
              >
                Scopri i servizi
              </a>
            </div>
          </div>
        </div>

        {/* Decorative element */}
        <div className="absolute -right-32 top-1/2 -translate-y-1/2 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl" />
        <div className="absolute -left-16 -bottom-16 w-64 h-64 bg-teal-500/5 rounded-full blur-3xl" />
      </section>

      {/* Stats bar */}
      <section className="border-y border-slate-800 bg-slate-900/50">
        <div className="container-main py-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {STATS.map((s) => (
              <div key={s.label} className="text-center">
                <div className="text-3xl md:text-4xl font-black text-emerald-400">{s.value}</div>
                <div className="text-sm text-slate-500 mt-1 font-medium">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Services */}
      <section id="servizi" className="section">
        <div className="container-main">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">I Nostri Servizi</h2>
            <p className="text-slate-400 max-w-2xl mx-auto">
              Un approccio integrato alla medicina sportiva, combinando competenze mediche
              specialistiche con tecnologie diagnostiche all&apos;avanguardia.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {SERVICES.map((s) => (
              <div
                key={s.title}
                className="group relative bg-slate-900 border border-slate-800 rounded-2xl p-8 hover:border-emerald-500/30 transition-all duration-300 hover:shadow-lg hover:shadow-emerald-500/5"
              >
                <div className="absolute top-4 right-4">
                  <span className="text-[10px] font-bold tracking-widest uppercase text-emerald-500/60 bg-emerald-500/10 px-2 py-1 rounded">
                    {s.tag}
                  </span>
                </div>
                <div className="text-emerald-400 mb-6 group-hover:scale-110 transition-transform duration-300">
                  {s.icon}
                </div>
                <h3 className="font-bold text-lg mb-3">{s.title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      

      {/* Why us */}
      <section className="section bg-slate-900/30">
        <div className="container-main">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <span className="text-emerald-400 text-sm font-bold tracking-wider uppercase mb-3 block">Il nostro approccio</span>
              <h2 className="text-3xl md:text-4xl font-bold mb-6">
                Perche scegliere noi?
              </h2>
              <div className="space-y-4 text-slate-400 leading-relaxed">
                <p>
                  Il Centro Medico San Fedele offre un approccio integrato alla medicina sportiva,
                  combinando competenze mediche specialistiche con tecnologie diagnostiche avanzate.
                </p>
                <p>
                  Che tu sia un atleta professionista o un amatore, il nostro team ti accompagna
                  nella prevenzione degli infortuni, nel monitoraggio della salute cardiovascolare
                  e nell&apos;ottimizzazione delle prestazioni.
                </p>
              </div>
              <div className="mt-8 space-y-3">
                {[
                  'Apparecchiature diagnostiche di ultima generazione',
                  'Team multidisciplinare dedicato',
                  'Percorsi personalizzati per ogni disciplina',
                  'Refertazione rapida entro 48 ore',
                ].map((item) => (
                  <div key={item} className="flex items-center gap-3">
                    <div className="w-5 h-5 rounded-full bg-emerald-500/20 flex items-center justify-center flex-shrink-0">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="w-3 h-3 text-emerald-400">
                        <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </div>
                    <span className="text-slate-300 text-sm">{item}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="relative">
              <div className="aspect-square rounded-2xl bg-gradient-to-br from-emerald-500/10 to-teal-500/10 border border-slate-800 flex items-center justify-center">
                <div className="text-center p-8">
                  <div className="text-8xl mb-4 opacity-20">&#9878;</div>
                  <p className="text-slate-500 text-sm">La tua salute sportiva, la nostra missione</p>
                </div>
              </div>
              <div className="absolute -bottom-4 -right-4 w-32 h-32 bg-emerald-500/10 rounded-2xl blur-xl" />
            </div>
          </div>
        </div>
      </section>

      {/* Medici */}
      {medici.length > 0 && (
        <section className="section">
          <div className="container-main">
            <div className="text-center mb-12">
              <span className="text-emerald-400 text-sm font-bold tracking-wider uppercase mb-3 block">Il Team</span>
              <h2 className="text-3xl md:text-4xl font-bold">I Nostri Specialisti</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
              {medici.map((m) => (
                <Link
                  key={m.id}
                  href={`/medici/${m.slug}`}
                  className="group bg-slate-900 border border-slate-800 rounded-2xl p-6 text-center hover:border-emerald-500/30 transition-all duration-300"
                >
                  {m.foto ? (
                    <Image
                      src={m.foto}
                      alt={m.nome}
                      width={80}
                      height={80}
                      className="rounded-full object-cover mx-auto mb-4 ring-2 ring-slate-800 group-hover:ring-emerald-500/30 transition-all"
                    />
                  ) : (
                    <div className="w-20 h-20 rounded-full bg-gradient-to-br from-emerald-500/20 to-teal-500/20 flex items-center justify-center text-emerald-400 text-2xl font-bold mx-auto mb-4 ring-2 ring-slate-800 group-hover:ring-emerald-500/30 transition-all">
                      {m.nome.charAt(0)}
                    </div>
                  )}
                  <h3 className="font-semibold text-sm mb-1">{m.nome}</h3>
                  <span className="text-emerald-400 text-xs group-hover:underline">
                    Vedi profilo &rarr;
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Info specialistica medicina sportiva */}
      {specSport.spec && (
        <section className="relative overflow-hidden">
          {/* Ambient glow */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-emerald-500/5 rounded-full blur-3xl" />
            <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-teal-500/5 rounded-full blur-3xl" />
          </div>

          <div className="relative container-main py-20 md:py-28">
            {/* Header */}
            <div className="text-center max-w-3xl mx-auto mb-16">
              <div className="inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 rounded-full px-4 py-1.5 mb-6">
                <span className="text-2xl">{specSport.spec.icona}</span>
                <span className="text-emerald-400 text-sm font-semibold tracking-wider uppercase">
                  Dettaglio specialistica
                </span>
              </div>
              <h2 className="text-4xl md:text-5xl font-black tracking-tight mb-6">
                <span className="bg-gradient-to-r from-white via-emerald-100 to-white bg-clip-text text-transparent">
                  {specSport.spec.nome}
                </span>
              </h2>
              <p className="text-slate-400 text-lg md:text-xl leading-relaxed">
                {specSport.spec.descrizioneBreve}
              </p>
            </div>

            {/* Descrizione completa */}
            {specSport.spec.descrizione && (
              <div className="max-w-3xl mx-auto mb-20">
                <div className="relative bg-slate-900/60 backdrop-blur-sm border border-slate-800 rounded-2xl p-8 md:p-10">
                  <div className="absolute -top-px left-8 right-8 h-px bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent" />
                  <div
                    className="prose prose-invert prose-slate max-w-none text-slate-300 prose-headings:text-white prose-strong:text-white prose-a:text-emerald-400"
                    dangerouslySetInnerHTML={{ __html: specSport.spec.descrizione }}
                  />
                </div>
              </div>
            )}

            {/* Sotto-specialistiche */}
            {specSport.spec.sottoSpecialistiche && specSport.spec.sottoSpecialistiche.length > 0 && (
              <div className="mb-20">
                <div className="flex items-end justify-between mb-8 flex-wrap gap-4">
                  <div>
                    <span className="text-emerald-400 text-xs font-bold tracking-widest uppercase mb-2 block">
                      Il nostro know-how
                    </span>
                    <h3 className="text-2xl md:text-3xl font-bold text-white">Aree di competenza</h3>
                  </div>
                  <div className="text-sm text-slate-500">
                    {specSport.spec.sottoSpecialistiche.length} aree disponibili
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {specSport.spec.sottoSpecialistiche.map((sotto, i) => {
                    const mediciSotto = specSport.medici.filter((m) =>
                      (m.sottoSpecialisticheIds || []).includes(sotto.id)
                    )
                    return (
                      <div
                        key={sotto.id}
                        className="group relative bg-gradient-to-br from-slate-900 to-slate-900/50 border border-slate-800 rounded-2xl p-6 hover:border-emerald-500/40 hover:shadow-xl hover:shadow-emerald-500/5 transition-all duration-300 overflow-hidden"
                      >
                        <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-2xl group-hover:bg-emerald-500/10 transition-colors" />
                        <div className="absolute top-4 right-4 text-[11px] font-bold text-emerald-500/40 tracking-widest">
                          {String(i + 1).padStart(2, '0')}
                        </div>

                        <div className="relative">
                          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center mb-4 group-hover:bg-emerald-500/20 transition-colors">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5 text-emerald-400">
                              <path d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                          </div>

                          <h4 className="font-bold text-white text-lg mb-3 leading-snug">{sotto.nome}</h4>

                          {mediciSotto.length > 0 ? (
                            <div className="space-y-2 pt-3 border-t border-slate-800">
                              <p className="text-[11px] text-slate-500 uppercase tracking-wider font-semibold">Medici dedicati</p>
                              <div className="flex flex-wrap gap-1.5">
                                {mediciSotto.map((m) => (
                                  <Link
                                    key={m.id}
                                    href={`/medici/${m.slug}`}
                                    className="text-xs text-emerald-400 bg-emerald-500/5 hover:bg-emerald-500/15 px-2.5 py-1 rounded-full border border-emerald-500/15 hover:border-emerald-500/40 transition-all"
                                  >
                                    {m.nome}
                                  </Link>
                                ))}
                              </div>
                            </div>
                          ) : (
                            <p className="text-xs text-slate-600 italic pt-3 border-t border-slate-800">
                              Medici in assegnazione
                            </p>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Patologie trattate */}
            {specSport.patologie.length > 0 && (
              <div>
                <div className="flex items-end justify-between mb-8 flex-wrap gap-4">
                  <div>
                    <span className="text-emerald-400 text-xs font-bold tracking-widest uppercase mb-2 block">
                      Casistiche cliniche
                    </span>
                    <h3 className="text-2xl md:text-3xl font-bold text-white">Patologie trattate</h3>
                  </div>
                  <Link
                    href="/patologie"
                    className="inline-flex items-center gap-1.5 text-emerald-400 text-sm font-semibold hover:gap-3 transition-all"
                  >
                    Vedi tutte <ArrowRight size={14} />
                  </Link>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  {specSport.patologie.map((p) => (
                    <Link
                      key={p.id}
                      href={`/patologie/${p.slug}`}
                      className="group relative bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden hover:border-emerald-500/40 hover:shadow-xl hover:shadow-emerald-500/5 transition-all duration-300"
                    >
                      {p.immagine ? (
                        <div className="relative w-full aspect-[16/10] overflow-hidden bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center">
                          <Image
                            src={p.immagine}
                            alt={p.nome}
                            fill
                            className="object-contain p-4 group-hover:scale-105 transition-transform duration-500"
                            sizes="(max-width: 768px) 100vw, 33vw"
                          />
                        </div>
                      ) : (
                        <div className="relative w-full aspect-[16/10] bg-gradient-to-br from-emerald-500/10 via-slate-900 to-teal-500/10 flex items-center justify-center">
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-12 h-12 text-emerald-500/40">
                            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" strokeLinecap="round" strokeLinejoin="round" />
                            <circle cx="12" cy="10" r="3" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        </div>
                      )}

                      <div className="p-5">
                        <h4 className="font-bold text-white text-lg mb-2 group-hover:text-emerald-400 transition-colors">
                          {p.nome}
                        </h4>
                        <p className="text-slate-400 text-sm leading-relaxed line-clamp-2 mb-4">
                          {p.descrizione?.replace(/<[^>]*>/g, '').substring(0, 120)}
                        </p>
                        <span className="inline-flex items-center gap-1.5 text-emerald-400 text-xs font-semibold group-hover:gap-2.5 transition-all">
                          Approfondisci <ArrowRight size={12} />
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        </section>
      )}
      {/* Storia della medicina sportiva — bento serpentina dark/sport edition */}
      {storiaSportiva.length > 0 && (
        <section className="relative section overflow-hidden">
          {/* Ambient glow + chevron pattern */}
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute top-1/3 left-0 w-[500px] h-[500px] bg-emerald-500/5 rounded-full blur-3xl" />
            <div className="absolute bottom-1/4 right-0 w-[420px] h-[420px] bg-teal-500/5 rounded-full blur-3xl" />
            <div
              className="absolute inset-0 opacity-[0.04]"
              style={{
                backgroundImage:
                  'url("data:image/svg+xml,%3Csvg width=\'40\' height=\'40\' viewBox=\'0 0 40 40\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'%2310b981\' fill-rule=\'evenodd\'%3E%3Cpath d=\'M0 40L40 0H20L0 20M40 40V20L20 40\'/%3E%3C/g%3E%3C/svg%3E")',
              }}
            />
          </div>

          <div className="container-main relative">
            <div className="text-center mb-14 md:mb-20">
              <span className="inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 rounded-full px-4 py-1.5 mb-5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-emerald-400 text-xs font-bold tracking-widest uppercase">La nostra storia</span>
              </span>
              <h2 className="text-3xl md:text-5xl font-black tracking-tight text-white">
                Una <span className="bg-gradient-to-r from-emerald-400 via-green-400 to-teal-400 bg-clip-text text-transparent">tradizione</span> sportiva
              </h2>
              <p className="text-slate-400 text-base md:text-lg max-w-2xl mx-auto mt-4">
                Ogni tappa è una vittoria. Scopri come il nostro ambulatorio ha
                costruito la sua reputazione, anno dopo anno.
              </p>
            </div>

            {/* Curva decorativa SVG — desktop only */}
            <div aria-hidden className="hidden lg:block absolute inset-x-0 top-72 bottom-32 pointer-events-none">
              <svg className="w-full h-full" preserveAspectRatio="none" viewBox="0 0 1000 1000">
                <path
                  d="M 200 0 Q 800 250, 200 500 T 200 1000"
                  fill="none"
                  stroke="url(#sportGrad)"
                  strokeWidth="2"
                  strokeDasharray="4 12"
                  className="opacity-50"
                />
                <defs>
                  <linearGradient id="sportGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#34d399" stopOpacity="0.8" />
                    <stop offset="100%" stopColor="#2dd4bf" stopOpacity="0.5" />
                  </linearGradient>
                </defs>
              </svg>
            </div>

            <div className="relative max-w-6xl mx-auto space-y-20 md:space-y-28">
              {storiaSportiva.map((evento, index) => {
                const isLeft = index % 2 === 0
                return (
                  <article
                    key={evento.id}
                    className={`group relative grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-10 items-center ${
                      isLeft ? '' : 'md:[&>*:first-child]:order-2'
                    }`}
                  >
                    {/* Anno tipografico XL energetico */}
                    <div
                      className={`md:col-span-5 flex ${
                        isLeft ? 'md:justify-end md:text-right' : 'md:justify-start md:text-left'
                      } items-center`}
                    >
                      <div className="relative">
                        {/* Glow dietro l'anno */}
                        <div
                          aria-hidden
                          className="absolute inset-0 blur-3xl opacity-40 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-full"
                        />
                        {/* Anno outline gigante */}
                        <span
                          aria-hidden
                          className="relative select-none block text-[6rem] md:text-[10rem] leading-none font-black tracking-tighter"
                          style={{
                            WebkitTextStroke: '2px rgba(52,211,153,0.35)',
                            color: 'transparent',
                          }}
                        >
                          {evento.anno}
                        </span>
                        {/* Anno solid sovrapposto */}
                        <span
                          className={`absolute top-2 ${
                            isLeft ? 'right-3 md:right-4' : 'left-3 md:left-4'
                          } text-3xl md:text-5xl font-black bg-gradient-to-br from-emerald-300 to-teal-400 bg-clip-text text-transparent drop-shadow-[0_0_18px_rgba(52,211,153,0.35)]`}
                        >
                          {evento.anno}
                        </span>
                        {/* Punto decorativo timeline */}
                        <span
                          aria-hidden
                          className={`hidden md:block absolute bottom-0 ${
                            isLeft ? 'right-0 translate-x-1/2' : 'left-0 -translate-x-1/2'
                          } w-3 h-3 rounded-full bg-emerald-400 ring-4 ring-emerald-500/20 shadow-[0_0_18px_rgba(52,211,153,0.5)]`}
                        />
                      </div>
                    </div>

                    {/* Card contenuto — vetro scuro con accenti emerald */}
                    <div className="md:col-span-7">
                      <div className="relative bg-slate-900/70 backdrop-blur border border-slate-800 group-hover:border-emerald-500/40 rounded-2xl p-6 md:p-7 shadow-[0_8px_30px_-12px_rgba(16,185,129,0.15)] hover:shadow-[0_16px_40px_-12px_rgba(16,185,129,0.35)] hover:-translate-y-1 transition-all duration-300 overflow-hidden">
                        {/* Top accent line */}
                        <div className="absolute top-0 left-6 right-6 h-px bg-gradient-to-r from-transparent via-emerald-500/60 to-transparent" />
                        {/* Decor blur */}
                        <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl group-hover:bg-emerald-500/20 transition-colors" />
                        {/* Numero step */}
                        <div className="absolute top-4 right-4 text-[11px] font-bold text-emerald-500/40 tracking-widest">
                          {String(index + 1).padStart(2, '0')}
                        </div>

                        {evento.immagine && (
                          <div className="relative w-full max-h-72 rounded-xl overflow-hidden mb-5 ring-1 ring-emerald-500/20 bg-slate-950 flex items-center justify-center">
                            <Image
                              src={evento.immagine}
                              alt={evento.titolo}
                              width={1200}
                              height={800}
                              className="w-full h-auto max-h-72 object-contain transition-transform duration-700 group-hover:scale-[1.03]"
                              sizes="(max-width: 768px) 100vw, 520px"
                            />
                            {/* Anno badge mobile (ribbon style) */}
                            <div className="md:hidden absolute top-3 left-3 bg-emerald-500 text-slate-950 text-xs font-black uppercase tracking-wider px-3 py-1.5 rounded-full shadow-lg">
                              {evento.anno}
                            </div>
                          </div>
                        )}

                        {!evento.immagine && (
                          <div className="md:hidden inline-block bg-emerald-500/10 text-emerald-400 text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full mb-3 border border-emerald-500/20">
                            {evento.anno}
                          </div>
                        )}

                        <h3 className="relative text-xl md:text-2xl font-black text-white mb-3 leading-tight group-hover:text-emerald-300 transition-colors">
                          {evento.titolo}
                        </h3>
                        <div
                          className="relative text-slate-400 leading-relaxed text-sm md:text-base prose prose-invert prose-sm md:prose-base max-w-none line-clamp-6"
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

      {/* CTA */}
      <section className="section">
        <div className="container-main">
          <div className="relative overflow-hidden bg-gradient-to-r from-emerald-600 to-teal-600 rounded-3xl p-12 md:p-16 text-center">
            <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'40\' height=\'40\' viewBox=\'0 0 40 40\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'1\' fill-rule=\'evenodd\'%3E%3Cpath d=\'M0 40L40 0H20L0 20M40 40V20L20 40\'/%3E%3C/g%3E%3C/svg%3E")' }} />
            <div className="relative">
              <h2 className="text-3xl md:text-4xl font-black mb-4 text-white">
                Pronto a dare il meglio?
              </h2>
              <p className="text-emerald-100 mb-8 max-w-xl mx-auto text-lg">
                Prenota la tua visita sportiva oggi. Certificazioni, valutazioni funzionali
                e piani nutrizionali su misura per te.
              </p>
              <Link
                href="/prenota"
                className="inline-flex items-center gap-2 bg-white hover:bg-slate-100 text-emerald-700 font-bold px-10 py-4 rounded-lg transition-all hover:shadow-xl text-lg"
              >
                Prenota adesso
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-5 h-5">
                  <path d="M13 7l5 5m0 0l-5 5m5-5H6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
