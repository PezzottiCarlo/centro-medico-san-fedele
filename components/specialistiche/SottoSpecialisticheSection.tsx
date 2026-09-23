'use client'

import { useState, useCallback } from 'react'
import { ArrowUpRight, BadgeCheck } from 'lucide-react'
import { SottoSpecialisticaModal } from './SottoSpecialisticaModal'
import type { SottoSpecialistica } from '@/types'

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

  const visible = enableGenderFilter
    ? sottoSpecialistiche.filter((s) => !s.genere || s.genere === 'entrambi' || s.genere === gender)
    : sottoSpecialistiche

  const chiudi = useCallback(() => setActive(null), [])

  if (sottoSpecialistiche.length === 0) return null

  return (
    <div>
      <div className="flex items-end justify-between mb-6 flex-wrap gap-3">
        <h2 className="heading-3">Prestazioni e terapie</h2>
        <span className="text-sm text-gray-400">
          {visible.length}{' '}
          {visible.length === 1 ? 'prestazione' : 'prestazioni'}
        </span>
      </div>

      {enableGenderFilter && (
        <div className="mb-8">
          <p className="text-sm font-medium text-gray-500 mb-3">Seleziona per chi cerchi il trattamento:</p>
          <div className="inline-flex gap-3">
            <button
              type="button"
              onClick={() => setGender('donna')}
              aria-pressed={gender === 'donna'}
              className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-full font-semibold text-sm border-2 transition-all ${
                gender === 'donna'
                  ? 'bg-pink-500 border-pink-500 text-white shadow-card'
                  : 'bg-white border-pink-200 text-pink-500 hover:border-pink-400'
              }`}
            >
              <VenusIcon className="w-5 h-5" /> Donna
            </button>
            <button
              type="button"
              onClick={() => setGender('uomo')}
              aria-pressed={gender === 'uomo'}
              className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-full font-semibold text-sm border-2 transition-all ${
                gender === 'uomo'
                  ? 'bg-blue-500 border-blue-500 text-white shadow-card'
                  : 'bg-white border-blue-200 text-blue-500 hover:border-blue-400'
              }`}
            >
              <MarsIcon className="w-5 h-5" /> Uomo
            </button>
          </div>
        </div>
      )}

      {enableGenderFilter && visible.length === 0 ? (
        <p className="text-gray-400 text-sm">
          Nessuna prestazione disponibile per questa selezione al momento.
        </p>
      ) : (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {visible.map((sotto, i) => {
          const preview = sotto.descrizione?.trim()
          return (
            <button
              key={sotto.id}
              onClick={() => setActive(sotto)}
              className="group relative text-left glass-card hover:shadow-card-hover transition-all hover:-translate-y-1 overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full blur-2xl group-hover:bg-primary/10 transition-colors" />
              <div className="relative">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary flex-shrink-0">
                    <BadgeCheck size={20} />
                  </div>
                  <span className="text-[11px] font-bold text-primary/30 tracking-widest">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                </div>
                <h3 className="font-semibold text-text-main mb-1 leading-snug">
                  {sotto.nome}
                </h3>
                <p className="text-gray-500 text-sm line-clamp-2">
                  {preview || 'Scopri questa prestazione e prenota una visita.'}
                </p>
                <span className="inline-flex items-center gap-1 text-primary text-xs font-medium mt-3 group-hover:gap-2 transition-all">
                  Scopri di più <ArrowUpRight size={12} />
                </span>
              </div>
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
