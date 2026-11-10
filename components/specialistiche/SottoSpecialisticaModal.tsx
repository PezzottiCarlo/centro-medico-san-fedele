'use client'

import { Modale } from '@/components/ui/Modale'
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
  return (
    <Modale
      titolo={nome}
      onChiudi={onClose}
      fascia="bg-gradient-to-r from-primary/70 via-primary to-primary-dark"
    >
      <div className="p-7 md:p-8">
        <div className="inline-flex items-center gap-2 bg-primary/10 text-primary-dark rounded-full px-3 py-1 mb-4 mr-12">
          {icona && <span className="text-lg leading-none" aria-hidden>{icona}</span>}
          <span className="text-xs font-semibold tracking-wide uppercase">{specNome}</span>
        </div>

        <h2 className="text-2xl font-semibold text-text-main mb-3">{nome}</h2>

        <p className="text-gray-700 leading-relaxed whitespace-pre-line">
          {descrizione?.trim() ||
            'Per questa prestazione non è ancora disponibile una descrizione dettagliata. Prenota una visita: il nostro team saprà guidarti nel percorso più adatto.'}
        </p>

        <div className="mt-7">
          <MelaButton href={prenotaHref} mela="indica" melaSize="md">
            Prenota una visita
          </MelaButton>
        </div>
      </div>
    </Modale>
  )
}
