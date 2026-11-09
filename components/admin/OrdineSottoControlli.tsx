'use client'

import type { ReactNode } from 'react'
import { ArrowUp, ArrowDown, ChevronsUp, ChevronsDown } from 'lucide-react'

interface Props {
  posizione: number
  totale: number
  nome: string
  onSposta: (nuovaPosizione: number) => void
}

const bottone =
  'p-1.5 rounded text-slate-400 hover:text-white hover:bg-slate-600 disabled:opacity-25 disabled:hover:bg-transparent disabled:hover:text-slate-400 disabled:cursor-not-allowed transition-colors'

/** Numero di posizione e frecce per spostare una sotto-specialistica nell'elenco. */
export function OrdineSottoControlli({ posizione, totale, nome, onSposta }: Props) {
  const etichetta = nome.trim() || 'questa terapia'
  const prima = posizione === 0
  const ultima = posizione === totale - 1
  return (
    <div className="flex items-center gap-0.5">
      <span
        className="mr-1 min-w-[1.75rem] rounded bg-slate-600 px-1.5 py-0.5 text-center text-xs font-semibold text-slate-200"
        title="Posizione sul sito"
      >
        {posizione + 1}
      </span>
      <button type="button" className={bottone} disabled={prima} onClick={() => onSposta(0)} aria-label={`Porta ${etichetta} in cima`} title="In cima">
        <ChevronsUp size={16} />
      </button>
      <button type="button" className={bottone} disabled={prima} onClick={() => onSposta(posizione - 1)} aria-label={`Sposta su ${etichetta}`} title="Su">
        <ArrowUp size={16} />
      </button>
      <button type="button" className={bottone} disabled={ultima} onClick={() => onSposta(posizione + 1)} aria-label={`Sposta giù ${etichetta}`} title="Giù">
        <ArrowDown size={16} />
      </button>
      <button type="button" className={bottone} disabled={ultima} onClick={() => onSposta(totale - 1)} aria-label={`Porta ${etichetta} in fondo`} title="In fondo">
        <ChevronsDown size={16} />
      </button>
    </div>
  )
}

/** Riga compatta della modalità riordino: maniglia, nome e frecce. */
export function RigaRiordino({
  maniglia,
  posizione,
  totale,
  nome,
  onSposta,
}: Props & { maniglia: ReactNode }) {
  return (
    <div className="flex items-center gap-2 rounded-lg bg-slate-700/60 py-1.5 pl-1.5 pr-2 hover:bg-slate-700">
      {maniglia}
      <span className={`flex-1 truncate text-sm ${nome.trim() ? 'text-white' : 'italic text-slate-500'}`}>
        {nome.trim() || 'Senza nome'}
      </span>
      <OrdineSottoControlli posizione={posizione} totale={totale} nome={nome} onSposta={onSposta} />
    </div>
  )
}
