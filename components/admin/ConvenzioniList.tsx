'use client'

import { useState } from 'react'
import { doc, deleteDoc, updateDoc } from 'firebase/firestore'
import { db } from '@/lib/firebase/client'
import type { Convenzione } from '@/types'
import { Trash2, ExternalLink, Pencil } from 'lucide-react'
import Link from 'next/link'

export function ConvenzioniList({ initial }: { initial: Convenzione[] }) {
  const [items, setItems] = useState(initial)
  const [loading, setLoading] = useState<string | null>(null)

  async function toggleAttiva(id: string, current: boolean) {
    setLoading(id)
    try {
      await updateDoc(doc(db, 'convenzioni', id), { attiva: !current })
      setItems((prev) => prev.map((c) => (c.id === id ? { ...c, attiva: !current } : c)))
    } finally {
      setLoading(null)
    }
  }

  async function handleDelete(id: string, nome: string) {
    if (!confirm(`Eliminare "${nome}"?`)) return
    setLoading(id)
    try {
      await deleteDoc(doc(db, 'convenzioni', id))
      setItems((prev) => prev.filter((c) => c.id !== id))
    } finally {
      setLoading(null)
    }
  }

  if (items.length === 0) {
    return (
      <div className="text-center py-12 text-slate-500">
        <p>Nessuna convenzione. Aggiungine una.</p>
      </div>
    )
  }

  return (
    <table className="w-full">
      <thead className="bg-slate-800/50 border-b border-slate-700">
        <tr>
          <th className="text-left px-6 py-3 text-xs font-medium text-slate-400 uppercase tracking-wider">Nome</th>
          <th className="text-left px-6 py-3 text-xs font-medium text-slate-400 uppercase tracking-wider hidden md:table-cell">URL</th>
          <th className="text-center px-6 py-3 text-xs font-medium text-slate-400 uppercase tracking-wider">Attiva</th>
          <th className="text-right px-6 py-3 text-xs font-medium text-slate-400 uppercase tracking-wider">Azioni</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-slate-700/50">
        {items.map((c) => (
          <tr key={c.id} className="hover:bg-slate-700/30 transition-colors">
            <td className="px-6 py-4">
              <div className="flex items-center gap-3">
                {c.logo && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={c.logo} alt={c.nome} className="h-8 w-16 object-contain rounded bg-white p-1" />
                )}
                <span className="font-medium text-white">{c.nome}</span>
              </div>
            </td>
            <td className="px-6 py-4 hidden md:table-cell text-sm text-slate-500">
              {c.url ? (
                <a href={c.url} target="_blank" rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-primary hover:text-primary/80 transition-colors">
                  <ExternalLink size={12} /> {c.url}
                </a>
              ) : '—'}
            </td>
            <td className="px-6 py-4 text-center">
              <button
                onClick={() => toggleAttiva(c.id, c.attiva)}
                disabled={loading === c.id}
                className={`relative w-10 h-5 rounded-full overflow-hidden transition-colors ${
                  c.attiva ? 'bg-emerald-500' : 'bg-slate-600'
                }`}
              >
                <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all duration-200 ${
                  c.attiva ? 'left-5' : 'left-0.5'
                }`} />
              </button>
            </td>
            <td className="px-6 py-4 text-right">
              <div className="inline-flex items-center gap-1">
                <Link
                  href={`/admin/dashboard/convenzioni/${c.id}`}
                  className="text-slate-400 hover:text-primary p-1 transition-colors"
                  aria-label={`Modifica ${c.nome}`}
                >
                  <Pencil size={16} />
                </Link>
                <button
                  onClick={() => handleDelete(c.id, c.nome)}
                  disabled={loading === c.id}
                  className="text-red-400/60 hover:text-red-400 p-1 transition-colors"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}
