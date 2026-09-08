'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { addDoc, collection, getDocs } from 'firebase/firestore'
import { db } from '@/lib/firebase/client'
import { sortMedici } from '@/lib/medici'
import { slugify } from '@/lib/utils'
import { RichEditor } from '@/components/admin/RichEditor'
import { ImageUpload } from '@/components/admin/ImageUpload'
import { revalidatePublic } from '@/lib/revalidateClient'
import Link from 'next/link'
import { ArrowLeft, Loader2, Save } from 'lucide-react'

export default function NuovaPatologiaPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
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
        const [specSnap, mediciSnap] = await Promise.all([
          getDocs(collection(db, 'specialistiche')),
          getDocs(collection(db, 'medici')),
        ])
        setSpecialistiche(specSnap.docs.map((d) => ({ id: d.id, nome: d.data().nome as string })))
        setAllMedici(
          sortMedici(mediciSnap.docs.map((d) => ({ id: d.id, nome: d.data().nome as string })))
        )
      } catch {
        setError('Errore nel caricamento delle specialistiche.')
      }
    }
    load()
  }, [])

  function update(key: string, value: string | string[]) {
    setForm((f) => {
      const updated = { ...f, [key]: value }
      if (key === 'nome' && typeof value === 'string') {
        updated.slug = slugify(value)
      }
      return updated
    })
  }

  function toggleMedico(id: string) {
    setForm((f) => ({
      ...f,
      mediciIds: f.mediciIds.includes(id)
        ? f.mediciIds.filter((x) => x !== id)
        : [...f.mediciIds, id],
    }))
  }

  async function handleSave() {
    if (!form.nome || !form.specialisticaId) {
      setError('Nome e specialistica sono obbligatori.')
      return
    }
    setLoading(true)
    setError('')
    try {
      await addDoc(collection(db, 'patologie'), { ...form })
      await revalidatePublic(['/patologie', `/patologie/${form.slug}`, '/sport'])
      router.push('/admin/dashboard/patologie')
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
            <Link href="/admin/dashboard/patologie" className="text-slate-400 hover:text-primary">
              <ArrowLeft size={20} />
            </Link>
            <h1 className="font-semibold text-white">Nuova Patologia</h1>
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
                <label className="block text-sm font-medium text-slate-300 mb-1">Nome *</label>
                <input
                  type="text"
                  value={form.nome}
                  onChange={(e) => update('nome', e.target.value)}
                  className="w-full bg-slate-700 border border-slate-600 text-white placeholder-slate-400 rounded px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="es. Ernia del disco"
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
