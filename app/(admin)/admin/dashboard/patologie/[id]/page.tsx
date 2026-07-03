'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { doc, getDoc, updateDoc, deleteDoc, collection, getDocs } from 'firebase/firestore'
import { db } from '@/lib/firebase/client'
import { RichEditor } from '@/components/admin/RichEditor'
import { ImageUpload } from '@/components/admin/ImageUpload'
import { revalidatePublic } from '@/lib/revalidateClient'
import Link from 'next/link'
import { ArrowLeft, Loader2, Save, Trash2 } from 'lucide-react'

export default function EditPatologiaPage() {
  const router = useRouter()
  const params = useParams()
  const id = params.id as string
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [specialistiche, setSpecialistiche] = useState<{ id: string; nome: string }[]>([])
  const [allMedici, setAllMedici] = useState<{ id: string; nome: string }[]>([])
  const [form, setForm] = useState({
    nome: '',
    slug: '',
    descrizione: '',
    specialisticaId: '',
    mediciIds: [] as string[],
    metaTitle: '',
    metaDescription: '',
    immagine: '',
  })

  useEffect(() => {
    async function load() {
      try {
        const [snap, specSnap, mediciSnap] = await Promise.all([
          getDoc(doc(db, 'patologie', id)),
          getDocs(collection(db, 'specialistiche')),
          getDocs(collection(db, 'medici')),
        ])
        if (!snap.exists()) {
          setError('Patologia non trovata.')
          setLoading(false)
          return
        }
        const data = snap.data()
        setForm({
          nome: data.nome || '',
          slug: data.slug || '',
          descrizione: data.descrizione || '',
          specialisticaId: data.specialisticaId || '',
          mediciIds: data.mediciIds || [],
          metaTitle: data.metaTitle || '',
          metaDescription: data.metaDescription || '',
          immagine: data.immagine || '',
        })
        setSpecialistiche(specSnap.docs.map((d) => ({ id: d.id, nome: d.data().nome as string })))
        setAllMedici(mediciSnap.docs.map((d) => ({ id: d.id, nome: d.data().nome as string })))
      } catch {
        setError('Errore nel caricamento.')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [id])

  function update(key: string, value: string | string[]) {
    setForm((f) => ({ ...f, [key]: value }))
  }

  function toggleMedico(mid: string) {
    setForm((f) => ({
      ...f,
      mediciIds: f.mediciIds.includes(mid)
        ? f.mediciIds.filter((x) => x !== mid)
        : [...f.mediciIds, mid],
    }))
  }

  async function handleSave() {
    if (!form.nome || !form.specialisticaId) {
      setError('Nome e specialistica sono obbligatori.')
      return
    }
    setSaving(true)
    setError('')
    try {
      await updateDoc(doc(db, 'patologie', id), { ...form })
      await revalidatePublic(['/patologie', `/patologie/${form.slug}`, '/sport'])
      router.push('/admin/dashboard/patologie')
    } catch {
      setError('Errore durante il salvataggio.')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete() {
    if (!confirm('Sei sicuro di voler eliminare questa patologia?')) return
    setSaving(true)
    try {
      await deleteDoc(doc(db, 'patologie', id))
      await revalidatePublic(['/patologie', `/patologie/${form.slug}`, '/sport'])
      router.push('/admin/dashboard/patologie')
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
            <Link href="/admin/dashboard/patologie" className="text-slate-400 hover:text-primary">
              <ArrowLeft size={20} />
            </Link>
            <h1 className="font-semibold text-white">Modifica Patologia</h1>
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
                <label className="block text-sm font-medium text-slate-300 mb-1">Nome *</label>
                <input
                  type="text"
                  value={form.nome}
                  onChange={(e) => update('nome', e.target.value)}
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
                <label className="block text-sm font-medium text-slate-300 mb-1">Descrizione</label>
                <div className="bg-white rounded overflow-hidden">
                  <RichEditor content={form.descrizione} onChange={(html) => update('descrizione', html)} />
                </div>
              </div>
            </div>

            <div className="bg-slate-800 rounded-lg border border-slate-700 p-6">
              <h3 className="font-medium text-white mb-3">Medici che la trattano</h3>
              {allMedici.length === 0 ? (
                <p className="text-slate-400 text-sm">Nessun medico disponibile.</p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {allMedici.map((m) => {
                    const selected = form.mediciIds.includes(m.id)
                    return (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => toggleMedico(m.id)}
                        className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                          selected
                            ? 'bg-primary text-white'
                            : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                        }`}
                      >
                        {selected && '✓ '}{m.nome}
                      </button>
                    )
                  })}
                </div>
              )}
            </div>
          </div>

          <div className="space-y-4">
            <div className="bg-slate-800 rounded-lg border border-slate-700 p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Specialistica *</label>
                <select
                  value={form.specialisticaId}
                  onChange={(e) => update('specialisticaId', e.target.value)}
                  className="w-full bg-slate-700 border border-slate-600 text-white rounded px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="">— Seleziona —</option>
                  {specialistiche.map((s) => (
                    <option key={s.id} value={s.id}>{s.nome}</option>
                  ))}
                </select>
              </div>
              <ImageUpload
                value={form.immagine}
                onChange={(url) => update('immagine', url)}
                folder="patologie"
                label="Immagine"
              />
            </div>

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
                    className="w-full bg-slate-700 border border-slate-600 text-white rounded px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
