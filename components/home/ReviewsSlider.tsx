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
      <div className="bg-white rounded-lg shadow-card p-8 md:p-12">
        <Quote size={32} className="text-primary/30 mb-4" />

        <div className="flex gap-1 mb-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star
              key={i}
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
            <p className="text-sm text-gray-400">
              {formatDate(r.data)}{' '}
              {r.fonte === 'google' && (
                <span className="ml-1 text-blue-500">via Google</span>
              )}
            </p>
          </div>

          <div className="flex gap-2">
            <button
              onClick={prev}
              className="p-2 rounded-full bg-muted hover:bg-primary/10 transition-colors"
              aria-label="Recensione precedente"
            >
              <ChevronLeft size={20} />
            </button>
            <button
              onClick={next}
              className="p-2 rounded-full bg-muted hover:bg-primary/10 transition-colors"
              aria-label="Recensione successiva"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        </div>
      </div>

      {/* Dots */}
      <div className="flex justify-center gap-2 mt-4">
        {reviews.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            className={cn(
              'w-2 h-2 rounded-full transition-colors',
              i === current ? 'bg-primary' : 'bg-gray-300'
            )}
            aria-label={`Vai alla recensione ${i + 1}`}
          />
        ))}
      </div>
    </div>
  )
}
