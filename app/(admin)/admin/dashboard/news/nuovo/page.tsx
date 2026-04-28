'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { addDoc, collection } from 'firebase/firestore'
import { db } from '@/lib/firebase/client'
import { slugify } from '@/lib/utils'
import { RichEditor } from '@/components/admin/RichEditor'
import { ImageUpload } from '@/components/admin/ImageUpload'
import Link from 'next/link'
import { ArrowLeft, Loader2, Save } from 'lucide-react'

export default function NuovaNewsPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({
    titolo: '',
    slug: '',
    corpo: '',
    categoria: 'news' as 'news' | 'evento' | 'articolo',
    autore: '',
    immagine: '',
    pubblicato: false,
    dataPublicazione: new Date().toISOString().split('T')[0],
  })

  function update(key: string, value: string | boolean) {
    setForm((f) => {
      const updated = { ...f, [key]: value }
      if (key === 'titolo' && typeof value === 'string') {
        updated.slug = slugify(value)
      }
      return updated
    })
  }

  async function handleSave() {
    if (!form.titolo || !form.corpo) {
      setError('Titolo e contenuto sono obbligatori.')
      return
    }
    setLoading(true)
    setError('')
    try {
      await addDoc(collection(db, 'news_eventi'), {
        ...form,
        dataPublicazione: new Date(form.dataPublicazione).toISOString(),
      })
      router.push('/admin/dashboard/news')
    } catch {
      setError('Errore durante il salvataggio.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-900">
      <header className="bg-slate-800 border-b border-slate-700 sticky top-0 z-30 backdrop-blur supports-[backdrop-filter]:bg-slate-800/90">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/admin/dashboard/news" className="text-slate-400 hover:text-primary">
              <ArrowLeft size={20} />
            </Link>
            <h1 className="font-semibold text-white">Nuovo Articolo</h1>
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
                  placeholder="Titolo dell'articolo"
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
                  placeholder="Nome autore"
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
