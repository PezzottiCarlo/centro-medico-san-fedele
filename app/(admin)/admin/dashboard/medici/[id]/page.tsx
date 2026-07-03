'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { doc, getDoc, updateDoc, deleteDoc, collection, getDocs } from 'firebase/firestore'
import { db } from '@/lib/firebase/client'
import { ImageUpload } from '@/components/admin/ImageUpload'
import { revalidatePublic } from '@/lib/revalidateClient'
import Link from 'next/link'
import { ArrowLeft, Loader2, Save, Plus, Trash2 } from 'lucide-react'
import type { Orario, SottoSpecialistica } from '@/types'

const GIORNI = ['Lunedi', 'Martedi', 'Mercoledi', 'Giovedi', 'Venerdi', 'Sabato']

interface SpecialisticaOpt {
  id: string
  nome: string
  icona: string
  sottoSpecialistiche: SottoSpecialistica[]
}

export default function EditMedicoPage() {
  const router = useRouter()
  const params = useParams()
  const id = params.id as string
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [allSpecialistiche, setAllSpecialistiche] = useState<SpecialisticaOpt[]>([])
  const [form, setForm] = useState({
    nome: '',
    slug: '',
    mansione: '',
    bio: '',
    curriculum: '',
    foto: '',
    telefono: '',
    email: '',
    pubblicato: false,
    suChiamata: false,
    specialisticheIds: [] as string[],
    sottoSpecialisticheIds: [] as string[],
    patologieIds: [] as string[],
    orari: [] as Orario[],
  })

  useEffect(() => {
    async function load() {
      try {
        const snap = await getDoc(doc(db, 'medici', id))
        if (!snap.exists()) {
          setError('Medico non trovato.')
          setLoading(false)
          return
        }
        const data = snap.data()
        setForm({
          nome: data.nome || '',
          slug: data.slug || '',
          mansione: data.mansione || '',
          bio: data.bio || '',
          curriculum: data.curriculum || '',
          foto: data.foto || '',
          telefono: data.telefono || '',
          email: data.email || '',
          pubblicato: data.pubblicato ?? false,
          suChiamata: data.suChiamata ?? false,
          specialisticheIds: data.specialisticheIds || [],
          sottoSpecialisticheIds: data.sottoSpecialisticheIds || [],
          patologieIds: data.patologieIds || [],
          orari: data.orari || [],
        })
        const specSnap = await getDocs(collection(db, 'specialistiche'))
        setAllSpecialistiche(
          specSnap.docs.map((d) => {
            const dd = d.data()
            return {
              id: d.id,
              nome: dd.nome as string,
              icona: dd.icona as string,
              sottoSpecialistiche: (dd.sottoSpecialistiche || []) as SottoSpecialistica[],
            }
          })
        )
      } catch {
        setError('Errore nel caricamento.')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [id])

  function update(key: string, value: unknown) {
    setForm((f) => ({ ...f, [key]: value }))
  }

  function toggleSpecialistica(specId: string) {
    setForm((f) => {
      const isIn = f.specialisticheIds.includes(specId)
      const newSpecIds = isIn
        ? f.specialisticheIds.filter((id) => id !== specId)
        : [...f.specialisticheIds, specId]
      // Se si deseleziona la specialistica, rimuovi anche le sue sotto-spec dalle selezioni
      let newSottoIds = f.sottoSpecialisticheIds
      if (isIn) {
        const spec = allSpecialistiche.find((s) => s.id === specId)
        const sottoIds = spec?.sottoSpecialistiche.map((ss) => ss.id) || []
        newSottoIds = f.sottoSpecialisticheIds.filter((sid) => !sottoIds.includes(sid))
      }
      return { ...f, specialisticheIds: newSpecIds, sottoSpecialisticheIds: newSottoIds }
    })
  }

  function toggleSottoSpec(sottoId: string) {
    setForm((f) => {
      const ids = f.sottoSpecialisticheIds.includes(sottoId)
        ? f.sottoSpecialisticheIds.filter((id) => id !== sottoId)
        : [...f.sottoSpecialisticheIds, sottoId]
      return { ...f, sottoSpecialisticheIds: ids }
    })
  }

  function addOrario() {
    update('orari', [...form.orari, { giorno: 'Lunedi', ore: '09:00 - 13:00', tipo: 'appuntamento' as const }])
  }

  function updateOrario(index: number, field: keyof Orario, value: string) {
    const newOrari = [...form.orari]
    newOrari[index] = { ...newOrari[index], [field]: value }
    update('orari', newOrari)
  }

  function removeOrario(index: number) {
    update('orari', form.orari.filter((_, i) => i !== index))
  }

  async function handleSave() {
    if (!form.nome) {
      setError('Il nome e obbligatorio.')
      return
    }
    setSaving(true)
    setError('')
    try {
      await updateDoc(doc(db, 'medici', id), { ...form })
      await revalidatePublic(['/medici', `/medici/${form.slug}`, '/', '/sport'])
      router.push('/admin/dashboard/medici')
    } catch {
      setError('Errore durante il salvataggio.')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete() {
    if (!confirm('Sei sicuro di voler eliminare questo medico?')) return
    setSaving(true)
    try {
      await deleteDoc(doc(db, 'medici', id))
      await revalidatePublic(['/medici', `/medici/${form.slug}`, '/', '/sport'])
      router.push('/admin/dashboard/medici')
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

  const selectedSpecs = allSpecialistiche.filter((s) => form.specialisticheIds.includes(s.id))

  return (
    <div className="min-h-screen bg-slate-900">
      <header className="bg-slate-800 border-b border-slate-700 sticky top-0 z-30 backdrop-blur supports-[backdrop-filter]:bg-slate-800/90">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/admin/dashboard/medici" className="text-slate-400 hover:text-primary">
              <ArrowLeft size={20} />
            </Link>
            <h1 className="font-semibold text-white">Modifica Medico</h1>
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

      <main className="max-w-4xl mx-auto px-4 py-8 space-y-6">
        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 rounded p-3 text-sm">
            {error}
          </div>
        )}

        {/* Dati base */}
        <div className="bg-slate-800 rounded-lg border border-slate-700 p-6 space-y-4">
          <h2 className="font-semibold text-white">Dati principali</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Nome completo *</label>
              <input
                type="text"
                value={form.nome}
                onChange={(e) => update('nome', e.target.value)}
                className="w-full bg-slate-700 border border-slate-600 text-white placeholder-slate-400 rounded px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="Dott. Mario Rossi"
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
              <label className="block text-sm font-medium text-slate-300 mb-1">Telefono</label>
              <input
                type="tel"
                value={form.telefono}
                onChange={(e) => update('telefono', e.target.value)}
                className="w-full bg-slate-700 border border-slate-600 text-white placeholder-slate-400 rounded px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Email</label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => update('email', e.target.value)}
                className="w-full bg-slate-700 border border-slate-600 text-white placeholder-slate-400 rounded px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-300 mb-1">Mansione</label>
              <input
                type="text"
                value={form.mansione}
                onChange={(e) => update('mansione', e.target.value)}
                className="w-full bg-slate-700 border border-slate-600 text-white placeholder-slate-400 rounded px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="es. Cardiologo, Medico Internista, Fisioterapista"
              />
              <p className="text-xs text-slate-400 mt-1">
                Sottotitolo mostrato sotto il nome nella pagina pubblica del medico.
              </p>
            </div>
            <div className="md:col-span-2">
              <ImageUpload
                value={form.foto}
                onChange={(url) => update('foto', url)}
                folder="medici"
                label="Foto"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Biografia</label>
            <textarea
              value={form.bio}
              onChange={(e) => update('bio', e.target.value)}
              rows={4}
              className="w-full bg-slate-700 border border-slate-600 text-white placeholder-slate-400 rounded px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary resize-none"
              placeholder="Breve biografia del medico..."
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Curriculum (HTML)</label>
            <textarea
              value={form.curriculum}
              onChange={(e) => update('curriculum', e.target.value)}
              rows={6}
              className="w-full bg-slate-700 border border-slate-600 text-white placeholder-slate-400 rounded px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary resize-none font-mono text-sm"
              placeholder="<ul><li>Laurea in Medicina...</li></ul>"
            />
          </div>
        </div>

        {/* Specialistiche */}
        {allSpecialistiche.length > 0 && (
          <div className="bg-slate-800 rounded-lg border border-slate-700 p-6">
            <h2 className="font-semibold text-white mb-1">Specialistiche</h2>
            <p className="text-xs text-slate-400 mb-4">
              Seleziona le aree in cui opera. Per ognuna potrai poi scegliere le terapie specifiche qui sotto.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {allSpecialistiche.map((s) => {
                const selected = form.specialisticheIds.includes(s.id)
                return (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => toggleSpecialistica(s.id)}
                    className={`flex items-center gap-3 p-3 rounded border text-left text-sm transition-all ${
                      selected
                        ? 'border-primary bg-primary/10 text-primary'
                        : 'border-slate-600 text-slate-300 hover:border-slate-500'
                    }`}
                  >
                    <span className="text-lg">{s.icona}</span>
                    <span className="font-medium">{s.nome}</span>
                    {selected && <span className="ml-auto text-primary">✓</span>}
                  </button>
                )
              })}
            </div>
          </div>
        )}

        {/* Sotto-specialistiche / Terapie */}
        {selectedSpecs.length > 0 && (
          <div className="bg-slate-800 rounded-lg border border-slate-700 p-6">
            <h2 className="font-semibold text-white mb-1">Terapie / Sotto-specialistiche</h2>
            <p className="text-xs text-slate-400 mb-4">
              Spunta solo le terapie che questo medico pratica davvero.
            </p>
            <div className="space-y-5">
              {selectedSpecs.map((spec) => {
                if (!spec.sottoSpecialistiche || spec.sottoSpecialistiche.length === 0) {
                  return (
                    <div key={spec.id} className="border-l-2 border-slate-600 pl-4">
                      <p className="text-sm font-bold text-white mb-1">
                        {spec.icona} {spec.nome}
                      </p>
                      <p className="text-xs text-slate-500 italic">Nessuna sotto-specialistica disponibile.</p>
                    </div>
                  )
                }
                return (
                  <div key={spec.id} className="border-l-2 border-primary/40 pl-4">
                    <p className="text-sm font-bold text-white mb-2">
                      {spec.icona} {spec.nome}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {spec.sottoSpecialistiche.map((sotto) => {
                        const selected = form.sottoSpecialisticheIds.includes(sotto.id)
                        return (
                          <button
                            key={sotto.id}
                            type="button"
                            onClick={() => toggleSottoSpec(sotto.id)}
                            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                              selected
                                ? 'bg-primary text-white'
                                : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                            }`}
                          >
                            {selected && '✓ '}{sotto.nome}
                          </button>
                        )
                      })}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Disponibilità */}
        <div className="bg-slate-800 rounded-lg border border-slate-700 p-6">
          <h2 className="font-semibold text-white mb-4">Disponibilità</h2>

          {/* Toggle su chiamata */}
          <div className="flex items-center gap-3 mb-4">
            <button
              type="button"
              role="switch"
              aria-checked={form.suChiamata}
              onClick={() => update('suChiamata', !form.suChiamata)}
              className={`relative w-12 h-6 rounded-full overflow-hidden transition-colors ${
                form.suChiamata ? 'bg-amber-500' : 'bg-slate-600'
              }`}
            >
              <span
                className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all duration-200 ${
                  form.suChiamata ? 'left-7' : 'left-1'
                }`}
              />
            </button>
            <div>
              <p className="font-medium text-white">Solo su appuntamento</p>
              <p className="text-xs text-slate-400">
                Medico esterno che opera in sede solo se necessario — nessun orario fisso
              </p>
            </div>
          </div>

          {/* Orari — visibili solo se NON su chiamata */}
          {!form.suChiamata && (
            <>
              <div className="flex items-center justify-between mb-3 pt-3 border-t border-slate-700">
                <h3 className="text-sm font-medium text-slate-300">Orari settimanali</h3>
                <button onClick={addOrario} className="text-primary text-sm flex items-center gap-1 hover:underline">
                  <Plus size={16} /> Aggiungi orario
                </button>
              </div>

              {form.orari.length === 0 ? (
                <p className="text-slate-400 text-sm">Nessun orario aggiunto.</p>
              ) : (
                <div className="space-y-3">
                  {form.orari.map((o, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <select
                        value={o.giorno}
                        onChange={(e) => updateOrario(i, 'giorno', e.target.value)}
                        className="bg-slate-700 border border-slate-600 text-white rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                      >
                        {GIORNI.map((g) => <option key={g}>{g}</option>)}
                      </select>
                      <input
                        type="text"
                        value={o.ore}
                        onChange={(e) => updateOrario(i, 'ore', e.target.value)}
                        className="flex-1 bg-slate-700 border border-slate-600 text-white placeholder-slate-400 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                        placeholder="09:00 - 13:00"
                      />
                      <select
                        value={o.tipo}
                        onChange={(e) => updateOrario(i, 'tipo', e.target.value)}
                        className="bg-slate-700 border border-slate-600 text-white rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                      >
                        <option value="appuntamento">Su appuntamento</option>
                        <option value="fisso">Orario fisso</option>
                      </select>
                      <button
                        onClick={() => removeOrario(i)}
                        className="text-red-400 hover:text-red-300 p-1"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>

        {/* Stato */}
        <div className="bg-slate-800 rounded-lg border border-slate-700 p-6">
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
            <div>
              <p className="font-medium text-white">
                {form.pubblicato ? 'Pubblicato' : 'Bozza'}
              </p>
              <p className="text-xs text-slate-400">
                {form.pubblicato ? 'Visibile sul sito' : 'Non visibile sul sito'}
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
