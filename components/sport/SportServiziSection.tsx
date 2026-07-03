'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { X, ArrowUpRight, ArrowRight } from 'lucide-react'
import type { SottoSpecialistica } from '@/types'

interface Props {
  sottoSpecialistiche: SottoSpecialistica[]
  specSlug: string
}

export function SportServiziSection({ sottoSpecialistiche, specSlug }: Props) {
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
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {sottoSpecialistiche.map((s, i) => {
          const preview = s.descrizione?.trim()
          return (
            <button
              key={s.id}
              onClick={() => setActive(s)}
              className="group relative text-left bg-slate-900 border border-slate-800 rounded-2xl p-8 hover:border-emerald-500/40 transition-all duration-300 hover:shadow-lg hover:shadow-emerald-500/5 hover:-translate-y-1 overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-2xl group-hover:bg-emerald-500/10 transition-colors" />
              <div className="absolute top-4 right-4 text-[11px] font-bold text-emerald-500/40 tracking-widest">
                {String(i + 1).padStart(2, '0')}
              </div>
              <div className="relative">
                <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center mb-6 group-hover:bg-emerald-500/20 transition-colors">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-6 h-6 text-emerald-400">
                    <path d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
                <h3 className="font-bold text-white text-lg mb-3 leading-snug">{s.nome}</h3>
                <p className="text-slate-400 text-sm leading-relaxed line-clamp-2">
                  {preview || 'Scopri questo servizio e prenota una visita.'}
                </p>
                <span className="inline-flex items-center gap-1 text-emerald-400 text-xs font-semibold mt-4 group-hover:gap-2 transition-all">
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
            className="absolute inset-0 bg-slate-950/70 backdrop-blur-sm"
            style={{ animation: 'modalFade .2s ease' }}
          />
          <div
            className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden"
            style={{ animation: 'modalPop .25s ease' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="h-1.5 bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-500" />
            <button
              onClick={() => setActive(null)}
              className="absolute top-4 right-4 w-9 h-9 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center transition-colors"
              aria-label="Chiudi"
            >
              <X size={18} />
            </button>

            <div className="p-7 md:p-8">
              <div className="inline-flex items-center gap-2 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full px-3 py-1 mb-4">
                <span className="text-xs font-semibold tracking-wide uppercase">Medicina Sportiva</span>
              </div>

              <h3 className="text-2xl font-bold text-white mb-3">{active.nome}</h3>

              <p className="text-slate-300 leading-relaxed whitespace-pre-line">
                {active.descrizione?.trim() ||
                  'Per questo servizio non è ancora disponibile una descrizione dettagliata. Prenota una visita: il nostro team saprà guidarti nel percorso più adatto.'}
              </p>

              <div className="mt-7">
                <Link
                  href={`/prenota?specialistica=${specSlug}&sottoSpecialistica=${active.id}`}
                  className="inline-flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold px-6 py-3 rounded-lg transition-colors"
                >
                  Prenota una visita <ArrowRight size={16} />
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
