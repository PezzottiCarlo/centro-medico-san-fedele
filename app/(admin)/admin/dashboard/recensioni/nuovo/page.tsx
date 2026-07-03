'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { addDoc, collection } from 'firebase/firestore'
import { db } from '@/lib/firebase/client'
import { revalidatePublic } from '@/lib/revalidateClient'
import Link from 'next/link'
import { ArrowLeft, Loader2, Save, Star } from 'lucide-react'

export default function NuovaRecensione() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({
    autore: '',
    testo: '',
    stelle: 5,
    data: new Date().toISOString().split('T')[0],
    fonte: 'editoriale' as const,
  })

  function update(key: string, value: string | number) {
    setForm((f) => ({ ...f, [key]: value }))
  }

  async function handleSave() {
    if (!form.autore || !form.testo) {
      setError('Autore e testo sono obbligatori.')
      return
    }
    setLoading(true)
    setError('')
    try {
      await addDoc(collection(db, 'recensioni_statiche'), form)
      await revalidatePublic(['/'])
      router.push('/admin/dashboard/recensioni')
    } catch {
      setError('Errore durante il salvataggio.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-900">
      <header className="bg-slate-800 border-b border-slate-700 sticky top-0 z-30 backdrop-blur supports-[backdrop-filter]:bg-slate-800/90">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/admin/dashboard/recensioni" className="text-slate-400 hover:text-primary">
              <ArrowLeft size={20} />
            </Link>
            <h1 className="font-semibold text-white">Nuova Recensione Editoriale</h1>
          </div>
          <button
            onClick={handleSave}
            disabled={loading}
            className="btn-primary flex items-center gap-2 text-sm"
          >
            {loading ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
            Salva
          </button>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-8">
        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 rounded p-3 mb-4 text-sm">{error}</div>
        )}

        <div className="bg-slate-800 rounded-lg border border-slate-700 p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Nome paziente *</label>
            <input
              type="text"
              value={form.autore}
              onChange={(e) => update('autore', e.target.value)}
              className="w-full bg-slate-700 border border-slate-600 text-white placeholder-slate-400 rounded px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="es. Mario R."
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Testo recensione *</label>
            <textarea
              value={form.testo}
              onChange={(e) => update('testo', e.target.value)}
              rows={4}
              className="w-full bg-slate-700 border border-slate-600 text-white placeholder-slate-400 rounded px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary resize-none"
              placeholder="Scrivi il testo della recensione..."
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Valutazione</label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => update('stelle', n)}
                  className="p-1"
                >
                  <Star
                    size={28}
                    className={n <= form.stelle ? 'text-yellow-400 fill-yellow-400' : 'text-slate-600 fill-slate-600'}
                  />
                </button>
              ))}
              <span className="ml-2 self-center text-sm text-slate-400">{form.stelle}/5</span>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Data</label>
            <input
              type="date"
              value={form.data}
              onChange={(e) => update('data', e.target.value)}
              className="w-full bg-slate-700 border border-slate-600 text-white rounded px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
        </div>
      </main>
    </div>
  )
}
