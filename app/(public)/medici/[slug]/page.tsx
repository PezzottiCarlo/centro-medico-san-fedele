import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { adminDb } from '@/lib/firebase/admin'
import { generatePageMetadata, generatePhysicianJsonLd } from '@/lib/seo'
import type { Medico, Specialistica, SottoSpecialistica } from '@/types'
import { Calendar, Clock, Phone, Mail, ArrowRight, Stethoscope, Sparkles } from 'lucide-react'
import { specialisticaHref } from '@/lib/utils'
import { getSiteConfig } from '@/lib/firebase/siteConfig'
import { CollapsibleBio } from '@/components/medici/CollapsibleBio'

export const revalidate = 60

export async function generateStaticParams() {
  try {
    const snap = await adminDb.collection('medici').where('pubblicato', '==', true).get()
    return snap.docs.map((d) => ({ slug: d.data().slug as string }))
  } catch {
    return []
  }
}

interface TerapiaCard {
  id: string
  nome: string
  specSlug: string
  specNome: string
  icona: string
}

async function getData(slug: string) {
  const [medicoSnap, specSnap] = await Promise.all([
    adminDb.collection('medici').where('slug', '==', slug).limit(1).get(),
    adminDb.collection('specialistiche').where('pubblicata', '==', true).get(),
  ])

  if (medicoSnap.empty) return null

  const medicoDoc = medicoSnap.docs[0]
  const medico: Medico = { id: medicoDoc.id, ...(medicoDoc.data() as Omit<Medico, 'id'>) }

  const allSpec: Specialistica[] = specSnap.docs.map((d) => ({
    id: d.id,
    ...(d.data() as Omit<Specialistica, 'id'>),
  }))
  const specialistiche = allSpec.filter((s) => medico.specialisticheIds?.includes(s.id))

  // Costruisci elenco terapie: per ogni sotto-spec di tutte le spec, vedi se il medico la pratica
  const terapie: TerapiaCard[] = []
  const sottoIdsMedico = medico.sottoSpecialisticheIds || []
  for (const spec of allSpec) {
    const sottoList = (spec.sottoSpecialistiche || []) as SottoSpecialistica[]
    for (const sotto of sottoList) {
      if (sottoIdsMedico.includes(sotto.id)) {
        terapie.push({
          id: sotto.id,
          nome: sotto.nome,
          specSlug: spec.slug,
          specNome: spec.nome,
          icona: spec.icona,
        })
      }
    }
  }

  return { medico, specialistiche, terapie }
}

export async function generateMetadata({ params }: { params: { slug: string } }) {
  try {
    const data = await getData(params.slug)
    if (!data) return {}
    return generatePageMetadata({
      title: `${data.medico.nome}`,
      description: data.medico.bio?.substring(0, 160),
      slug: `medici/${params.slug}`,
    })
  } catch {
    return {}
  }
}

