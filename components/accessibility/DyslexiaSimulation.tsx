'use client'

import { useEffect, useMemo, useState } from 'react'
import { Eye, EyeOff } from 'lucide-react'

const SAMPLE_TEXT =
  'Leggere non è sempre lineare. Per chi vive con la dislessia, le lettere possono sembrare in movimento, accavallarsi o cambiare forma sotto gli occhi.'

interface LetterStyle {
  transform: string
  letterSpacing: string
  fontSize: string
  color?: string
}

function randomStyle(intensity: number): LetterStyle {
  const tx = (Math.random() - 0.5) * 8 * intensity
  const ty = (Math.random() - 0.5) * 8 * intensity
  const rot = (Math.random() - 0.5) * 20 * intensity
  const scale = 1 + (Math.random() - 0.5) * 0.6 * intensity
  const skew = (Math.random() - 0.5) * 15 * intensity
  const spacing = (Math.random() - 0.5) * 0.3 * intensity
  const fontScale = 1 + (Math.random() - 0.5) * 0.5 * intensity
  return {
    transform: `translate(${tx.toFixed(1)}px, ${ty.toFixed(1)}px) rotate(${rot.toFixed(1)}deg) scale(${scale.toFixed(2)}) skewX(${skew.toFixed(1)}deg)`,
    letterSpacing: `${spacing.toFixed(2)}em`,
    fontSize: `${fontScale.toFixed(2)}em`,
  }
}

export function DyslexiaSimulation() {
  const [active, setActive] = useState(true)
  const [tick, setTick] = useState(0)
  const letters = useMemo(() => SAMPLE_TEXT.split(''), [])

  useEffect(() => {
    if (!active) return
    const interval = setInterval(() => setTick((t) => t + 1), 2600)
    return () => clearInterval(interval)
  }, [active])

  // Regenerate styles on every tick
  const styles = useMemo(
    () =>
      letters.map((ch) => (ch === ' ' ? null : randomStyle(active ? 1 : 0))),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [tick, active, letters.length]
  )

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
          onClick={() => setActive((v) => !v)}
          className="inline-flex items-center gap-2 bg-primary text-white font-semibold text-sm px-4 py-2 rounded-full hover:bg-primary-dark transition-colors"
        >
          {active ? (
            <>
              <EyeOff size={16} /> Ferma l'effetto
            </>
          ) : (
            <>
              <Eye size={16} /> Mostra l'effetto
            </>
          )}
        </button>
      </div>

      <div className="px-6 md:px-10 py-10 md:py-14 min-h-[180px] flex items-center justify-center">
        <p
          className="text-xl md:text-3xl font-medium text-text-main leading-relaxed text-center"
          aria-label={SAMPLE_TEXT}
          style={{ fontFamily: 'Georgia, serif' }}
        >
          {letters.map((ch, i) =>
            ch === ' ' ? (
              <span key={i}> </span>
            ) : (
              <span
                key={i}
                aria-hidden="true"
                className="inline-block transition-all duration-[2600ms] ease-in-out"
                style={{
                  transform: styles[i]?.transform,
                  letterSpacing: styles[i]?.letterSpacing,
                  fontSize: styles[i]?.fontSize,
                  willChange: 'transform',
                }}
              >
                {ch}
              </span>
            )
          )}
        </p>
      </div>

      <p className="text-xs md:text-sm text-text-main/60 px-6 pb-5 text-center font-medium">
        Questa simulazione è indicativa: la dislessia si manifesta in modo diverso per ogni persona.
      </p>
    </div>
  )
}
