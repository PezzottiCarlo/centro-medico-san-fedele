'use client'

import { useState, useCallback } from 'react'
import { ArrowUpRight, BadgeCheck } from 'lucide-react'
import { SottoSpecialisticaModal } from './SottoSpecialisticaModal'
import type { SottoSpecialistica } from '@/types'
import { ordinaSotto } from '@/lib/sottoSpecialistiche'

interface Props {
  sottoSpecialistiche: SottoSpecialistica[]
  specSlug: string
  specNome: string
  icona: string
  /** Mostra il selettore Donna/Uomo che filtra le prestazioni (es. Medicina Estetica) */
  enableGenderFilter?: boolean
}

// Simboli gender inline (lucide non include Venus/Mars in questa versione)
function VenusIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <circle cx="12" cy="8" r="5" />
      <path d="M12 13v8M9 18h6" />
    </svg>
  )
}

function MarsIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <circle cx="10" cy="14" r="5" />
      <path d="M15 9l5-5M15 4h5v5" />
    </svg>
  )
}

export function SottoSpecialisticheSection({
  sottoSpecialistiche,
  specSlug,
  specNome,
  icona,
  enableGenderFilter = false,
}: Props) {
  const [active, setActive] = useState<SottoSpecialistica | null>(null)
  const [gender, setGender] = useState<'donna' | 'uomo'>('donna')

  // Nell'ordine scelto dall'admin
  const ordinate = ordinaSotto(sottoSpecialistiche)
  const visible = enableGenderFilter
    ? ordinate.filter((s) => !s.genere || s.genere === 'entrambi' || s.genere === gender)
    : ordinate

  const chiudi = useCallback(() => setActive(null), [])

  if (sottoSpecialistiche.length === 0) return null

  return (
    <div>
      <div className="flex items-end justify-between mb-6 flex-wrap gap-3">
        <h2 className="heading-3">Prestazioni e terapie</h2>
        {/* Annunciato quando il filtro Donna/Uomo cambia l'elenco */}
        <span className="text-sm text-gray-500" aria-live="polite">
          {visible.length}{' '}
          {visible.length === 1 ? 'prestazione' : 'prestazioni'}
        </span>
      </div>

      {enableGenderFilter && (
        <div className="mb-8">
          <p id="filtro-genere" className="text-sm font-medium text-gray-600 mb-3">Seleziona per chi cerchi il trattamento:</p>
          <div className="inline-flex gap-3" role="group" aria-labelledby="filtro-genere">
            <button
              type="button"
              onClick={() => setGender('donna')}
              aria-pressed={gender === 'donna'}
              className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-full font-semibold text-sm border-2 transition-all ${
                gender === 'donna'
                  ? 'bg-pink-700 border-pink-700 text-white shadow-card'
                  : 'bg-white border-pink-300 text-pink-700 hover:border-pink-500'
              }`}
            >
              <VenusIcon className="w-5 h-5" aria-hidden /> Donna
            </button>
            <button
              type="button"
              onClick={() => setGender('uomo')}
              aria-pressed={gender === 'uomo'}
              className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-full font-semibold text-sm border-2 transition-all ${
                gender === 'uomo'
                  ? 'bg-blue-700 border-blue-700 text-white shadow-card'
                  : 'bg-white border-blue-300 text-blue-700 hover:border-blue-500'
              }`}
            >
              <MarsIcon className="w-5 h-5" aria-hidden /> Uomo
            </button>
          </div>
        </div>
      )}

      {enableGenderFilter && visible.length === 0 ? (
        <p className="text-gray-500 text-sm">
          Nessuna prestazione disponibile per questa selezione al momento.
        </p>
      ) : (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {visible.map((sotto, i) => {
          const preview = sotto.descrizione?.trim()
          return (
            // Dentro un bottone vanno solo elementi "in linea": titoli e
            // paragrafi diventano span a blocco (il lettore li legge comunque)
            <button
              key={sotto.id}
              type="button"
              onClick={() => setActive(sotto)}
              aria-haspopup="dialog"
              className="group relative text-left glass-card hover:shadow-card-hover transition-all hover:-translate-y-1 overflow-hidden focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
            >
              <span aria-hidden className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full blur-2xl group-hover:bg-primary/10 transition-colors" />
              <span className="relative block">
                <span className="flex items-center gap-3 mb-3">
                  <span aria-hidden className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary flex-shrink-0">
                    <BadgeCheck size={20} />
                  </span>
                  <span aria-hidden className="text-[11px] font-bold text-primary/30 tracking-widest">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                </span>
                <span className="block font-semibold text-text-main mb-1 leading-snug">
                  {sotto.nome}
                </span>
                <span className="block text-gray-600 text-sm line-clamp-2">
                  {preview || 'Scopri questa prestazione e prenota una visita.'}
                </span>
                <span className="inline-flex items-center gap-1 text-primary-dark text-xs font-medium mt-3 group-hover:gap-2 transition-all">
                  Scopri di più <ArrowUpRight size={12} aria-hidden />
                </span>
              </span>
            </button>
          )
        })}
      </div>
      )}

      {active && (
        <SottoSpecialisticaModal
          nome={active.nome}
          descrizione={active.descrizione}
          specNome={specNome}
          icona={icona}
          prenotaHref={`/prenota?specialistica=${specSlug}&sottoSpecialistica=${active.id}`}
          onClose={chiudi}
        />
      )}
    </div>
  )
}
