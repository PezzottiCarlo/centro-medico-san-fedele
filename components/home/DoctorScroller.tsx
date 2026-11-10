'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useRef } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'

interface Doctor {
  id: string
  nome: string
  slug: string
  foto: string
}

function openChatbot() {
  if (typeof window === 'undefined') return
  window.dispatchEvent(new CustomEvent('sanfedele:open-chat'))
}

// Le frecce compaiono al passaggio del mouse e quando ricevono il focus da
// tastiera: prima restavano invisibili anche mentre erano selezionate
const CLASSI_FRECCIA =
  'absolute top-1/2 -translate-y-1/2 z-10 w-11 h-11 rounded-full bg-white shadow-card-hover flex items-center justify-center opacity-0 group-hover:opacity-100 focus-visible:opacity-100 transition-opacity text-primary hover:bg-primary hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-primary'

export function DoctorScroller({ medici }: { medici: Doctor[] }) {
  const scrollRef = useRef<HTMLUListElement>(null)

  if (medici.length === 0) return null

  function scroll(direction: 'left' | 'right') {
    if (!scrollRef.current) return
    const amount = 220
    const ridotto = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    scrollRef.current.scrollBy({
      left: direction === 'left' ? -amount : amount,
      behavior: ridotto ? 'auto' : 'smooth',
    })
  }

  return (
    <div className="relative group">
      <button
        type="button"
        onClick={() => scroll('left')}
        className={`${CLASSI_FRECCIA} left-0`}
        aria-label="Scorri i medici a sinistra"
      >
        <ChevronLeft size={22} aria-hidden />
      </button>

      <ul
        ref={scrollRef}
        aria-label="I nostri medici"
        className="flex gap-6 overflow-x-auto scrollbar-hide snap-x snap-mandatory px-4 py-2"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {/* Chatbot mela card — primo elemento, apre chatbot con autofocus */}
        <li className="flex-shrink-0 snap-center">
          <button
            type="button"
            onClick={openChatbot}
            aria-haspopup="dialog"
            className="flex flex-col items-center gap-2 group/mela rounded-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-4"
          >
            <span className="relative w-24 h-24 md:w-28 md:h-28 rounded-full border-4 border-primary/30 group-hover/mela:border-primary transition-colors shadow-card overflow-hidden bg-gradient-to-br from-bg-soft to-white flex items-center justify-center">
              <Image
                src="/mela-idea.png"
                alt=""
                width={96}
                height={96}
                className="w-20 h-20 md:w-24 md:h-24 object-contain transition-transform group-hover/mela:scale-110"
              />
              <span aria-hidden className="absolute inset-0 rounded-full ring-2 ring-primary/0 group-hover/mela:ring-primary/30 transition-all" />
            </span>
            <span className="text-xs md:text-sm text-primary-dark font-bold text-center max-w-[110px] leading-tight">
              Chiedi al nostro assistente
            </span>
          </button>
        </li>

        {medici.map((m) => (
          <li key={m.id} className="flex-shrink-0 snap-center">
            <Link
              href={`/medici/${m.slug}`}
              className="flex flex-col items-center gap-2 group/item rounded-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-4"
            >
              <span className="block w-24 h-24 md:w-28 md:h-28 rounded-full overflow-hidden border-4 border-primary/15 group-hover/item:border-primary transition-colors shadow-card">
                {m.foto ? (
                  <Image
                    src={m.foto}
                    // Il nome è scritto subito sotto: niente doppia lettura
                    alt=""
                    width={112}
                    height={112}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span aria-hidden className="w-full h-full bg-primary/10 flex items-center justify-center text-primary text-2xl font-bold">
                    {m.nome.charAt(0)}
                  </span>
                )}
              </span>
              <span className="text-xs md:text-sm text-text-main font-semibold text-center max-w-[110px] leading-tight group-hover/item:text-primary transition-colors">
                {m.nome}
              </span>
            </Link>
          </li>
        ))}
      </ul>

      <button
        type="button"
        onClick={() => scroll('right')}
        className={`${CLASSI_FRECCIA} right-0`}
        aria-label="Scorri i medici a destra"
      >
        <ChevronRight size={22} aria-hidden />
      </button>
    </div>
  )
}
