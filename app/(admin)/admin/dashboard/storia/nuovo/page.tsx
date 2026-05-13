'use client'

import { Suspense, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { addDoc, collection } from 'firebase/firestore'
import { db } from '@/lib/firebase/client'
import { RichEditor } from '@/components/admin/RichEditor'
import { ImageUpload } from '@/components/admin/ImageUpload'
import Link from 'next/link'
import { ArrowLeft, Loader2, Save } from 'lucide-react'

export default function NuovaStoriaPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-900" />}>
      <NuovaStoriaForm />
    </Suspense>
  )
}

function NuovaStoriaForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const tipo = searchParams.get('tipo') || 'evento'

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [tipoCorrente, setTipoCorrente] = useState<'evento' | 'riconoscimento'>(
    tipo === 'riconoscimento' ? 'riconoscimento' : 'evento'
  )

  const [form, setForm] = useState({
    anno: new Date().getFullYear().toString(),
    titolo: '',
    descrizione: '',
    immagine: '',
    order: 0,
    pubblicato: false,
    sportivo: false,
  })

  function update(key: string, value: string | boolean | number) {
    setForm((f) => ({ ...f, [key]: value }))
  }

  async function handleSave() {
    if (!form.titolo || !form.descrizione) {
      setError('Anno, titolo e descrizione sono obbligatori.')
      return
    }
    setLoading(true)
    setError('')
    try {
      const collectionName = tipoCorrente === 'evento' ? 'storia_eventi' : 'riconoscimenti'
      const data = tipoCorrente === 'evento'
        ? { anno: form.anno, titolo: form.titolo, descrizione: form.descrizione, immagine: form.immagine, order: form.order, pubblicato: form.pubblicato, sportivo: form.sportivo }
        : { anno: form.anno, titolo: form.titolo, descrizione: form.descrizione, pubblicato: form.pubblicato }
      await addDoc(collection(db, collectionName), data)
      router.push('/admin/dashboard/storia')
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
            <Link href="/admin/dashboard/storia" className="text-slate-400 hover:text-primary">
              <ArrowLeft size={20} />
            </Link>
            <h1 className="font-semibold text-white">Nuovo elemento storia</h1>
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
                  placeholder="Es: Fondazione del centro"
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
                <label className="block text-sm font-medium text-slate-300 mb-1">Tipo</label>
                <select
                  value={tipoCorrente}
                  onChange={(e) => setTipoCorrente(e.target.value as 'evento' | 'riconoscimento')}
                  className="w-full bg-slate-700 border border-slate-600 text-white rounded px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="evento">Evento Timeline</option>
                  <option value="riconoscimento">Riconoscimento / Premio</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Anno *</label>
                <input
                  type="text"
                  value={form.anno}
                  onChange={(e) => update('anno', e.target.value)}
                  className="w-full bg-slate-700 border border-slate-600 text-white placeholder-slate-400 rounded px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="2024"
                />
              </div>
              {tipoCorrente === 'evento' && (
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
