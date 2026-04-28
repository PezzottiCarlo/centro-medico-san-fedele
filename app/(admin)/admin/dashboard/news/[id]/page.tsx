'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { doc, getDoc, updateDoc, deleteDoc } from 'firebase/firestore'
import { db } from '@/lib/firebase/client'
import { RichEditor } from '@/components/admin/RichEditor'
import { ImageUpload } from '@/components/admin/ImageUpload'
import Link from 'next/link'
import { ArrowLeft, Loader2, Save, Trash2 } from 'lucide-react'

export default function EditNewsPage() {
  const router = useRouter()
  const params = useParams()
  const id = params.id as string
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({
    titolo: '',
    slug: '',
    corpo: '',
    categoria: 'news' as 'news' | 'evento' | 'articolo',
    autore: '',
    immagine: '',
    pubblicato: false,
    dataPublicazione: '',
  })

  useEffect(() => {
    async function load() {
      try {
        const snap = await getDoc(doc(db, 'news_eventi', id))
        if (!snap.exists()) {
          setError('Articolo non trovato.')
          setLoading(false)
          return
        }
        const data = snap.data()
        setForm({
          titolo: data.titolo || '',
          slug: data.slug || '',
          corpo: data.corpo || '',
          categoria: data.categoria || 'news',
          autore: data.autore || '',
          immagine: data.immagine || '',
          pubblicato: data.pubblicato ?? false,
          dataPublicazione: data.dataPublicazione ? new Date(data.dataPublicazione).toISOString().split('T')[0] : '',
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
    if (!form.titolo || !form.corpo) {
      setError('Titolo e contenuto sono obbligatori.')
      return
    }
    setSaving(true)
    setError('')
    try {
      await updateDoc(doc(db, 'news_eventi', id), {
        ...form,
        dataPublicazione: new Date(form.dataPublicazione).toISOString(),
      })
      router.push('/admin/dashboard/news')
    } catch {
      setError('Errore durante il salvataggio.')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete() {
    if (!confirm('Sei sicuro di voler eliminare questo articolo?')) return
    setSaving(true)
    try {
      await deleteDoc(doc(db, 'news_eventi', id))
      router.push('/admin/dashboard/news')
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
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/admin/dashboard/news" className="text-slate-400 hover:text-primary">
              <ArrowLeft size={20} />
            </Link>
            <h1 className="font-semibold text-white">Modifica Articolo</h1>
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
              Salva modifiche
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8">
        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 rounded p-3 mb-4 text-sm">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-slate-800 rounded-lg border border-slate-700 p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Titolo *</label>
                <input
                  type="text"
                  value={form.titolo}
                  onChange={(e) => update('titolo', e.target.value)}
                  className="w-full bg-slate-700 border border-slate-600 text-white placeholder-slate-400 rounded px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Slug</label>
                <input
                  type="text"
                  value={form.slug}
                  onChange={(e) => update('slug', e.target.value)}
                  className="w-full bg-slate-700 border border-slate-600 text-white placeholder-slate-400 rounded px-4 py-3 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Contenuto *</label>
                <RichEditor content={form.corpo} onChange={(html) => update('corpo', html)} />
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="bg-slate-800 rounded-lg border border-slate-700 p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Categoria</label>
                <select
                  value={form.categoria}
                  onChange={(e) => update('categoria', e.target.value)}
                  className="w-full bg-slate-700 border border-slate-600 text-white rounded px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="news">News</option>
                  <option value="evento">Evento</option>
                  <option value="articolo">Articolo</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Data pubblicazione</label>
                <input
                  type="date"
                  value={form.dataPublicazione}
                  onChange={(e) => update('dataPublicazione', e.target.value)}
                  className="w-full bg-slate-700 border border-slate-600 text-white rounded px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Autore</label>
                <input
                  type="text"
                  value={form.autore}
                  onChange={(e) => update('autore', e.target.value)}
                  className="w-full bg-slate-700 border border-slate-600 text-white placeholder-slate-400 rounded px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <ImageUpload
                value={form.immagine}
                onChange={(url) => update('immagine', url)}
                folder="news"
                label="Immagine"
              />
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  role="switch"
                  aria-checked={form.pubblicato}
                  onClick={() => update('pubblicato', !form.pubblicato)}
                  className={`relative w-12 h-6 rounded-full overflow-hidden transition-colors ${
                    form.pubblicato ? 'bg-primary' : 'bg-slate-600'
                  }`}
                >
                  <span
                    className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all duration-200 ${
                      form.pubblicato ? 'left-7' : 'left-1'
                    }`}
                  />
                </button>
                <span className="text-sm font-medium text-slate-300">
                  {form.pubblicato ? 'Pubblicato' : 'Bozza'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
