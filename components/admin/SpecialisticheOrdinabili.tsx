'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { doc, writeBatch } from 'firebase/firestore'
import { db } from '@/lib/firebase/client'
import { revalidatePublic } from '@/lib/revalidateClient'
import { spostaSotto } from '@/lib/sottoSpecialistiche'
import { ListaOrdinabile } from '@/components/admin/ListaOrdinabile'
import { OrdineSottoControlli } from '@/components/admin/OrdineSottoControlli'
import { Edit2, Loader2, RotateCcw, Save } from 'lucide-react'

export interface SpecialisticaRiga {
  id: string
  nome: string
  slug: string
  icona?: string
  pubblicata?: boolean
}

/**
 * Elenco delle specialistiche nell'ordine del sito. Si riordina trascinando o
 * con le frecce; "Salva ordine" scrive `order` = 1, 2, 3, ... su ogni
 * specialistica. I valori salvati prima (anche non consecutivi, es. 0, 2, 5)
 * continuano a valere finché non si salva un nuovo ordine.
 */
export function SpecialisticheOrdinabili({ iniziali }: { iniziali: SpecialisticaRiga[] }) {
  const router = useRouter()
  const [elenco, setElenco] = useState(iniziali)
  const [salvataggio, setSalvataggio] = useState(false)
  const [errore, setErrore] = useState('')
  const [salvato, setSalvato] = useState(false)

  const modificato = elenco.some((s, i) => s.id !== iniziali[i]?.id)

  function riordina(nuovo: SpecialisticaRiga[]) {
    setElenco(nuovo)
    setSalvato(false)
  }

  async function salva() {
    setSalvataggio(true)
    setErrore('')
    try {
      const batch = writeBatch(db)
      elenco.forEach((s, i) => batch.update(doc(db, 'specialistiche', s.id), { order: i + 1 }))
      await batch.commit()
      await revalidatePublic(['/', '/ambulatori', '/prenota', '/patologie', '/medici'])
      setSalvato(true)
      // Riallinea la pagina server (e quindi `iniziali`) all'ordine appena salvato
      router.refresh()
    } catch {
      setErrore("Errore durante il salvataggio dell'ordine. Riprova.")
    } finally {
      setSalvataggio(false)
    }
  }

  if (elenco.length === 0) {
    return (
      <div className="bg-slate-800 rounded-lg border border-slate-700 text-center py-12 text-slate-500">
        Nessuna specialistica.
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-slate-400">
        L&apos;ordine qui sotto è quello del sito (home, servizi, prenotazione). Trascina dalla
        maniglia ⋮⋮ o usa le frecce, poi salva.
      </p>

      {(modificato || salvato || errore) && (
        <div
          className={`sticky top-2 z-30 flex flex-wrap items-center gap-3 rounded-lg border px-4 py-3 text-sm shadow-lg backdrop-blur ${
            errore
              ? 'border-red-500/30 bg-red-500/10 text-red-300'
              : modificato
              ? 'border-primary/40 bg-slate-800/95 text-slate-200'
              : 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300'
          }`}
          role="status"
        >
          <span className="flex-1">
            {errore || (modificato ? 'Ordine modificato, non ancora salvato.' : 'Ordine salvato.')}
          </span>
          {modificato && (
            <>
              <button
                type="button"
                onClick={() => riordina(iniziali)}
                disabled={salvataggio}
                className="inline-flex items-center gap-1.5 rounded px-3 py-1.5 text-slate-300 hover:bg-slate-700 hover:text-white"
              >
                <RotateCcw size={14} /> Annulla
              </button>
              <button
                type="button"
                onClick={salva}
                disabled={salvataggio}
                className="btn-primary inline-flex items-center gap-2 text-sm !py-1.5"
              >
                {salvataggio ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                Salva ordine
              </button>
            </>
          )}
        </div>
      )}

      <ListaOrdinabile
        elementi={elenco}
        onRiordina={riordina}
        className="space-y-2"
        renderElemento={(s, i, maniglia) => (
          <div className="flex items-center gap-2 sm:gap-3 rounded-lg border border-slate-700 bg-slate-800 py-2.5 pl-2 pr-3 sm:pr-4 hover:border-slate-600">
            {maniglia}
            <span className="text-2xl w-9 text-center flex-shrink-0">{s.icona}</span>
            <div className="min-w-0 flex-1">
              <p className="font-medium text-white truncate">
                {s.nome}
                {s.pubblicata === false && (
                  <span className="ml-2 align-middle rounded-full bg-slate-600 px-2 py-0.5 text-[11px] font-medium text-slate-300">
                    Bozza
                  </span>
                )}
              </p>
              <p className="text-xs text-slate-500 truncate">/ambulatori/{s.slug}</p>
            </div>
            <div className="hidden sm:block">
              <OrdineSottoControlli
                posizione={i}
                totale={elenco.length}
                nome={s.nome}
                onSposta={(a) => riordina(spostaSotto(elenco, i, a))}
              />
            </div>
            <Link
              href={`/admin/dashboard/specialistiche/${s.id}`}
              className="inline-flex items-center gap-1 text-primary text-sm hover:text-primary/80 transition-colors flex-shrink-0"
            >
              <Edit2 size={14} /> <span className="hidden sm:inline">Modifica</span>
            </Link>
          </div>
        )}
      />
    </div>
  )
}
