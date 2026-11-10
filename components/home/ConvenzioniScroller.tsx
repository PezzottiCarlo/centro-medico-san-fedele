'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Pause, Play } from 'lucide-react'
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

function Elenco({ convenzioni, copia }: { convenzioni: Convenzione[]; copia?: boolean }) {
  return (
    <ul
      // La copia serve solo a chiudere il giro: il lettore di schermo legge
      // l'elenco una volta sola. Con il movimento ridotto non serve proprio.
      aria-hidden={copia || undefined}
      className={`flex shrink-0 motion-reduce:flex-wrap motion-reduce:justify-center motion-reduce:shrink ${
        copia ? 'motion-reduce:hidden' : ''
      }`}
    >
      {convenzioni.map((c) => (
        <li key={c.id} className="flex-shrink-0 flex items-center justify-center w-48 h-20 mx-6 my-2">
          {c.logo ? (
            <Image
              src={c.logo}
              alt={copia ? '' : c.nome}
              width={160}
              height={60}
              className="object-contain max-h-16 grayscale hover:grayscale-0 transition-all duration-300"
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center rounded-lg bg-bg-soft border border-primary/10 px-3 py-2 hover:border-primary/40 transition-colors">
              <span aria-hidden className="text-2xl md:text-3xl font-bold text-primary tracking-tight leading-none">
                {getInitials(c.nome)}
              </span>
              <span className="mt-1 text-[10px] font-medium text-text-main/80 uppercase tracking-wide text-center line-clamp-1">
                {c.nome}
              </span>
            </div>
          )}
        </li>
      ))}
    </ul>
  )
}

/**
 * Nastro di loghi che scorre da solo. Si ferma al passaggio del mouse e con
 * il bottone Pausa (scorrimento automatico oltre i 5 secondi: WCAG 2.2.2); con
 * "riduci movimento" attivo nel sistema i loghi stanno fermi, su più righe.
 */
export function ConvenzioniScroller({ convenzioni }: Props) {
  const [inPausa, setInPausa] = useState(false)
  if (convenzioni.length === 0) return null

  return (
    <div className="relative w-full">
      <div className="relative w-full overflow-hidden">
        {/* Sfumature ai bordi */}
        <div aria-hidden className="pointer-events-none absolute inset-y-0 left-0 w-20 bg-gradient-to-r from-white to-transparent z-10 motion-reduce:hidden" />
        <div aria-hidden className="pointer-events-none absolute inset-y-0 right-0 w-20 bg-gradient-to-l from-white to-transparent z-10 motion-reduce:hidden" />

        <div
          className="flex w-max animate-scroll hover:[animation-play-state:paused] motion-reduce:animate-none motion-reduce:w-full"
          style={inPausa ? { animationPlayState: 'paused' } : undefined}
        >
          <Elenco convenzioni={convenzioni} />
          <Elenco convenzioni={convenzioni} copia />
        </div>
      </div>

      <div className="container-main flex justify-end mt-2 motion-reduce:hidden">
        <button
          type="button"
          onClick={() => setInPausa((v) => !v)}
          className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold text-gray-600 hover:bg-bg-soft hover:text-text-main transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        >
          {inPausa ? <Play size={12} aria-hidden /> : <Pause size={12} aria-hidden />}
          {inPausa ? 'Riprendi lo scorrimento' : 'Ferma lo scorrimento'}
        </button>
      </div>
    </div>
  )
}
