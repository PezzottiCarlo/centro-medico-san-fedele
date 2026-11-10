'use client'

import { useState, useMemo } from 'react'
import { Search, X } from 'lucide-react'
import { SpecialtyCard, type SpecialisticaCard } from './SpecialtyCard'
import { MelaButton } from '@/components/ui/MelaButton'

/** Dati ridotti al minimo: prima arrivavano al browser descrizioni HTML e
 *  relazioni intere, oltre 100 KB per una ricerca che usa solo i nomi */
export interface SpecialisticaRicerca extends SpecialisticaCard {
  sotto: string[]
}
export interface PatologiaRicerca {
  nome: string
  specialisticaId: string
}

interface Props {
  specialistiche: SpecialisticaRicerca[]
  patologie?: PatologiaRicerca[]
}

function normalize(s: string): string {
  return s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
}

export function SpecialtySearchGrid({ specialistiche, patologie = [] }: Props) {
  const [query, setQuery] = useState('')

  const filtered = useMemo(() => {
    if (!query.trim()) return specialistiche
    const q = normalize(query)
    const matchedSpecIds = new Set<string>()
    for (const p of patologie) {
      if (normalize(p.nome).includes(q) && p.specialisticaId) {
        matchedSpecIds.add(p.specialisticaId)
      }
    }
    return specialistiche.filter((s) => {
      if (matchedSpecIds.has(s.id)) return true
      if (normalize(s.nome).includes(q)) return true
      if (s.descrizioneBreve && normalize(s.descrizioneBreve).includes(q)) return true
      if (s.sotto.some((nome) => normalize(nome).includes(q))) return true
      return false
    })
  }, [query, specialistiche, patologie])

  return (
    <>
      {/* Search bar */}
      <div className="max-w-2xl mx-auto mb-10">
        <div className="relative group">
          <Search
            size={20}
            aria-hidden
            className="absolute left-5 top-1/2 -translate-y-1/2 text-primary/60 group-focus-within:text-primary transition-colors"
          />
          <label htmlFor="cerca-specialistiche" className="sr-only">
            Cerca una specialistica, una prestazione o una patologia
          </label>
          <input
            id="cerca-specialistiche"
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Cerca una specialistica, sotto-specialistica o patologia..."
            className="w-full bg-white border-2 border-primary/15 focus:border-primary rounded-full pl-14 pr-12 py-4 text-base md:text-lg font-medium text-text-main placeholder:text-text-main/70 outline-none transition-colors shadow-card"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery('')}
              className="absolute right-4 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full hover:bg-bg-soft flex items-center justify-center text-text-main/75 hover:text-text-main transition-colors"
              aria-label="Cancella ricerca"
            >
              <X size={18} />
            </button>
          )}
        </div>
        {/* Annunciato dai lettori di schermo mentre si scrive */}
        {query && (
          <p role="status" className="text-sm text-text-main/70 mt-3 text-center">
            {filtered.length === 0
              ? 'Nessuna specialistica trovata'
              : `${filtered.length} ${filtered.length === 1 ? 'risultato' : 'risultati'}`}
          </p>
        )}
      </div>

      {/* Grid */}
      {filtered.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((spec) => (
            <SpecialtyCard key={spec.id} spec={spec} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12 text-text-main/75">
          <p>Prova a cercare con termini diversi.</p>
        </div>
      )}

      <div className="flex justify-center mt-12 md:mt-16">
        <MelaButton href="/ambulatori" mela="welcome">
          Scopri tutte le specialistiche
        </MelaButton>
      </div>
    </>
  )
}
