'use client'

import { useCallback, useState } from 'react'
import { ArrowUpRight } from 'lucide-react'
import { SottoSpecialisticaModal } from '@/components/specialistiche/SottoSpecialisticaModal'

export interface TerapiaCard {
  id: string
  nome: string
  descrizione?: string
  specSlug: string
  specNome: string
  icona: string
}

/** Le sotto-specialistiche praticate dal medico: ognuna apre la sua scheda. */
export function TerapieMedico({ terapie, medicoSlug }: { terapie: TerapiaCard[]; medicoSlug: string }) {
  const [attiva, setAttiva] = useState<TerapiaCard | null>(null)
  const chiudi = useCallback(() => setAttiva(null), [])

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {terapie.map((t) => (
          <button
            key={`${t.specSlug}-${t.id}`}
            type="button"
            onClick={() => setAttiva(t)}
            className="group relative text-left bg-white rounded-2xl p-6 border border-primary/10 hover:border-primary hover:shadow-card-hover hover:-translate-y-1 transition-all duration-300"
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
              Scopri di più <ArrowUpRight size={12} />
            </span>
          </button>
        ))}
      </div>

      {attiva && (
        <SottoSpecialisticaModal
          nome={attiva.nome}
          descrizione={attiva.descrizione}
          specNome={attiva.specNome}
          icona={attiva.icona}
          prenotaHref={`/prenota?specialistica=${attiva.specSlug}&sottoSpecialistica=${attiva.id}&medico=${medicoSlug}`}
          onClose={chiudi}
        />
      )}
    </>
  )
}
