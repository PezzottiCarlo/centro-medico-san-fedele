'use client'

import { useState, useEffect } from 'react'
import { X, ArrowUpRight, BadgeCheck } from 'lucide-react'
import { MelaButton } from '@/components/ui/MelaButton'
import type { SottoSpecialistica } from '@/types'

interface Props {
  sottoSpecialistiche: SottoSpecialistica[]
  specSlug: string
  specNome: string
  icona: string
}

export function SottoSpecialisticheSection({
  sottoSpecialistiche,
  specSlug,
  specNome,
  icona,
}: Props) {
  const [active, setActive] = useState<SottoSpecialistica | null>(null)

  useEffect(() => {
    if (!active) return
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setActive(null)
    }
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [active])

  if (sottoSpecialistiche.length === 0) return null

  return (
    <div>
      <div className="flex items-end justify-between mb-6 flex-wrap gap-3">
        <h2 className="heading-3">Prestazioni e terapie</h2>
        <span className="text-sm text-gray-400">
          {sottoSpecialistiche.length}{' '}
          {sottoSpecialistiche.length === 1 ? 'prestazione' : 'prestazioni'}
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {sottoSpecialistiche.map((sotto, i) => {
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

      {/* Modal */}
      {active && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-label={active.nome}
          onClick={() => setActive(null)}
        >
          <div
            className="absolute inset-0 bg-text-main/50 backdrop-blur-sm"
            style={{ animation: 'modalFade .2s ease' }}
          />
          <div
            className="relative w-full max-w-lg bg-white rounded-2xl shadow-card-hover overflow-hidden"
            style={{ animation: 'modalPop .25s ease' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="h-1.5 bg-gradient-to-r from-primary/70 via-primary to-primary-dark" />
            <button
              onClick={() => setActive(null)}
              className="absolute top-4 right-4 w-9 h-9 rounded-full bg-bg-soft hover:bg-bg-deep text-text-main flex items-center justify-center transition-colors"
              aria-label="Chiudi"
            >
              <X size={18} />
            </button>

            <div className="p-7 md:p-8">
              <div className="inline-flex items-center gap-2 bg-primary/10 text-primary rounded-full px-3 py-1 mb-4">
                <span className="text-lg leading-none">{icona}</span>
                <span className="text-xs font-semibold tracking-wide uppercase">
                  {specNome}
                </span>
              </div>

              <h3 className="text-2xl font-semibold text-text-main mb-3">
                {active.nome}
              </h3>

              <p className="text-gray-600 leading-relaxed whitespace-pre-line">
                {active.descrizione?.trim() ||
                  'Per questa prestazione non è ancora disponibile una descrizione dettagliata. Prenota una visita: il nostro team saprà guidarti nel percorso più adatto.'}
              </p>

              <div className="mt-7">
                <MelaButton
                  href={`/prenota?specialistica=${specSlug}&sottoSpecialistica=${active.id}`}
                  mela="indica"
                  melaSize="md"
                >
                  Prenota una visita
                </MelaButton>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
