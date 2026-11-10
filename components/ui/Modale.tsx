'use client'

import { useEffect, useRef, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { X } from 'lucide-react'

// Più modali (o modale + menu) possono bloccare lo scroll insieme: si sblocca
// solo quando l'ultima si chiude, invece di riattivarlo alla prima chiusura
let blocchiScroll = 0
let overflowOriginale = ''

function bloccaScroll() {
  if (blocchiScroll === 0) {
    overflowOriginale = document.body.style.overflow
    document.body.style.overflow = 'hidden'
  }
  blocchiScroll++
}

function sbloccaScroll() {
  blocchiScroll = Math.max(0, blocchiScroll - 1)
  if (blocchiScroll === 0) document.body.style.overflow = overflowOriginale
}

const FOCUSABILI =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'

interface Props {
  titolo: string
  onChiudi: () => void
  children: ReactNode
  /** "chiaro" per le pagine normali, "scuro" per Medicina sportiva */
  tema?: 'chiaro' | 'scuro'
  /** Fascia colorata in cima alla finestra */
  fascia?: string
  /** Finestra più larga, per testi lunghi (schede delle patologie) */
  larga?: boolean
}

/**
 * Finestra modale accessibile, unica per tutto il sito (prima ce n'erano tre
 * copie, ognuna con un pezzo mancante):
 * - il focus entra nella finestra, ci resta (Tab e Maiusc+Tab girano dentro)
 *   e alla chiusura torna al bottone che l'ha aperta;
 * - Esc o un clic fuori la chiudono;
 * - il contenuto scorre dentro la finestra sui telefoni piccoli;
 * - sta sopra header e chatbot;
 * - viene disegnata direttamente nel <body>: aperta da dentro una card con
 *   `backdrop-blur` o `transform` (glass-card, hover:-translate-y) il
 *   `position: fixed` restava chiuso nella card invece di coprire la pagina.
 */
export function Modale({ titolo, onChiudi, children, tema = 'chiaro', fascia, larga = false }: Props) {
  const finestra = useRef<HTMLDivElement>(null)
  const chiudi = useRef(onChiudi)
  chiudi.current = onChiudi

  useEffect(() => {
    const prima = document.activeElement as HTMLElement | null
    bloccaScroll()
    // Il focus va sul primo elemento utile (di solito "Chiudi")
    const primi = finestra.current?.querySelectorAll<HTMLElement>(FOCUSABILI)
    ;(primi?.[0] ?? finestra.current)?.focus()

    function suTasto(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        e.preventDefault()
        chiudi.current()
        return
      }
      if (e.key !== 'Tab' || !finestra.current) return
      const elementi = Array.from(finestra.current.querySelectorAll<HTMLElement>(FOCUSABILI))
      if (elementi.length === 0) return
      const primo = elementi[0]
      const ultimo = elementi[elementi.length - 1]
      if (e.shiftKey && document.activeElement === primo) {
        e.preventDefault()
        ultimo.focus()
      } else if (!e.shiftKey && document.activeElement === ultimo) {
        e.preventDefault()
        primo.focus()
      }
    }
    document.addEventListener('keydown', suTasto)
    return () => {
      document.removeEventListener('keydown', suTasto)
      sbloccaScroll()
      prima?.focus?.()
    }
  }, [])

  const scuro = tema === 'scuro'

  // Si apre solo dopo un'azione nel browser: sul server non viene mai disegnata
  if (typeof document === 'undefined') return null

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div
        aria-hidden
        onClick={onChiudi}
        className={`absolute inset-0 backdrop-blur-sm motion-safe:animate-[modalFade_.2s_ease] ${
          scuro ? 'bg-slate-950/70' : 'bg-text-main/50'
        }`}
      />
      <div
        ref={finestra}
        role="dialog"
        aria-modal="true"
        aria-label={titolo}
        tabIndex={-1}
        className={`relative w-full ${larga ? 'max-w-2xl' : 'max-w-lg'} max-h-[calc(100svh-2rem)] overflow-y-auto overscroll-contain rounded-2xl shadow-2xl focus:outline-none motion-safe:animate-[modalPop_.25s_ease] ${
          scuro ? 'bg-slate-900 border border-slate-800 text-white' : 'bg-white text-text-main'
        }`}
      >
        {fascia && <div aria-hidden className={`h-1.5 ${fascia}`} />}
        <button
          type="button"
          onClick={onChiudi}
          aria-label="Chiudi"
          // z-10: un'immagine in cima al contenuto (schede patologie) la copriva
          className={`absolute right-4 top-4 z-10 flex h-10 w-10 items-center justify-center rounded-full transition-colors focus:outline-none focus-visible:ring-2 ${
            scuro
              ? 'bg-slate-800 text-slate-200 hover:bg-slate-700 focus-visible:ring-emerald-400'
              : 'bg-bg-soft text-text-main hover:bg-bg-deep focus-visible:ring-primary'
          }`}
        >
          <X size={18} aria-hidden />
        </button>
        {children}
      </div>
    </div>,
    document.body
  )
}
