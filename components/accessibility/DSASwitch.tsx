'use client'

import { useId } from 'react'
import { useAccessibility } from '@/hooks/useAccessibility'
import { Eye, Type } from 'lucide-react'
import { cn } from '@/lib/utils'

/**
 * Interruttore con etichetta e descrizione collegate: il lettore di schermo
 * annuncia "Modalità DSA, interruttore, attivo" e la spiegazione sotto.
 */
function Interruttore({
  etichetta,
  descrizione,
  attivo,
  onCambia,
  dark,
  colore,
}: {
  etichetta: string
  descrizione: string
  attivo: boolean
  onCambia: () => void
  dark: boolean
  colore: 'secondario' | 'primario'
}) {
  const id = useId()
  const sfondoAttivo = colore === 'secondario' ? 'bg-secondary-dark' : 'bg-primary'
  const anello = colore === 'secondario' ? 'focus-visible:ring-secondary-dark' : 'focus-visible:ring-primary'
  return (
    <div className="flex items-center justify-between gap-4">
      <div>
        <p id={`${id}-etichetta`} className={cn('font-medium', dark ? 'text-white' : 'text-text-main')}>
          {etichetta}
        </p>
        <p id={`${id}-descrizione`} className={cn('text-sm', dark ? 'text-white/70' : 'text-gray-600')}>
          {descrizione}
        </p>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={attivo}
        aria-labelledby={`${id}-etichetta`}
        aria-describedby={`${id}-descrizione`}
        onClick={onCambia}
        data-interruttore
        className={cn(
          'relative w-12 h-6 shrink-0 rounded-full overflow-hidden transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
          anello,
          // Spento: grigio scuro, così il controllo si distingue dal fondo (3:1)
          attivo ? sfondoAttivo : dark ? 'bg-white/40' : 'bg-gray-500'
        )}
      >
        <span
          aria-hidden
          className={cn(
            'absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all duration-200',
            attivo ? 'left-7' : 'left-1'
          )}
        />
      </button>
    </div>
  )
}

/**
 * @param dark  Palette per i fondali scuri (menu mobile delle pagine dark):
 *              senza, i titoli in `text-text-main` sparirebbero sullo slate.
 */
export function DSASwitch({
  compact = false,
  dark = false,
}: {
  compact?: boolean
  dark?: boolean
}) {
  const { dsaMode, highContrast, toggleDsaMode, toggleHighContrast } = useAccessibility()

  if (compact) {
    return (
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={toggleDsaMode}
          className={cn(
            'p-2 rounded-lg text-sm font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-secondary-dark',
            dsaMode ? 'bg-secondary-dark text-white' : 'bg-muted text-text-main hover:bg-secondary/20'
          )}
          aria-pressed={dsaMode}
          aria-label="Modalità DSA: font Lexend e spaziatura aumentata"
          title="Modalità DSA"
        >
          <Type size={16} aria-hidden />
        </button>
        <button
          type="button"
          onClick={toggleHighContrast}
          className={cn(
            'p-2 rounded-lg text-sm font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary',
            highContrast ? 'bg-primary text-white' : 'bg-muted text-text-main hover:bg-primary/20'
          )}
          aria-pressed={highContrast}
          aria-label="Alto contrasto"
          title="Alto contrasto"
        >
          <Eye size={16} aria-hidden />
        </button>
      </div>
    )
  }

  return (
    <div className={cn('rounded-lg p-6', dark ? 'bg-white/5' : 'bg-secondary/10')}>
      <h3 className={cn('font-semibold mb-4', dark ? 'text-white' : 'text-text-main')}>
        Accessibilità
      </h3>
      <div className="space-y-4">
        <Interruttore
          etichetta="Modalità DSA"
          descrizione="Font Lexend, spaziatura aumentata"
          attivo={dsaMode}
          onCambia={toggleDsaMode}
          dark={dark}
          colore="secondario"
        />
        <Interruttore
          etichetta="Alto contrasto"
          descrizione="Maggior leggibilità del testo"
          attivo={highContrast}
          onCambia={toggleHighContrast}
          dark={dark}
          colore="primario"
        />
      </div>
    </div>
  )
}
