'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { doc, getDoc, updateDoc, deleteDoc } from 'firebase/firestore'
import { db } from '@/lib/firebase/client'
import { ImageUpload } from '@/components/admin/ImageUpload'
import { revalidatePublic } from '@/lib/revalidateClient'
import Link from 'next/link'
import { ArrowLeft, Loader2, Save, Trash2 } from 'lucide-react'

export default function EditConvenzionePage() {
  const router = useRouter()
  const params = useParams()
  const id = params.id as string
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({
    nome: '',
    sottotitolo: '',
    logo: '',
    url: '',
    descrizione: '',
    attiva: true,
  })

  useEffect(() => {
    async function load() {
      try {
        const snap = await getDoc(doc(db, 'convenzioni', id))
        if (!snap.exists()) {
          setError('Convenzione non trovata.')
          setLoading(false)
          return
        }
        const data = snap.data()
        setForm({
          nome: data.nome || '',
          sottotitolo: data.sottotitolo || '',
          logo: data.logo || '',
          url: data.url || '',
          descrizione: data.descrizione || '',
          attiva: data.attiva ?? true,
        })
      } catch {
        setError('Errore nel caricamento.')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [id])

  function update(key: string, value: string | boolean) {
    setForm((f) => ({ ...f, [key]: value }))
  }

  async function handleSave() {
    if (!form.nome) {
      setError('Il nome è obbligatorio.')
      return
    }
    setSaving(true)
    setError('')
    try {
      await updateDoc(doc(db, 'convenzioni', id), { ...form })
      await revalidatePublic(['/convenzioni', '/'])
      router.push('/admin/dashboard/convenzioni')
    } catch {
      setError('Errore durante il salvataggio.')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete() {
    if (!confirm('Sei sicuro di voler eliminare questa convenzione?')) return
    setSaving(true)
    try {
      await deleteDoc(doc(db, 'convenzioni', id))
      await revalidatePublic(['/convenzioni', '/'])
      router.push('/admin/dashboard/convenzioni')
    } catch {
      setError('Errore durante l\'eliminazione.')
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <Loader2 size={32} className="animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-900">
      <header className="bg-slate-800 border-b border-slate-700 sticky top-0 z-30 backdrop-blur supports-[backdrop-filter]:bg-slate-800/90">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/admin/dashboard/convenzioni" className="text-slate-400 hover:text-primary">
              <ArrowLeft size={20} />
            </Link>
            <h1 className="font-semibold text-white">Modifica Convenzione</h1>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleDelete}
              disabled={saving}
              className="flex items-center gap-2 text-sm px-4 py-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded transition-colors"
            >
              <Trash2 size={16} /> Elimina
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="btn-primary flex items-center gap-2 text-sm"
            >
              {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
              Salva
            </button>
          </div>
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
