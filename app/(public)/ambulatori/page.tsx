import { adminDb } from '@/lib/firebase/admin'
import { getSiteConfig } from '@/lib/firebase/siteConfig'
import { generatePageMetadata } from '@/lib/seo'
import type { Specialistica } from '@/types'
import Link from 'next/link'
import { ArrowRight, Shield, Building2, Scan } from 'lucide-react'
import { PageHero } from '@/components/layout/PageHero'
import { getHeroConfig } from '@/lib/firebase/hero'
import { specialisticaHref } from '@/lib/utils'

export const revalidate = 60
export async function generateMetadata() {
  const site = await getSiteConfig()
  return generatePageMetadata({
    title: 'Specialistiche Mediche e Servizi',
    description: `Scopri le nostre specialistiche mediche e i servizi dedicati. Centro Medico San Fedele, ${site.citta}.`,
    slug: 'ambulatori',
  })
}

async function getSpecialistiche(): Promise<Specialistica[]> {
  try {
    const snap = await adminDb.collection('specialistiche').where('pubblicata', '==', true).get()
    return snap.docs
      .map((d) => ({ id: d.id, ...(d.data() as Omit<Specialistica, 'id'>) }))
      .sort((a, b) => (a.order ?? 999) - (b.order ?? 999))
  } catch {
    return []
  }
}

const SERVIZI_DEDICATI = [
  {
    icon: Shield,
    titolo: 'Assistenza Sinistri',
    descrizione:
      'Supporto medico-legale completo per la gestione di sinistri stradali e infortuni. Perizie, valutazione del danno biologico e assistenza durante tutto l\'iter.',
    link: '/contatti',
    linkLabel: 'Contattaci per info',
    color: 'primary',
  },
  {
    icon: Building2,
    titolo: 'Servizi alle Aziende',
    descrizione:
      'Medicina del lavoro, visite periodiche, sorveglianza sanitaria e programmi di prevenzione per le aziende del territorio. Convenzioni personalizzate.',
    link: '/contatti',
    linkLabel: 'Richiedi un preventivo',
    color: 'secondary',
  },
  {
    icon: Scan,
    titolo: 'Diagnostica',
    descrizione:
      'Apparecchiature di ultima generazione per ecografie, elettromiografie, esami strumentali e di laboratorio. Risultati rapidi e affidabili.',
    link: '/ambulatori/esami-diagnostici',
    linkLabel: 'Vedi gli esami',
    color: 'accent',
  },
]

export default async function AmbulatorioPage() {
  const [specialistiche, hero] = await Promise.all([
    getSpecialistiche(),
    getHeroConfig('ambulatori'),
  ])

  return (
    <>
      <PageHero config={hero} />

      {/* Intro */}
      <section className="py-12 bg-white border-b border-gray-100">
        <div className="container-main">
          <div className="max-w-3xl mx-auto text-center">
            <p className="text-gray-500 text-lg leading-relaxed">
              Il Centro Medico San Fedele offre un&apos;ampia gamma di servizi sanitari integrati.
              I nostri ambulatori sono dotati di attrezzature all&apos;avanguardia e seguiti da medici
              specialisti con anni di esperienza clinica. Dalla fisioterapia alla diagnostica,
              dalla medicina sportiva alle specialistiche mediche: un unico punto di riferimento
              per tutta la famiglia.
            </p>
          </div>
        </div>
      </section>

      {/* Specialistiche — griglia unica uniforme */}
      <section className="section bg-muted/30">
        <div className="container-main">
          <div className="text-center mb-10">
            <p className="text-primary uppercase text-sm tracking-wide mb-2 font-medium">
              Specialistiche mediche
            </p>
            <h2 className="heading-2">Tutte le specialistiche</h2>
          </div>

          {specialistiche.length === 0 ? (
            <p className="text-center text-gray-400">Nessuna specialistica disponibile al momento.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {specialistiche.map((spec) => (
                <SpecCard key={spec.id} spec={spec} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Servizi dedicati */}
      <section className="section bg-white">
        <div className="container-main">
          <div className="text-center mb-10">
            <p className="text-primary uppercase text-sm tracking-wide mb-2 font-medium">
              Oltre alle specialistiche
            </p>
            <h2 className="heading-2 mb-3">Servizi dedicati</h2>
            <p className="text-gray-500 text-lg max-w-2xl mx-auto">
              Servizi su misura per esigenze specifiche di pazienti, famiglie e aziende.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {SERVIZI_DEDICATI.map((s) => {
              const Icon = s.icon
              return (
                <div key={s.titolo} className="bg-white rounded-lg p-6 shadow-card border border-gray-100 flex flex-col">
                  <div className={`w-12 h-12 rounded-full bg-${s.color}/10 flex items-center justify-center mb-4`}>
                    <Icon size={24} className={`text-${s.color}`} />
                  </div>
                  <h3 className="font-semibold text-text-main text-xl mb-3">{s.titolo}</h3>
                  <p className="text-gray-500 text-sm leading-relaxed mb-5 flex-1">{s.descrizione}</p>
                  <Link href={s.link} className="text-primary text-sm font-semibold inline-flex items-center gap-1 hover:gap-2 transition-all">
                    {s.linkLabel} <ArrowRight size={14} />
                  </Link>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative py-12 md:py-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary to-primary-dark" />
        <div className="container-main text-center relative">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-light tracking-tight text-white mb-3 sm:mb-4">
            Non sai quale specialistica scegliere?
          </h2>
          <p className="text-white/80 text-base sm:text-lg mb-6 sm:mb-8 max-w-xl mx-auto">
            Contattaci e ti aiuteremo a individuare il percorso di cura più adatto alle tue esigenze.
          </p>
          <Link href="/prenota" className="bg-white text-primary font-medium px-6 py-3 rounded-sm hover:bg-gray-50 transition-colors inline-flex items-center gap-2 min-h-[44px]">
            Prenota una visita <ArrowRight size={18} />
          </Link>
        </div>
      </section>
    </>
  )
}

function SpecCard({ spec }: { spec: Specialistica }) {
  return (
    <Link
      href={specialisticaHref(spec.slug)}
      className="group relative block bg-white rounded-lg p-6 shadow-card hover:shadow-card-hover transition-all duration-300 hover:-translate-y-1 border border-gray-100 overflow-hidden"
    >
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary to-secondary opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-3xl mb-4 group-hover:bg-primary/15 transition-colors">
        {spec.icona}
      </div>
      <h3 className="font-semibold text-text-main text-xl mb-2">{spec.nome}</h3>
      <p className="text-gray-500 text-sm leading-relaxed mb-4 line-clamp-3">{spec.descrizioneBreve}</p>
      <span className="inline-flex items-center gap-1 text-primary text-sm font-medium group-hover:gap-2 transition-all">
        Scopri di più <ArrowRight size={16} />
      </span>
    </Link>
  )
}
