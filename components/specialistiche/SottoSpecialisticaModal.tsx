'use client'

import { useEffect } from 'react'
import { X } from 'lucide-react'
import { MelaButton } from '@/components/ui/MelaButton'

interface Props {
  nome: string
  descrizione?: string
  specNome: string
  icona: string
  prenotaHref: string
  onClose: () => void
}

/**
 * Scheda di una sotto-specialistica: descrizione e invito a prenotare. Usata
 * nelle pagine specialistica, medico e DSA, così il paziente resta sulla
 * pagina invece di essere mandato altrove.
 */
export function SottoSpecialisticaModal({
  nome,
  descrizione,
  specNome,
  icona,
  prenotaHref,
  onClose,
}: Props) {
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [onClose])

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label={nome}
      onClick={onClose}
    >
      <div
        className="absolute inset-0 bg-text-main/50 backdrop-blur-sm"
        style={{ animation: 'modalFade .2s ease' }}
      />
      <div
        className="relative w-full max-w-lg max-h-[calc(100svh-2rem)] overflow-y-auto bg-white rounded-2xl shadow-card-hover"
        style={{ animation: 'modalPop .25s ease' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="h-1.5 bg-gradient-to-r from-primary/70 via-primary to-primary-dark" />
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-9 h-9 rounded-full bg-bg-soft hover:bg-bg-deep text-text-main flex items-center justify-center transition-colors"
          aria-label="Chiudi"
        >
          <X size={18} />
        </button>

        <div className="p-7 md:p-8">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary rounded-full px-3 py-1 mb-4 mr-10">
            {icona && <span className="text-lg leading-none">{icona}</span>}
            <span className="text-xs font-semibold tracking-wide uppercase">{specNome}</span>
          </div>

          <h3 className="text-2xl font-semibold text-text-main mb-3">{nome}</h3>

          <p className="text-gray-600 leading-relaxed whitespace-pre-line">
            {descrizione?.trim() ||
              'Per questa prestazione non è ancora disponibile una descrizione dettagliata. Prenota una visita: il nostro team saprà guidarti nel percorso più adatto.'}
          </p>

          <div className="mt-7">
            <MelaButton href={prenotaHref} mela="indica" melaSize="md">
              Prenota una visita
            </MelaButton>
          </div>
        </div>
      </div>
    </div>
  )
}
