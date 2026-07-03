'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { addDoc, collection } from 'firebase/firestore'
import { db } from '@/lib/firebase/client'
import { ImageUpload } from '@/components/admin/ImageUpload'
import { revalidatePublic } from '@/lib/revalidateClient'
import Link from 'next/link'
import { ArrowLeft, Loader2, Save } from 'lucide-react'

export default function NuovaConvenzione() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({
    nome: '',
    sottotitolo: '',
    logo: '',
    url: '',
    descrizione: '',
    attiva: true,
  })

  function update(key: string, value: string | boolean) {
    setForm((f) => ({ ...f, [key]: value }))
  }

  async function handleSave() {
    if (!form.nome) {
      setError('Il nome è obbligatorio.')
      return
    }
    setLoading(true)
    setError('')
    try {
      await addDoc(collection(db, 'convenzioni'), form)
      await revalidatePublic(['/convenzioni', '/'])
      router.push('/admin/dashboard/convenzioni')
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
            <Link href="/admin/dashboard/convenzioni" className="text-slate-400 hover:text-primary">
              <ArrowLeft size={20} />
            </Link>
            <h1 className="font-semibold text-white">Nuova Convenzione</h1>
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
            <label className="block text-sm font-medium text-slate-300 mb-1">Nome *</label>
            <input
              type="text"
              value={form.nome}
              onChange={(e) => update('nome', e.target.value)}
              className="w-full bg-slate-700 border border-slate-600 text-white placeholder-slate-400 rounded px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="es. Unisalute"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Sconto / beneficio</label>
            <input
              type="text"
              value={form.sottotitolo}
              onChange={(e) => update('sottotitolo', e.target.value)}
              className="w-full bg-slate-700 border border-slate-600 text-white placeholder-slate-400 rounded px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="es. Sconto 30% sulle visite"
            />
            <p className="text-xs text-slate-400 mt-1">Mostrato sotto il nome nella card e nel dettaglio.</p>
          </div>
          <ImageUpload
            value={form.logo}
            onChange={(url) => update('logo', url)}
            folder="convenzioni"
            label="Logo"
          />
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Sito web</label>
            <input
              type="url"
              value={form.url}
              onChange={(e) => update('url', e.target.value)}
              className="w-full bg-slate-700 border border-slate-600 text-white placeholder-slate-400 rounded px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="https://..."
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Descrizione</label>
            <textarea
              value={form.descrizione}
              onChange={(e) => update('descrizione', e.target.value)}
              className="w-full bg-slate-700 border border-slate-600 text-white placeholder-slate-400 rounded px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary resize-none"
              rows={3}
              placeholder="Descrizione della convenzione..."
            />
          </div>
          <div className="flex items-center gap-3 pt-2">
            <button
              type="button"
              role="switch"
              aria-checked={form.attiva}
              onClick={() => update('attiva', !form.attiva)}
              className={`relative w-12 h-6 rounded-full overflow-hidden transition-colors ${
                form.attiva ? 'bg-emerald-500' : 'bg-slate-600'
              }`}
            >
              <span className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all duration-200 ${
                form.attiva ? 'left-7' : 'left-1'
              }`} />
            </button>
            <span className="text-sm font-medium text-slate-300">
              {form.attiva ? 'Attiva' : 'Non attiva'}
            </span>
          </div>
        </div>
      </main>
    </div>
  )
}
