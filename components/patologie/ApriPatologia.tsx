'use client'

import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ArrowRight, CalendarCheck } from 'lucide-react'
import { Modale } from '@/components/ui/Modale'
import type { SchedaPatologia } from '@/lib/patologie'

/**
 * Parametro dell'indirizzo con la patologia aperta (/patologie?patologia=artrosi).
 * Rende la finestra condivisibile e accoglie i vecchi link /patologie/<slug>,
 * reindirizzati qui da next.config.mjs.
 */
const PARAMETRO = 'patologia'

function aggiornaIndirizzo(slug: string | null) {
  const url = new URL(window.location.href)
  if (slug) url.searchParams.set(PARAMETRO, slug)
  else url.searchParams.delete(PARAMETRO)
  window.history.replaceState(null, '', url.pathname + url.search + url.hash)
}

interface Props {
  scheda: SchedaPatologia
  tema?: 'chiaro' | 'scuro'
  /**
   * Classi del bottone. Nelle card è il nome della patologia dentro il titolo,
   * allargato con `after:absolute after:inset-0` a tutta la card: così la card
   * intera è cliccabile e il titolo resta un titolo vero per i lettori di schermo.
   */
  className?: string
  children: ReactNode
}

/** Bottone che apre la scheda di una patologia in una finestra. */
export function ApriPatologia({ scheda, tema = 'chiaro', className, children }: Props) {
  const [aperta, setAperta] = useState(false)
  const bottone = useRef<HTMLButtonElement>(null)

  // Arrivo da un link diretto (o da un vecchio indirizzo): la card viene
  // portata in vista e la finestra si apre; alla chiusura il focus torna lì
  useEffect(() => {
    if (new URLSearchParams(window.location.search).get(PARAMETRO) !== scheda.slug) return
    bottone.current?.scrollIntoView({ block: 'center' })
    bottone.current?.focus({ preventScroll: true })
    setAperta(true)
  }, [scheda.slug])

  const chiudi = useCallback(() => {
    setAperta(false)
    aggiornaIndirizzo(null)
  }, [])

  return (
    <>
      <button
        ref={bottone}
        type="button"
        aria-haspopup="dialog"
        onClick={() => {
          // Safari non dà il focus ai bottoni cliccati: senza, alla chiusura
          // il focus non saprebbe dove tornare
          bottone.current?.focus({ preventScroll: true })
          setAperta(true)
          aggiornaIndirizzo(scheda.slug)
        }}
        className={className}
      >
        {children}
      </button>
      {aperta && <FinestraPatologia scheda={scheda} tema={tema} onChiudi={chiudi} />}
    </>
  )
}