export default async function MedicoPage({ params }: { params: { slug: string } }) {
  const [data, site] = await Promise.all([getData(params.slug), getSiteConfig()])
  if (!data) notFound()

  const { medico, specialistiche, terapie } = data
  const jsonLd = generatePhysicianJsonLd({
    nome: medico.nome,
    bio: medico.bio,
    foto: medico.foto,
    slug: medico.slug,
    specialistiche: specialistiche.map((s) => s.nome),
  })

  const firstName = medico.nome.split(' ')[0]

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      {/* HERO — foto sx (rettangolare alta), info dx (allineate top con foto e bottom con foto) */}
      <section className="bg-bg-soft">
        <div className="container-main py-10 md:py-16">
          <div className="grid grid-cols-1 md:grid-cols-[minmax(280px,420px)_1fr] gap-8 md:gap-12 md:items-stretch">
            {/* Foto */}
            <div className="relative aspect-[3/4] w-full max-w-[420px] mx-auto md:mx-0 rounded-lg overflow-hidden shadow-card-hover bg-primary/10">
              {medico.foto ? (
                <Image
                  src={medico.foto}
                  alt={medico.nome}
                  fill
                  priority
                  className="object-cover"
                  sizes="(max-width: 768px) 90vw, 420px"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-primary text-[8rem] font-black">
                  {medico.nome.charAt(0)}
                </div>
              )}
            </div>

            {/* Info: top allineato col bordo superiore della foto, orari allineati col bordo inferiore */}
            <div className="flex flex-col h-full">
              {/* TOP — Nome, mansione, specialistiche */}
              <div>
                <p className="text-primary uppercase text-xs tracking-widest font-bold mb-2 text-center">
                  Il nostro specialista
                </p>
                <h1 className="text-3xl md:text-5xl font-extrabold text-text-main tracking-tight leading-tight text-center">
                  {medico.nome}
                </h1>
                {medico.mansione && (
                  <p className="text-xl md:text-2xl text-primary-dark font-bold mt-3 text-center">
                    {medico.mansione}
                  </p>
                )}

                {specialistiche.length > 0 && (
                  <div className="mt-5">
                    <p className="text-primary uppercase text-[11px] tracking-widest font-bold mb-2 flex items-center gap-2">
                      <Stethoscope size={12} /> Aree di intervento
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {specialistiche.map((s) => (
                        <Link
                          key={s.id}
                          href={specialisticaHref(s.slug)}
                          className="inline-flex items-center gap-2 bg-white text-text-main text-sm font-semibold px-3.5 py-1.5 rounded-full border border-primary/20 hover:border-primary hover:bg-primary hover:text-white transition-colors"
                        >
                          {s.icona && <span>{s.icona}</span>}
                          {s.nome}
                        </Link>
                      ))}
                    </div>
                  </div>
                )}

                {(medico.telefono || medico.email) && (
                  <div className="flex flex-wrap gap-x-5 gap-y-2 mt-5">
                    {medico.telefono && (
                      <a
                        href={`tel:${medico.telefono}`}
                        className="inline-flex items-center gap-2 text-text-main hover:text-primary text-sm font-semibold"
                      >
                        <Phone size={15} /> {medico.telefono}
                      </a>
                    )}
                    {medico.email && (
                      <a
                        href={`mailto:${medico.email}`}
                        className="inline-flex items-center gap-2 text-text-main hover:text-primary text-sm font-semibold"
                      >
                        <Mail size={15} /> {medico.email}
                      </a>
                    )}
                  </div>
                )}
              </div>

              {/* SPACER spinge orari/su-chiamata in fondo, allineato col bordo inferiore della foto */}
              <div className="flex-1 min-h-6" />

              {/* BOTTOM — Orari oppure messaggio "su chiamata" */}
              {medico.orari && medico.orari.length > 0 && !medico.suChiamata && (
                <div className="bg-white rounded-lg p-5 md:p-6 shadow-card border border-primary/10">
                  <p className="text-primary uppercase text-xs tracking-widest font-bold mb-3 flex items-center gap-2">
                    <Clock size={13} /> Orari
                  </p>
                  <div className="space-y-1.5">
                    {medico.orari.map((o, i) => (
                      <div
                        key={i}
                        className="flex justify-between items-center gap-4 py-1.5 border-b border-bg-soft last:border-0 text-sm"
                      >
                        <span className="text-text-main font-semibold">{o.giorno}</span>
                        <div className="text-right">
                          <span className="text-text-main font-bold">{o.ore}</span>
                          <span className="ml-2 text-xs text-text-main/50">
                            ({o.tipo === 'appuntamento' ? 'su prenotazione' : 'orario fisso'})
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {medico.suChiamata && (
                <div className="bg-accent/10 border border-accent/30 rounded-lg p-5">
                  <p className="text-sm text-text-main/80 font-medium mb-4">
                    Questo specialista riceve <strong>su appuntamento</strong>. Contatta il centro
                    per verificare la disponibilità.
                  </p>
                  <a
                    href={`tel:${site.telefonoE164}`}
                    className="inline-flex items-center gap-2 bg-primary hover:bg-primary-dark text-white font-semibold px-5 py-2.5 rounded-full text-sm transition-colors"
                  >
                    <Phone size={16} /> Chiama lo studio per informazioni
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* TERAPIE — cards stile home */}
      {terapie.length > 0 && (
        <section className="section bg-white">
          <div className="container-main">
            <div className="text-center mb-10">
              <p className="text-primary uppercase text-xs tracking-widest font-bold mb-2 inline-flex items-center gap-2">
                <Sparkles size={14} /> Cosa pratica
              </p>
              <h2 className="heading-2 mb-3">Terapie e prestazioni</h2>
              <p className="text-text-main/60 text-lg max-w-2xl mx-auto">
                Tutte le terapie e sotto-specialistiche praticate da {firstName}.
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {terapie.map((t) => (
                <Link
                  key={t.id}
                  href={specialisticaHref(t.specSlug)}
                  className="group relative bg-white rounded-2xl p-6 border border-primary/10 hover:border-primary hover:shadow-card-hover hover:-translate-y-1 transition-all duration-300"
                >
                  <div className="flex items-start gap-4">
                    <div className="text-3xl flex-shrink-0">{t.icona}</div>
                    <div className="min-w-0 flex-1">
                      <p className="text-[11px] uppercase tracking-widest text-primary font-bold mb-1">
                        {t.specNome}
                      </p>
                      <h3 className="font-bold text-text-main text-lg leading-snug group-hover:text-primary transition-colors">
                        {t.nome}
                      </h3>
                    </div>
                  </div>
                  <span className="inline-flex items-center gap-1 text-primary text-xs font-semibold mt-4 group-hover:gap-2 transition-all">
                    Scopri di più <ArrowRight size={12} />
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Biografia + Curriculum */}
      {(medico.bio || medico.curriculum) && (
        <section className="py-14 md:py-20 bg-bg-soft">
          <div className="container-main max-w-4xl">
            {medico.bio && (
              <div className="mb-12">
                <h2 className="text-2xl md:text-3xl font-extrabold text-text-main mb-5">Biografia</h2>
                <CollapsibleBio text={medico.bio} />
              </div>
            )}

            {medico.curriculum && (
              <div>
                <h2 className="text-2xl md:text-3xl font-extrabold text-text-main mb-5">Curriculum e formazione</h2>
                <div
                  className="prose-content text-text-main/80 leading-relaxed text-base md:text-lg font-medium"
                  dangerouslySetInnerHTML={{ __html: medico.curriculum }}
                />
              </div>
            )}
          </div>
        </section>
      )}

      {/* CTA finale */}
      {!medico.suChiamata && (
        <section className="py-16 md:py-20 bg-bg-deep">
          <div className="container-main text-center max-w-3xl">
            <h2 className="text-3xl md:text-5xl font-extrabold text-text-main mb-4">
              Prenota con {firstName}
            </h2>
            <p className="text-text-main/70 text-lg md:text-xl mb-8 font-medium">
              Scegli il giorno e l&apos;orario più comodo. Ti ricontatteremo per confermare la
              prenotazione.
            </p>
            <Link
              href={`/prenota?medico=${medico.slug}`}
              className="btn-primary inline-flex items-center gap-2 text-lg px-10 py-4"
            >
              <Calendar size={18} /> Prenota visita
              <ArrowRight size={18} />
            </Link>
          </div>
        </section>
      )}
    </>
  )
}
