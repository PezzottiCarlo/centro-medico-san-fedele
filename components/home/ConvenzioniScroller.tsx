'use client'

import Image from 'next/image'
import type { Convenzione } from '@/types'

interface Props {
  convenzioni: Convenzione[]
}

function getInitials(nome: string): string {
  const words = nome.trim().split(/\s+/).filter(Boolean)
  if (words.length === 0) return '?'
  if (words.length === 1) return words[0].charAt(0).toUpperCase()
  return words
    .slice(0, 3)
    .map((w) => w.charAt(0).toUpperCase())
    .join('')
}

export function ConvenzioniScroller({ convenzioni }: Props) {
  if (convenzioni.length === 0) return null

  // Duplicate for seamless infinite loop
  const items = [...convenzioni, ...convenzioni]

  return (
    <div className="relative w-full overflow-hidden">
      {/* Fade edges */}
      <div className="pointer-events-none absolute inset-y-0 left-0 w-20 bg-gradient-to-r from-white to-transparent z-10" />
      <div className="pointer-events-none absolute inset-y-0 right-0 w-20 bg-gradient-to-l from-white to-transparent z-10" />

      <div className="flex animate-scroll w-max">
        {items.map((c, i) => (
          <div
            key={i}
            className="flex-shrink-0 flex items-center justify-center w-48 h-20 mx-6"
            title={c.nome}
          >
            {c.logo ? (
              <Image
                src={c.logo}
                alt={c.nome}
                width={160}
                height={60}
                className="object-contain max-h-16 grayscale hover:grayscale-0 transition-all duration-300"
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center rounded-lg bg-bg-soft border border-primary/10 px-3 py-2 hover:border-primary/40 transition-colors">
                <span className="text-2xl md:text-3xl font-bold text-primary tracking-tight leading-none">
                  {getInitials(c.nome)}
                </span>
                <span className="mt-1 text-[10px] font-medium text-text-main/70 uppercase tracking-wide text-center line-clamp-1">
                  {c.nome}
                </span>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
