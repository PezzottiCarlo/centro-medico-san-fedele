'use client'

import { useId } from 'react'

interface Props {
  attivo: boolean
  onCambia: (attivo: boolean) => void
  /** Testi dello stato acceso e spento, es. "Pubblicata" / "Bozza" */
  etichette?: [string, string]
  descrizioni?: [string, string]
}

/** Interruttore Pubblicato/Bozza dell'admin, con nome leggibile dagli screen reader. */
export function InterruttorePubblicazione({
  attivo,
  onCambia,
  etichette = ['Pubblicato', 'Bozza'],
  descrizioni = ['Visibile sul sito', 'Non visibile sul sito'],
}: Props) {
  const id = useId()
  return (
    <div className="flex items-center gap-3">
      <button
        type="button"
        role="switch"
        aria-checked={attivo}
        aria-labelledby={`${id}-titolo`}
        aria-describedby={`${id}-descr`}
        onClick={() => onCambia(!attivo)}
        className={`relative w-12 h-6 flex-shrink-0 rounded-full overflow-hidden transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-slate-800 ${
          attivo ? 'bg-primary' : 'bg-slate-600'
        }`}
      >
        <span
          aria-hidden
          className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all duration-200 ${
            attivo ? 'left-7' : 'left-1'
          }`}
        />
      </button>
      <div>
        <p id={`${id}-titolo`} className="font-medium text-white">
          {attivo ? etichette[0] : etichette[1]}
        </p>
        <p id={`${id}-descr`} className="text-xs text-slate-400">
          {attivo ? descrizioni[0] : descrizioni[1]}
        </p>
      </div>
    </div>
  )
}
