'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { addDoc, collection } from 'firebase/firestore'
import { db } from '@/lib/firebase/client'
import { slugify } from '@/lib/utils'
import { RichEditor } from '@/components/admin/RichEditor'
import { ImageUpload } from '@/components/admin/ImageUpload'
import { revalidatePublic } from '@/lib/revalidateClient'
import Link from 'next/link'
import { ArrowLeft, Loader2, Save, Plus, Trash2 } from 'lucide-react'
import type { SottoSpecialistica } from '@/types'

export default function NuovaSpecialisticaPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({
    nome: '',
    slug: '',
    icona: '',
    descrizioneBreve: '',
    descrizione: '',
    metaTitle: '',
    metaDescription: '',
    order: 0,
    sottoSpecialistiche: [] as SottoSpecialistica[],
    immagine: '',
  })

  function update(key: string, value: string | number | SottoSpecialistica[]) {
    setForm((f) => {
      const updated = { ...f, [key]: value }
      if (key === 'nome' && typeof value === 'string') {
        updated.slug = slugify(value)
        if (!f.metaTitle) updated.metaTitle = value
      }
      return updated
    })
  }

  function addSottoSpecialistica() {
    update('sottoSpecialistiche', [
      ...form.sottoSpecialistiche,
      { id: crypto.randomUUID(), nome: '' },
    ])
  }

  function updateSottoSpecialisticaNome(index: number, value: string) {
    const updated = [...form.sottoSpecialistiche]
    updated[index] = { ...updated[index], nome: value }
    update('sottoSpecialistiche', updated)
  }

  function updateSottoSpecialisticaDescrizione(index: number, value: string) {
    const updated = [...form.sottoSpecialistiche]
    updated[index] = { ...updated[index], descrizione: value }
    update('sottoSpecialistiche', updated)
  }

  function updateSottoSpecialisticaGenere(index: number, value: SottoSpecialistica['genere']) {
    const updated = [...form.sottoSpecialistiche]
    updated[index] = { ...updated[index], genere: value }
    update('sottoSpecialistiche', updated)
  }

  function removeSottoSpecialistica(index: number) {
    update('sottoSpecialistiche', form.sottoSpecialistiche.filter((_, i) => i !== index))
  }

  async function handleSave() {
    if (!form.nome || !form.descrizioneBreve) {
      setError('Nome e descrizione breve sono obbligatori.')
      return
    }
    setLoading(true)
    setError('')
    try {
      await addDoc(collection(db, 'specialistiche'), form)
      await revalidatePublic(['/ambulatori', `/ambulatori/${form.slug}`, '/sport', '/'])
      router.push('/admin/dashboard/specialistiche')
    } catch {
      setError('Errore durante il salvataggio.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-900">
      <header className="bg-slate-800 border-b border-slate-700 sticky top-0 z-30 backdrop-blur supports-[backdrop-filter]:bg-slate-800/90">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/admin/dashboard/specialistiche" className="text-slate-400 hover:text-primary">
              <ArrowLeft size={20} />
            </Link>
            <h1 className="font-semibold text-white">Nuova Specialistica</h1>
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

      <main className="max-w-3xl mx-auto px-4 py-8 space-y-6">
        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 rounded p-3 text-sm">
            {error}
          </div>
        )}

        {/* Dati principali */}
        <div className="bg-slate-800 rounded-lg border border-slate-700 p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-300 mb-1">Nome *</label>
              <input
                type="text"
                value={form.nome}
                onChange={(e) => update('nome', e.target.value)}
                className="w-full bg-slate-700 border border-slate-600 text-white placeholder-slate-400 rounded px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="es. Cardiologia"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Icona (emoji)</label>
              <input
                type="text"
                value={form.icona}
                onChange={(e) => update('icona', e.target.value)}
                className="w-full bg-slate-700 border border-slate-600 text-white rounded px-4 py-3 text-2xl text-center focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
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
            <label className="block text-sm font-medium text-slate-300 mb-1">Ordine</label>
            <input
              type="number"
              value={form.order}
              onChange={(e) => update('order', parseInt(e.target.value) || 0)}
              className="w-full bg-slate-700 border border-slate-600 text-white rounded px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Descrizione breve * (per card)</label>
            <textarea
              value={form.descrizioneBreve}
              onChange={(e) => update('descrizioneBreve', e.target.value)}
              rows={2}
              className="w-full bg-slate-700 border border-slate-600 text-white placeholder-slate-400 rounded px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary resize-none"
              placeholder="Breve descrizione per la card..."
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Descrizione completa</label>
            <div className="bg-white rounded overflow-hidden">
              <RichEditor content={form.descrizione} onChange={(html) => update('descrizione', html)} />
            </div>
          </div>
          <ImageUpload
            value={form.immagine}
            onChange={(url) => update('immagine', url)}
            folder="specialistiche"
            label="Immagine hero (sfondo dietro il titolo della pagina)"
          />
        </div>

        {/* Sotto-Specialistiche — solo nome (i medici vengono associati nella scheda medico) */}
        <div className="bg-slate-800 rounded-lg border border-slate-700 p-6">
          <div className="flex items-center justify-between mb-1">
            <h2 className="font-semibold text-white">Sotto-Specialistiche / Terapie</h2>
            <button
              onClick={addSottoSpecialistica}
              className="text-primary text-sm flex items-center gap-1 hover:text-primary/80 transition-colors"
            >
              <Plus size={16} /> Aggiungi
            </button>
          </div>
          <p className="text-xs text-slate-400 mb-4">
            I medici si abbinano direttamente nella scheda di ogni medico (sezione &quot;Terapie / Sotto-specialistiche&quot;).
            La descrizione breve viene mostrata nel modale che si apre cliccando la terapia sulla pagina pubblica.
          </p>

          {form.sottoSpecialistiche.length === 0 ? (
            <p className="text-slate-400 text-sm">Nessuna sotto-specialistica aggiunta.</p>
          ) : (
            <div className="space-y-3">
              {form.sottoSpecialistiche.map((sotto, i) => (
                <div key={sotto.id} className="bg-slate-700/50 rounded-lg p-4 space-y-3">
                  <div className="flex items-center gap-3">
                    <input
                      type="text"
                      value={sotto.nome}
                      onChange={(e) => updateSottoSpecialisticaNome(i, e.target.value)}
                      className="flex-1 bg-slate-700 border border-slate-600 text-white placeholder-slate-400 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                      placeholder="Nome sotto-specialistica / terapia"
                    />
                    <button
                      onClick={() => removeSottoSpecialistica(i)}
                      className="text-red-400/60 hover:text-red-400 p-1 transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                  <textarea
                    value={sotto.descrizione || ''}
                    onChange={(e) => updateSottoSpecialisticaDescrizione(i, e.target.value)}
                    rows={3}
                    className="w-full bg-slate-700 border border-slate-600 text-white placeholder-slate-400 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                    placeholder="Breve descrizione della terapia (mostrata nel modale sulla pagina pubblica)..."
                  />
                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1">
                      Genere (per il selettore Donna/Uomo, es. Medicina Estetica)
                    </label>
                    <select
                      value={sotto.genere || 'entrambi'}
                      onChange={(e) =>
                        updateSottoSpecialisticaGenere(i, e.target.value as SottoSpecialistica['genere'])
                      }
                      className="w-full bg-slate-700 border border-slate-600 text-white rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                      <option value="entrambi">Entrambi</option>
                      <option value="donna">Donna</option>
                      <option value="uomo">Uomo</option>
                    </select>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* SEO */}
        <div className="bg-slate-800 rounded-lg border border-slate-700 p-6">
          <h3 className="font-medium text-white mb-3">SEO</h3>
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Meta Title</label>
              <input
                type="text"
                value={form.metaTitle}
                onChange={(e) => update('metaTitle', e.target.value)}
                className="w-full bg-slate-700 border border-slate-600 text-white rounded px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Meta Description</label>
              <textarea
                value={form.metaDescription}
                onChange={(e) => update('metaDescription', e.target.value)}
                rows={2}
                className="w-full bg-slate-700 border border-slate-600 text-white placeholder-slate-400 rounded px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary resize-none"
              />
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
