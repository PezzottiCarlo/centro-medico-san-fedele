import { Clock, ShieldCheck, Stethoscope, Phone } from 'lucide-react'
import { ModuloContatto } from '@/components/home/ModuloContatto'
import type { SiteConfig } from '@/types'
import { telefonoCentro } from '@/lib/telefono'

interface Props {
  site: SiteConfig
  specialistiche: { id: string; nome: string; slug: string }[]
}

const VANTAGGI = [
  { icona: Clock, testo: 'Ti rispondiamo entro 24 ore lavorative' },
  { icona: Stethoscope, testo: 'Ti indirizziamo allo specialista più adatto' },
  { icona: ShieldCheck, testo: 'I tuoi dati restano riservati' },
]

/**
 * Modulo di contatto della home, in fondo alla pagina dopo le recensioni:
 * banda blu a tutta larghezza con le rassicurazioni a sinistra e il modulo su
 * un pannello chiaro a destra. Su telefono il testo viene prima del modulo.
 */
export function ScriviciSection({ site, specialistiche }: Props) {
  const tel = telefonoCentro(site)

  return (
    <section
      id="scrivici"
      className="relative overflow-hidden bg-gradient-to-br from-primary via-primary-dark to-[#1F3D5C] py-16 md:py-24 text-white"
    >
      {/* Decorazioni morbide sullo sfondo */}
      <div aria-hidden className="pointer-events-none absolute -left-24 -top-24 h-80 w-80 rounded-full bg-white/10 blur-3xl" />
      <div aria-hidden className="pointer-events-none absolute -bottom-32 right-0 h-96 w-96 rounded-full bg-secondary/20 blur-3xl" />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.06]"
        style={{
          backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)',
          backgroundSize: '28px 28px',
        }}
      />

      <div className="container-main relative grid grid-cols-1 lg:grid-cols-[1fr_1.25fr] gap-10 lg:gap-16 items-center">
        <div className="text-center lg:text-left">
          <p className="text-white/90 uppercase text-xs tracking-widest font-bold mb-3">Scrivici</p>
          <h2 className="text-3xl md:text-5xl font-light tracking-tight leading-tight mb-5">
            Hai una domanda o una richiesta?{' '}
            <span className="font-semibold">Ci pensiamo noi.</span>
          </h2>
          <p className="text-white/90 text-base md:text-lg leading-relaxed max-w-xl mx-auto lg:mx-0 mb-8">
            Raccontaci di cosa hai bisogno: la segreteria ti ricontatta per darti tutte le
            informazioni o fissare una visita.
          </p>

          <ul className="space-y-3 max-w-md mx-auto lg:mx-0 text-left">
            {VANTAGGI.map(({ icona: Icona, testo }) => (
              <li key={testo} className="flex items-center gap-3">
                <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-white/15 ring-1 ring-white/20">
                  <Icona size={20} aria-hidden />
                </span>
                <span className="font-medium">{testo}</span>
              </li>
            ))}
          </ul>

          <p className="mt-8 text-sm text-white/90">
            Preferisci parlare con qualcuno?{' '}
            <a href={`tel:${tel}`} className="inline-flex items-center gap-1.5 font-semibold text-white underline underline-offset-4 hover:no-underline">
              <Phone size={14} aria-hidden /> {site.telefono}
            </a>
          </p>
        </div>

        <div className="rounded-3xl bg-white p-6 sm:p-8 md:p-10 text-text-main shadow-2xl shadow-black/20 ring-1 ring-white/40">
          <ModuloContatto specialistiche={specialistiche} />
        </div>
      </div>
    </section>
  )
}
