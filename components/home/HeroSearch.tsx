'use client'

import { useSearch } from '@/hooks/useSearch'
import { useRouter } from 'next/navigation'
import { Search, Loader2 } from 'lucide-react'
import { specialisticaHref } from '@/lib/utils'

const TYPE_LABELS = {
  medico: 'Medico',
  specialistica: 'Specialistica',
  patologia: 'Patologia',
}

function resultHref(type: 'medico' | 'specialistica' | 'patologia', slug: string): string {
  if (type === 'medico') return `/medici/${slug}`
  if (type === 'patologia') return `/patologie/${slug}`
  return specialisticaHref(slug)
}

export function HeroSearch() {
  const { query, setQuery, results, loading } = useSearch()
  const router = useRouter()

  return (
    <div className="relative w-full max-w-2xl">
      <div className="relative">
        <Search
          size={20}
          className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
        />
        {loading && (
          <Loader2
            size={20}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-primary animate-spin"
          />
        )}
        <input
          type="search"
          placeholder="Cerca medico, specialistica o patologia..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full pl-12 pr-12 py-4 text-base rounded-lg border border-gray-200 shadow-card focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-white"
          aria-label="Cerca"
          aria-autocomplete="list"
          aria-expanded={results.length > 0}
        />
      </div>

      {results.length > 0 && (
        <div className="absolute top-full left-0 right-0 bg-white rounded-lg shadow-card-hover border border-gray-100 mt-2 overflow-hidden z-50">
          {results.map((r) => (
            <button
              key={`${r.type}-${r.id}`}
              className="w-full flex items-start gap-3 px-4 py-3 hover:bg-muted text-left transition-colors"
              onClick={() => {
                router.push(resultHref(r.type, r.slug))
                setQuery('')
              }}
            >
              <span className="text-xs font-medium text-primary bg-primary/10 px-2 py-0.5 rounded-full mt-0.5 whitespace-nowrap">
                {TYPE_LABELS[r.type]}
              </span>
              <div>
                <p className="font-medium text-text-main">{r.nome}</p>
                {r.descrizione && (
                  <p className="text-sm text-gray-500 mt-0.5">{r.descrizione}</p>
                )}
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
