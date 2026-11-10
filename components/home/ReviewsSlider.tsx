'use client'

import { useState } from 'react'
import { Star, ChevronLeft, ChevronRight, Quote } from 'lucide-react'
import { cn } from '@/lib/utils'
import { formatDate } from '@/lib/utils'

interface Review {
  autore: string
  testo: string
  stelle: number
  data: string
  fonte: 'google' | 'editoriale'
}

export function ReviewsSlider({ reviews }: { reviews: Review[] }) {
  const [current, setCurrent] = useState(0)

  if (!reviews.length) return null

  const prev = () => setCurrent((c) => (c - 1 + reviews.length) % reviews.length)
  const next = () => setCurrent((c) => (c + 1) % reviews.length)

  const r = reviews[current]

  return (
    <div className="relative max-w-3xl mx-auto">
      {/* Al cambio di recensione il lettore di schermo legge la nuova */}
      <div className="bg-white rounded-lg shadow-card p-8 md:p-12" aria-live="polite">
        {reviews.length > 1 && (
          <p className="sr-only">
            Recensione {current + 1} di {reviews.length}
          </p>
        )}
        <Quote size={32} className="text-primary/30 mb-4" aria-hidden />

        <div className="flex gap-1 mb-4" role="img" aria-label={`${Math.round(r.stelle)} stelle su 5`}>
          {Array.from({ length: 5 }).map((_, i) => (
            <Star
              key={i}
              aria-hidden
              size={20}
              className={cn(
                'fill-current',
                i < Math.round(r.stelle) ? 'text-yellow-400' : 'text-gray-200'
              )}
            />
          ))}
        </div>

        <blockquote className="text-lg text-text-main leading-relaxed mb-6 italic">
          "{r.testo}"
        </blockquote>

        <div className="flex items-center justify-between">
          <div>
            <p className="font-semibold text-text-main">{r.autore}</p>
            <p className="text-sm text-gray-500">
              {formatDate(r.data)}{' '}
              {r.fonte === 'google' && (
                <span className="ml-1 text-primary-dark">via Google</span>
              )}
            </p>
          </div>

          {reviews.length > 1 && (
          <div className="flex gap-2">
            <button
              type="button"
              onClick={prev}
              className="p-2 rounded-full bg-muted hover:bg-primary/10 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              aria-label="Recensione precedente"
            >
              <ChevronLeft size={20} aria-hidden />
            </button>
            <button
              type="button"
              onClick={next}
              className="p-2 rounded-full bg-muted hover:bg-primary/10 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              aria-label="Recensione successiva"
            >
              <ChevronRight size={20} aria-hidden />
            </button>
          </div>
          )}
        </div>
      </div>

      {/* Pallini: il punto resta piccolo, l'area da toccare è di 24 px */}
      {reviews.length > 1 && (
      <div className="flex justify-center gap-1 mt-4">
        {reviews.map((_, i) => (
          <button
            key={i}
            type="button"
            onClick={() => setCurrent(i)}
            className="group flex h-6 w-6 items-center justify-center rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            aria-label={`Vai alla recensione ${i + 1}`}
            aria-current={i === current ? 'true' : undefined}
          >
            <span
              aria-hidden
              className={cn(
                'w-2 h-2 rounded-full transition-colors',
                i === current ? 'bg-primary scale-125' : 'bg-gray-400 group-hover:bg-gray-500'
              )}
            />
          </button>
        ))}
      </div>
      )}
    </div>
  )
}
