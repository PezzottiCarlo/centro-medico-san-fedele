'use client'

import { useMemo, useState } from 'react'
import { doc, updateDoc } from 'firebase/firestore'
import { db } from '@/lib/firebase/client'
import type { Lead } from '@/types'
import { formatDate } from '@/lib/utils'
import { Phone, Mail, MessageSquare, CheckCircle2, RotateCcw, Loader2 } from 'lucide-react'

type Filter = 'tutti' | 'da-evadere' | 'evasi'

export function LeadsList({ initial }: { initial: Lead[] }) {
  const [leads, setLeads] = useState<Lead[]>(initial)
  const [filter, setFilter] = useState<Filter>('da-evadere')
  const [busy, setBusy] = useState<string | null>(null)
  const [error, setError] = useState('')

  const counts = useMemo(
    () => ({
      tutti: leads.length,
      'da-evadere': leads.filter((l) => !l.evaso).length,
      evasi: leads.filter((l) => l.evaso).length,
    }),
    [leads]
  )

  const visible = useMemo(() => {
    if (filter === 'tutti') return leads
    if (filter === 'evasi') return leads.filter((l) => l.evaso)
    return leads.filter((l) => !l.evaso)
  }, [leads, filter])

  async function toggleEvaso(lead: Lead) {
    setBusy(lead.id)
    setError('')
    const next = !lead.evaso
    const evasoIl = next ? new Date().toISOString() : ''
    try {
      await updateDoc(doc(db, 'leads', lead.id), {
        evaso: next,
        evasoIl,
        letto: true,
      })
      setLeads((prev) =>
        prev.map((l) =>
          l.id === lead.id ? { ...l, evaso: next, evasoIl: evasoIl || undefined, letto: true } : l
        )
      )
    } catch (err) {
      const msg = err instanceof Error ? err.message : ''
      if (msg.includes('permission') || msg.includes('PERMISSION_DENIED')) {
        setError(
          'Permessi Firestore mancanti: esegui "firebase deploy --only firestore:rules" per abilitare la gestione lead.'
        )
      } else {
        setError("Errore durante l'aggiornamento. Riprova.")
      }
    } finally {
      setBusy(null)
    }
  }

  const filterButton = (key: Filter, label: string) => (
    <button
      key={key}
      onClick={() => setFilter(key)}
      className={`px-3 py-1.5 text-xs sm:text-sm rounded-full transition-colors flex items-center gap-2 ${
        filter === key
          ? 'bg-primary text-white'
          : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
      }`}
    >
      {label}
      <span
        className={`text-[10px] sm:text-xs px-1.5 py-0.5 rounded-full ${
          filter === key ? 'bg-white/20' : 'bg-slate-800/80'
        }`}
      >
        {counts[key]}
      </span>
    </button>
  )

  return (
    <div>
      <div className="flex flex-wrap gap-2 mb-5">
        {filterButton('da-evadere', 'Da evadere')}
        {filterButton('evasi', 'Evasi')}
        {filterButton('tutti', 'Tutti')}
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 rounded p-3 mb-4 text-sm">
          {error}
        </div>
      )}

      {visible.length === 0 ? (
        <div className="bg-slate-800 rounded-lg border border-slate-700 p-10 sm:p-12 text-center text-slate-500">
          <MessageSquare size={40} className="mx-auto mb-3 opacity-30" />
          <p>
            {filter === 'da-evadere' && 'Tutte le richieste sono state evase. Buon lavoro!'}
            {filter === 'evasi' && 'Nessuna richiesta evasa ancora.'}
            {filter === 'tutti' && 'Nessuna richiesta ricevuta ancora.'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {visible.map((lead) => {
            const isBusy = busy === lead.id
            const evaso = !!lead.evaso
            return (
              <div
                key={lead.id}
                className={`bg-slate-800 rounded-lg border border-slate-700 p-4 sm:p-5 transition-opacity ${
                  evaso ? 'opacity-60' : ''
                } ${!lead.letto && !evaso ? 'border-l-4 border-l-primary' : ''}`}
              >
                <div className="flex flex-wrap items-start justify-between gap-3 sm:gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <h3 className={`font-semibold text-white ${evaso ? 'line-through' : ''}`}>
                        {lead.nome}
                        {lead.cognome ? ` ${lead.cognome}` : ''}
                      </h3>
                      {!lead.letto && !evaso && (
                        <span className="text-xs bg-primary/20 text-primary px-2 py-0.5 rounded-full">
                          Nuovo
                        </span>
                      )}
                      {evaso && (
                        <span className="text-xs bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full flex items-center gap-1">
                          <CheckCircle2 size={12} /> Evaso
                        </span>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-3 sm:gap-4 text-sm text-slate-400">
                      <a
                        href={`tel:${lead.telefono}`}
                        className="flex items-center gap-1 hover:text-primary transition-colors"
                      >
                        <Phone size={14} /> {lead.telefono}
                      </a>
                      <a
                        href={`mailto:${lead.email}`}
                        className="flex items-center gap-1 hover:text-primary transition-colors break-all"
                      >
                        <Mail size={14} /> {lead.email}
                      </a>
                    </div>
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {lead.specialistica && (
                        <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                          {lead.specialistica}
                        </span>
                      )}
                      {lead.sottoSpecialistica && (
                        <span className="text-xs bg-sky-500/10 text-sky-300 px-2 py-0.5 rounded-full">
                          {lead.sottoSpecialistica}
                        </span>
                      )}
                      {lead.medico && (
                        <span className="text-xs bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded-full">
                          Medico: {lead.medico}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="text-right text-xs text-slate-500 flex-shrink-0">
                    <p>{formatDate(lead.timestamp)}</p>
                    {evaso && lead.evasoIl && (
                      <p className="text-emerald-500/70 mt-1">
                        Evaso il {formatDate(lead.evasoIl)}
                      </p>
                    )}
                  </div>
                </div>

                {lead.messaggio && (
                  <p className="mt-3 text-slate-300 text-sm bg-slate-700/50 rounded p-3 whitespace-pre-wrap break-words">
                    {lead.messaggio}
                  </p>
                )}

                <div className="mt-4 flex flex-wrap gap-2 justify-end">
                  <button
                    onClick={() => toggleEvaso(lead)}
                    disabled={isBusy}
                    className={`inline-flex items-center gap-2 px-4 py-2 rounded text-sm font-semibold transition-all min-h-[40px] disabled:opacity-50 ${
                      evaso
                        ? 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                        : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950'
                    }`}
                  >
                    {isBusy ? (
                      <Loader2 size={16} className="animate-spin" />
                    ) : evaso ? (
                      <RotateCcw size={16} />
                    ) : (
                      <CheckCircle2 size={16} />
                    )}
                    {evaso ? 'Riapri' : 'Segna come evasa'}
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
