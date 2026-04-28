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

export function DoctorScroller({ medici }: { medici: Doctor[] }) {
  const scrollRef = useRef<HTMLDivElement>(null)

  if (medici.length === 0) return null

  function scroll(direction: 'left' | 'right') {
    if (!scrollRef.current) return
    const amount = 220
    scrollRef.current.scrollBy({
      left: direction === 'left' ? -amount : amount,
      behavior: 'smooth',
    })
  }

  return (
    <div className="relative group">
      <button
        onClick={() => scroll('left')}
        className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-11 h-11 rounded-full bg-white shadow-card-hover flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-primary hover:bg-primary hover:text-white"
        aria-label="Scorri a sinistra"
      >
        <ChevronLeft size={22} />
      </button>

      <div
        ref={scrollRef}
        className="flex gap-6 overflow-x-auto scrollbar-hide snap-x snap-mandatory px-4 py-2"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {/* Chatbot mela card — primo elemento, apre chatbot con autofocus */}
        <button
          type="button"
          onClick={openChatbot}
          className="flex-shrink-0 snap-center flex flex-col items-center gap-2 group/mela focus:outline-none"
          aria-label="Apri assistente virtuale"
        >
          <div className="relative w-24 h-24 md:w-28 md:h-28 rounded-full border-4 border-primary/30 hover:border-primary transition-colors shadow-card overflow-hidden bg-gradient-to-br from-bg-soft to-white flex items-center justify-center">
            <Image
              src="/mela-idea.png"
              alt=""
              width={96}
              height={96}
              className="w-20 h-20 md:w-24 md:h-24 object-contain transition-transform group-hover/mela:scale-110"
            />
            <span className="absolute inset-0 rounded-full ring-2 ring-primary/0 group-hover/mela:ring-primary/30 transition-all" />
          </div>
          <span className="text-xs md:text-sm text-primary font-bold text-center max-w-[110px] leading-tight">
            Chiedi al<br />nostro assistente
          </span>
        </button>

        {medici.map((m) => (
          <Link
            key={m.id}
            href={`/medici/${m.slug}`}
            className="flex-shrink-0 snap-center flex flex-col items-center gap-2 group/item"
          >
            <div className="w-24 h-24 md:w-28 md:h-28 rounded-full overflow-hidden border-4 border-primary/15 hover:border-primary transition-colors shadow-card">
              {m.foto ? (
                <Image
                  src={m.foto}
                  alt={m.nome}
                  width={112}
                  height={112}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-primary/10 flex items-center justify-center text-primary text-2xl font-bold">
                  {m.nome.charAt(0)}
                </div>
              )}
            </div>
            <span className="text-xs md:text-sm text-text-main font-semibold text-center max-w-[110px] leading-tight group-hover/item:text-primary transition-colors">
              {m.nome}
            </span>
          </Link>
        ))}
      </div>

      <button
        onClick={() => scroll('right')}
        className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-11 h-11 rounded-full bg-white shadow-card-hover flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-primary hover:bg-primary hover:text-white"
        aria-label="Scorri a destra"
      >
        <ChevronRight size={22} />
      </button>
    </div>
  )
}
