'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams, useSearchParams } from 'next/navigation'
import { doc, getDoc, updateDoc, deleteDoc } from 'firebase/firestore'
import { db } from '@/lib/firebase/client'
import { RichEditor } from '@/components/admin/RichEditor'
import { ImageUpload } from '@/components/admin/ImageUpload'
import { revalidatePublic } from '@/lib/revalidateClient'
import Link from 'next/link'
import { ArrowLeft, Loader2, Save, Trash2 } from 'lucide-react'

export default function EditStoriaPage() {
  const router = useRouter()
  const params = useParams()
  const searchParams = useSearchParams()
  const id = params.id as string
  const tipoParam = searchParams.get('tipo')

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [tipo, setTipo] = useState<'evento' | 'riconoscimento'>('evento')
  const [form, setForm] = useState({
    anno: '',
    titolo: '',
    descrizione: '',
    immagine: '',
    order: 0,
    pubblicato: false,
    sportivo: false,
  })

  useEffect(() => {
    async function load() {
      // Try riconoscimento first if param says so, otherwise try storia_eventi
      const collections = tipoParam === 'riconoscimento'
        ? ['riconoscimenti', 'storia_eventi']
        : ['storia_eventi', 'riconoscimenti']

      for (const coll of collections) {
        try {
          const snap = await getDoc(doc(db, coll, id))
          if (snap.exists()) {
            const data = snap.data()
            setTipo(coll === 'storia_eventi' ? 'evento' : 'riconoscimento')
            setForm({
              anno: data.anno || '',
              titolo: data.titolo || '',
              descrizione: data.descrizione || '',
              immagine: data.immagine || '',
              order: data.order ?? 0,
              pubblicato: data.pubblicato ?? false,
              sportivo: data.sportivo ?? false,
            })
            setLoading(false)
            return
          }
        } catch { /* continue */ }
      }
      setError('Elemento non trovato.')
      setLoading(false)
    }
    load()
  }, [id, tipoParam])

  function update(key: string, value: string | boolean | number) {
    setForm((f) => ({ ...f, [key]: value }))
  }

  async function handleSave() {
    if (!form.titolo || !form.descrizione) {
      setError('Titolo e descrizione sono obbligatori.')
      return
    }
    setSaving(true)
    setError('')
    try {
      const collectionName = tipo === 'evento' ? 'storia_eventi' : 'riconoscimenti'
      const data = tipo === 'evento'
        ? { anno: form.anno, titolo: form.titolo, descrizione: form.descrizione, immagine: form.immagine, order: form.order, pubblicato: form.pubblicato, sportivo: form.sportivo }
        : { anno: form.anno, titolo: form.titolo, descrizione: form.descrizione, pubblicato: form.pubblicato }
      await updateDoc(doc(db, collectionName, id), data)
      await revalidatePublic(['/storia', '/sport', '/'])
      router.push('/admin/dashboard/storia')
    } catch {
      setError('Errore durante il salvataggio.')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete() {
    if (!confirm('Sei sicuro di voler eliminare questo elemento?')) return
    setSaving(true)
    try {
      const collectionName = tipo === 'evento' ? 'storia_eventi' : 'riconoscimenti'
      await deleteDoc(doc(db, collectionName, id))
      await revalidatePublic(['/storia', '/sport', '/'])
      router.push('/admin/dashboard/storia')
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
            <Link href="/admin/dashboard/storia" className="text-slate-400 hover:text-primary">
              <ArrowLeft size={20} />
            </Link>
            <h1 className="font-semibold text-white">
              Modifica {tipo === 'evento' ? 'Evento Timeline' : 'Riconoscimento'}
            </h1>
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
                <label className="block text-sm font-medium text-slate-300 mb-1">Descrizione *</label>
                <RichEditor content={form.descrizione} onChange={(html) => update('descrizione', html)} />
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="bg-slate-800 rounded-lg border border-slate-700 p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Anno</label>
                <input
                  type="text"
                  value={form.anno}
                  onChange={(e) => update('anno', e.target.value)}
                  className="w-full bg-slate-700 border border-slate-600 text-white placeholder-slate-400 rounded px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              {tipo === 'evento' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1">Ordine</label>
                    <input
                      type="number"
                      value={form.order}
                      onChange={(e) => update('order', parseInt(e.target.value) || 0)}
                      className="w-full bg-slate-700 border border-slate-600 text-white rounded px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                    <p className="text-xs text-slate-500 mt-1">Numeri più bassi vengono mostrati prima</p>
                  </div>
                  <ImageUpload
                    value={form.immagine}
                    onChange={(url) => update('immagine', url)}
                    folder="storia"
                    label="Immagine"
                  />
                  <div className="flex items-center gap-3 pt-2 border-t border-slate-700">
                    <button
                      type="button"
                      role="switch"
                      aria-checked={form.sportivo}
                      onClick={() => update('sportivo', !form.sportivo)}
                      className={`relative w-12 h-6 rounded-full overflow-hidden transition-colors ${
                        form.sportivo ? 'bg-emerald-500' : 'bg-slate-600'
                      }`}
                    >
                      <span
                        className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all duration-200 ${
                          form.sportivo ? 'left-7' : 'left-1'
                        }`}
                      />
                    </button>
                    <div>
                      <span className="block text-sm font-medium text-slate-300">
                        Tappa di medicina sportiva
                      </span>
                      <span className="block text-xs text-slate-500">
                        Mostra questo evento nella timeline della pagina Sport
                      </span>
                    </div>
                  </div>
                </>
              )}
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
