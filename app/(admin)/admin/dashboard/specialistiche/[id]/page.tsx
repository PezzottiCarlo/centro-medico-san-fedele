'use client'

import { useState, useEffect, useMemo } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { doc, getDoc, updateDoc, deleteDoc, collection, getDocs } from 'firebase/firestore'
import { db } from '@/lib/firebase/client'
import { RichEditor } from '@/components/admin/RichEditor'
import { ImageUpload } from '@/components/admin/ImageUpload'
import Link from 'next/link'
import { ArrowLeft, Loader2, Save, Trash2, Plus } from 'lucide-react'
import type { SottoSpecialistica } from '@/types'

interface MedicoOpt {
  id: string
  nome: string
  sottoSpecialisticheIds: string[]
}

export default function EditSpecialisticaPage() {
  const router = useRouter()
  const params = useParams()
  const id = params.id as string
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [allMedici, setAllMedici] = useState<MedicoOpt[]>([])
  const [form, setForm] = useState({
    nome: '',
    slug: '',
    icona: '',
    descrizioneBreve: '',
    descrizione: '',
    metaTitle: '',
    metaDescription: '',
    order: 0,
    pubblicata: false,
    sottoSpecialistiche: [] as SottoSpecialistica[],
    immagine: '',
  })

  useEffect(() => {
    async function load() {
      try {
        const [snap, mediciSnap] = await Promise.all([
          getDoc(doc(db, 'specialistiche', id)),
          getDocs(collection(db, 'medici')),
        ])
        if (!snap.exists()) {
          setError('Specialistica non trovata.')
          setLoading(false)
          return
        }
        const data = snap.data()
        setForm({
          nome: data.nome || '',
          slug: data.slug || '',
          icona: data.icona || '',
          descrizioneBreve: data.descrizioneBreve || '',
          descrizione: data.descrizione || '',
          metaTitle: data.metaTitle || '',
          metaDescription: data.metaDescription || '',
          order: data.order ?? 0,
          pubblicata: data.pubblicata ?? false,
          sottoSpecialistiche: data.sottoSpecialistiche || [],
          immagine: data.immagine || '',
        })
        setAllMedici(
          mediciSnap.docs.map((d) => ({
            id: d.id,
            nome: d.data().nome as string,
            sottoSpecialisticheIds: (d.data().sottoSpecialisticheIds || []) as string[],
          }))
        )
      } catch {
        setError('Errore nel caricamento.')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [id])

  // Calcola i medici per ogni sotto-specialistica (read-only, derivato da medici.sottoSpecialisticheIds)
  const mediciBySotto = useMemo(() => {
    const map: Record<string, MedicoOpt[]> = {}
    for (const sotto of form.sottoSpecialistiche) {
      map[sotto.id] = allMedici.filter((m) => m.sottoSpecialisticheIds.includes(sotto.id))
    }
    return map
  }, [allMedici, form.sottoSpecialistiche])

  function update(key: string, value: string | number | boolean | SottoSpecialistica[]) {
    setForm((f) => ({ ...f, [key]: value }))
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

  function removeSottoSpecialistica(index: number) {
    update('sottoSpecialistiche', form.sottoSpecialistiche.filter((_, i) => i !== index))
  }

  async function handleSave() {
    if (!form.nome || !form.descrizioneBreve) {
      setError('Nome e descrizione breve sono obbligatori.')
      return
    }
    setSaving(true)
    setError('')
    try {
      await updateDoc(doc(db, 'specialistiche', id), { ...form })
      router.push('/admin/dashboard/specialistiche')
    } catch {
      setError('Errore durante il salvataggio.')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete() {
    if (!confirm('Sei sicuro di voler eliminare questa specialistica?')) return
    setSaving(true)
    try {
      await deleteDoc(doc(db, 'specialistiche', id))
      router.push('/admin/dashboard/specialistiche')
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
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/admin/dashboard/specialistiche" className="text-slate-400 hover:text-primary">
              <ArrowLeft size={20} />
            </Link>
            <h1 className="font-semibold text-white">Modifica Specialistica</h1>
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

        {/* Sotto-Specialistiche */}
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
            I medici si abbinano direttamente nella scheda di ogni medico. Qui sotto vedi solo chi è già associato a ciascuna terapia.
          </p>

          {form.sottoSpecialistiche.length === 0 ? (
            <p className="text-slate-400 text-sm">Nessuna sotto-specialistica aggiunta.</p>
          ) : (
            <div className="space-y-4">
              {form.sottoSpecialistiche.map((sotto, i) => {
                const medici = mediciBySotto[sotto.id] || []
                return (
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
                    <div>
                      <p className="text-xs text-slate-400 mb-2">
                        Medici associati ({medici.length}):
                      </p>
                      {medici.length === 0 ? (
                        <p className="text-xs text-slate-500 italic">
                          Nessun medico ha ancora questa terapia. Modifica la scheda di un medico per associarlo.
                        </p>
                      ) : (
                        <div className="flex flex-wrap gap-2">
                          {medici.map((m) => (
                            <Link
                              key={m.id}
                              href={`/admin/dashboard/medici/${m.id}`}
                              className="px-3 py-1 rounded-full text-xs font-medium bg-slate-600 text-slate-200 hover:bg-primary hover:text-white transition-colors"
                            >
                              {m.nome}
                            </Link>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Stato pubblicazione */}
        <div className="bg-slate-800 rounded-lg border border-slate-700 p-6">
          <div className="flex items-center gap-3">
            <button
              type="button"
              role="switch"
              aria-checked={form.pubblicata}
              onClick={() => update('pubblicata', !form.pubblicata)}
              className={`relative w-12 h-6 rounded-full overflow-hidden transition-colors ${
                form.pubblicata ? 'bg-primary' : 'bg-slate-600'
              }`}
            >
              <span
                className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all duration-200 ${
                  form.pubblicata ? 'left-7' : 'left-1'
                }`}
              />
            </button>
            <div>
              <p className="font-medium text-white">
                {form.pubblicata ? 'Pubblicata' : 'Bozza'}
              </p>
              <p className="text-xs text-slate-400">
                {form.pubblicata ? 'Visibile sul sito' : 'Non visibile sul sito'}
              </p>
            </div>
          </div>
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
                className="w-full bg-slate-700 border border-slate-600 text-white placeholder-slate-400 rounded px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary"
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
