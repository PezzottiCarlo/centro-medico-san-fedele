'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { Eye, EyeOff } from 'lucide-react'

const SAMPLE_TEXT =
  'Leggere non è sempre lineare. Per chi vive con la dislessia, le lettere possono sembrare in movimento, accavallarsi o cambiare forma sotto gli occhi.'

// Solo `transform`: cambiando dimensione o spaziatura delle lettere il testo
// andrebbe a capo in modo diverso a ogni ciclo e il riquadro cambierebbe
// altezza, trascinando su e giù tutta la pagina. Le trasformazioni invece non
// toccano l'impaginazione, quindi il box resta fermo.
function randomTransform(intensity: number): string {
  const tx = (Math.random() - 0.5) * 8 * intensity
  const ty = (Math.random() - 0.5) * 8 * intensity
  const rot = (Math.random() - 0.5) * 20 * intensity
  // Scala della lettera e variazione di "corpo" del carattere, in un solo fattore
  const scale = (1 + (Math.random() - 0.5) * 0.6 * intensity) * (1 + (Math.random() - 0.5) * 0.5 * intensity)
  const skew = (Math.random() - 0.5) * 15 * intensity
  return `translate(${tx.toFixed(1)}px, ${ty.toFixed(1)}px) rotate(${rot.toFixed(1)}deg) scale(${scale.toFixed(2)}) skewX(${skew.toFixed(1)}deg)`
}

export function DyslexiaSimulation() {
  const letters = useMemo(() => SAMPLE_TEXT.split(''), [])
  const [active, setActive] = useState(true)
  // Al primo disegno (server e client) le lettere stanno ferme: i valori
  // casuali calcolati durante il render erano diversi tra server e browser
  // e React segnalava l'errore di idratazione.
  const [styles, setStyles] = useState<(string | null)[]>([])

  const primoGiro = useRef(true)

  useEffect(() => {
    // Con "riduci movimento" attivo nel sistema l'effetto parte spento
    if (primoGiro.current) {
      primoGiro.current = false
      if (active && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        setActive(false)
        return
      }
    }
    const genera = () =>
      setStyles(letters.map((ch) => (ch === ' ' ? null : randomTransform(active ? 1 : 0))))
    genera()
    if (!active) return
    const interval = setInterval(genera, 2600)
    return () => clearInterval(interval)
  }, [active, letters])

  return (
    <div className="bg-white rounded-lg border-2 border-primary/15 shadow-card overflow-hidden">
      <div className="bg-bg-soft px-6 py-4 flex items-center justify-between border-b border-primary/10 flex-wrap gap-3">
        <div>
          <p className="text-primary uppercase text-xs tracking-widest font-bold mb-1">
            Esperienza empatica
          </p>
          <h3 className="text-lg md:text-xl font-extrabold text-text-main leading-tight">
            Come può apparire un testo a chi è dislessico
          </h3>
        </div>
        <button
          type="button"
          onClick={() => setActive((v) => !v)}
          className="inline-flex items-center gap-2 bg-primary text-white font-semibold text-sm px-4 py-2 rounded-full hover:bg-primary-dark transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
        >
          {active ? (
            <>
              <EyeOff size={16} aria-hidden /> Ferma l&apos;effetto
            </>
          ) : (
            <>
              <Eye size={16} aria-hidden /> Mostra l&apos;effetto
            </>
          )}
        </button>
      </div>

      <div className="px-6 md:px-10 py-10 md:py-14 min-h-[180px] flex items-center justify-center">
        <p
          className="text-xl md:text-3xl font-medium text-text-main leading-relaxed text-center"
          style={{ fontFamily: 'Georgia, serif' }}
        >
          {/* Il lettore di schermo legge la frase intera, non lettera per lettera */}
          <span className="sr-only">{SAMPLE_TEXT}</span>
          <span aria-hidden="true">
          {letters.map((ch, i) =>
            ch === ' ' ? (
              <span key={i}> </span>
            ) : (
              <span
                key={i}
                className="inline-block transition-transform duration-[2600ms] ease-in-out"
                style={{ transform: styles[i] ?? undefined, willChange: 'transform' }}
              >
                {ch}
              </span>
            )
          )}
          </span>
        </p>
      </div>

      <p className="text-xs md:text-sm text-text-main/75 px-6 pb-5 text-center font-medium">
        Questa simulazione è indicativa: la dislessia si manifesta in modo diverso per ogni persona.
      </p>
    </div>
  )
}