function FinestraPatologia({
  scheda,
  tema,
  onChiudi,
}: {
  scheda: SchedaPatologia
  tema: 'chiaro' | 'scuro'
  onChiudi: () => void
}) {
  const scuro = tema === 'scuro'
  const pathname = usePathname()
  const spec = scheda.specialistica
  // Sulla pagina della specialistica stessa il collegamento non serve
  const linkSpec = spec && spec.href !== pathname ? spec : null

  return (
    <Modale
      titolo={scheda.nome}
      onChiudi={onChiudi}
      tema={tema}
      larga
      fascia={
        scuro
          ? 'bg-gradient-to-r from-emerald-500 via-emerald-400 to-teal-500'
          : 'bg-gradient-to-r from-primary via-primary to-primary-dark'
      }
    >
      {scheda.immagine && (
        <div className={`relative h-44 sm:h-56 w-full ${scuro ? 'bg-slate-800' : 'bg-bg-soft'}`}>
          <Image
            src={scheda.immagine}
            alt=""
            fill
            sizes="(max-width: 672px) 100vw, 672px"
            className="object-contain p-4"
          />
        </div>
      )}

      <div className="p-7 md:p-9">
        {spec && (
          <p
            className={`inline-flex items-center gap-2 rounded-full px-3 py-1 mb-4 mr-12 text-xs font-semibold uppercase tracking-wide ${
              scuro ? 'bg-emerald-500/10 text-emerald-300' : 'bg-primary/10 text-primary-dark'
            }`}
          >
            {spec.icona && <span aria-hidden className="text-base leading-none">{spec.icona}</span>}
            {spec.nome}
          </p>
        )}

        <h2 className={`text-2xl md:text-3xl font-bold mb-4 pr-10 ${scuro ? 'text-white' : 'text-text-main'}`}>
          {scheda.nome}
        </h2>

        {scheda.descrizioneHtml ? (
          <div
            className={`prose-content ${scuro ? 'prose-content-scuro text-slate-300' : 'text-gray-700'}`}
            dangerouslySetInnerHTML={{ __html: scheda.descrizioneHtml }}
          />
        ) : (
          <p className={scuro ? 'text-slate-300' : 'text-gray-700'}>
            Per questa patologia non è ancora disponibile una descrizione dettagliata. Prenota una
            visita: i nostri specialisti sapranno indicarti il percorso più adatto.
          </p>
        )}

        {scheda.medici.length > 0 && (
          <section className="mt-8" aria-labelledby={`medici-${scheda.id}`}>
            <h3
              id={`medici-${scheda.id}`}
              className={`mb-3 text-sm font-bold uppercase tracking-wider ${
                scuro ? 'text-emerald-400' : 'text-primary-dark'
              }`}
            >
              Medici che la trattano
            </h3>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {scheda.medici.map((m) => (
                <li key={m.id}>
                  <Link
                    href={`/medici/${m.slug}`}
                    onClick={onChiudi}
                    className={`flex items-center gap-3 rounded-xl border p-2.5 transition-colors focus:outline-none focus-visible:ring-2 ${
                      scuro
                        ? 'border-slate-700 hover:border-emerald-500/50 hover:bg-slate-800 focus-visible:ring-emerald-400'
                        : 'border-gray-200 hover:border-primary/40 hover:bg-bg-soft focus-visible:ring-primary'
                    }`}
                  >
                    {m.foto ? (
                      <Image
                        src={m.foto}
                        alt=""
                        width={40}
                        height={40}
                        className="h-10 w-10 flex-shrink-0 rounded-full object-cover"
                      />
                    ) : (
                      <span
                        aria-hidden
                        className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full font-bold ${
                          scuro ? 'bg-emerald-500/10 text-emerald-300' : 'bg-primary/10 text-primary'
                        }`}
                      >
                        {m.nome.charAt(0)}
                      </span>
                    )}
                    <span className={`text-sm font-semibold ${scuro ? 'text-white' : 'text-text-main'}`}>
                      {m.nome}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}

        <div className="mt-8 flex flex-wrap items-center gap-3">
          <Link
            href={scheda.prenotaHref}
            onClick={onChiudi}
            className={`inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-semibold shadow-lg transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 ${
              scuro
                ? 'bg-emerald-500 text-slate-950 hover:bg-emerald-400 focus-visible:ring-emerald-400 focus-visible:ring-offset-slate-900'
                : 'bg-primary text-white hover:bg-primary-dark focus-visible:ring-primary'
            }`}
          >
            <CalendarCheck size={17} aria-hidden /> Prenota una visita
          </Link>
          {linkSpec && (
            <Link
              href={linkSpec.href}
              onClick={onChiudi}
              className={`inline-flex items-center gap-1.5 rounded-full px-4 py-3 text-sm font-semibold transition-colors focus:outline-none focus-visible:ring-2 ${
                scuro
                  ? 'text-emerald-400 hover:text-emerald-300 focus-visible:ring-emerald-400'
                  : 'text-primary-dark hover:text-primary focus-visible:ring-primary'
              }`}
            >
              Scopri {linkSpec.nome} <ArrowRight size={15} aria-hidden />
            </Link>
          )}
        </div>
      </div>
    </Modale>
  )
}
