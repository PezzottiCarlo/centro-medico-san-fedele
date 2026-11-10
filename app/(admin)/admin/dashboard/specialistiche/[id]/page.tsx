'use client'

import { useState, useEffect, useMemo } from 'react'
import { useRouter, useParams } from 'next/navigation'
import {
  doc,
  getDoc,
  updateDoc,
  collection,
  getDocs,
  query,
  where,
  writeBatch,
  arrayRemove,
} from 'firebase/firestore'
import { db } from '@/lib/firebase/client'
import { RichEditor } from '@/components/admin/RichEditor'
import { ImageUpload } from '@/components/admin/ImageUpload'
import { revalidatePublic } from '@/lib/revalidateClient'
import { sortMedici } from '@/lib/medici'
import Link from 'next/link'
import { ArrowLeft, Loader2, Save, Trash2, Plus, ArrowUpDown } from 'lucide-react'
import type { SottoSpecialistica } from '@/types'
import { nuovoId, SLUG_DI_SISTEMA, verificaSlug } from '@/lib/admin'
import { InterruttorePubblicazione } from '@/components/admin/InterruttorePubblicazione'
import { numeraSotto, ordinaSotto, spostaSotto } from '@/lib/sottoSpecialistiche'
import { OrdineSottoControlli, RigaRiordino } from '@/components/admin/OrdineSottoControlli'
import { ListaOrdinabile } from '@/components/admin/ListaOrdinabile'

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
  // Id delle terapie al caricamento: servono a capire quali sono state eliminate
  const [sottoIniziali, setSottoIniziali] = useState<string[]>([])
  const [slugOriginale, setSlugOriginale] = useState('')
  // Lista compatta (solo i nomi) per riordinare comodamente anche decine di terapie
  const [riordino, setRiordino] = useState(false)
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
          // Dati salvati prima del campo `ordine`: restano nell'ordine dell'array
          sottoSpecialistiche: ordinaSotto(data.sottoSpecialistiche || []),
          immagine: data.immagine || '',
        })
        setSottoIniziali(((data.sottoSpecialistiche || []) as SottoSpecialistica[]).map((x) => x.id))
        setSlugOriginale(data.slug || '')
        setAllMedici(
          sortMedici(
            mediciSnap.docs.map((d) => ({
              id: d.id,
              nome: d.data().nome as string,
              sottoSpecialisticheIds: (d.data().sottoSpecialisticheIds || []) as string[],
            }))
          )
        )
      } catch {
        setError('Errore nel caricamento.')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [id])

  // Valutato sullo slug caricato, non su quello che si sta digitando
  const slugBloccato = SLUG_DI_SISTEMA.has(slugOriginale)

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
      { id: nuovoId(), nome: '' },
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

  function moveSottoSpecialistica(da: number, a: number) {
    update('sottoSpecialistiche', spostaSotto(form.sottoSpecialistiche, da, a))
  }

  function removeSottoSpecialistica(index: number) {
    const sotto = form.sottoSpecialistiche[index]
    const collegati = mediciBySotto[sotto.id]?.length ?? 0
    const nome = sotto.nome.trim() || 'questa terapia'
    const avviso = collegati
      ? `Eliminare "${nome}"? È associata a ${collegati} ${collegati === 1 ? 'medico' : 'medici'}: al salvataggio verrà tolta anche dalle loro schede.`
      : `Eliminare "${nome}"?`
    if (!confirm(avviso)) return
    update('sottoSpecialistiche', form.sottoSpecialistiche.filter((_, i) => i !== index))
  }

  async function handleSave() {
    if (!form.nome.trim() || !form.descrizioneBreve.trim()) {
      setError('Nome e descrizione breve sono obbligatori.')
      return
    }
    if (form.sottoSpecialistiche.some((s) => !s.nome.trim())) {
      setError('Ogni terapia deve avere un nome: compilalo o elimina la riga vuota.')
      return
    }
    setSaving(true)
    setError('')
    try {
      const esito = slugBloccato
        ? { slug: form.slug }
        : await verificaSlug(db, 'specialistiche', form.slug || form.nome, id)
      if ('errore' in esito) {
        setSaving(false)
        setError(esito.errore)
        return
      }
      const batch = writeBatch(db)
      // L'ordine mostrato qui diventa il campo `ordine` di ogni terapia
      batch.update(doc(db, 'specialistiche', id), {
        ...form,
        nome: form.nome.trim(),
        slug: esito.slug,
        sottoSpecialistiche: numeraSotto(
          form.sottoSpecialistiche.map((s) => ({ ...s, nome: s.nome.trim() }))
        ),
      })
      // Terapie eliminate: vanno tolte anche dai medici, altrimenti restano id
      // orfani invisibili nell'admin e riscritti a ogni salvataggio
      const rimaste = new Set(form.sottoSpecialistiche.map((s) => s.id))
      const eliminate = sottoIniziali.filter((sid) => !rimaste.has(sid))
      if (eliminate.length) {
        for (const m of allMedici) {
          if (m.sottoSpecialisticheIds.some((sid) => eliminate.includes(sid))) {
            batch.update(doc(db, 'medici', m.id), {
              sottoSpecialisticheIds: arrayRemove(...eliminate),
            })
          }
        }
      }
      await batch.commit()
      await revalidatePublic(['/ambulatori', `/ambulatori/${form.slug}`, '/sport', '/'])
      router.push('/admin/dashboard/specialistiche')
      router.refresh()
    } catch {
      setSaving(false)
      setError('Errore durante il salvataggio.')
    }
  }

  async function handleDelete() {
    if (slugBloccato) {
      setError('Questa specialistica alimenta una pagina dedicata del sito e non si può eliminare: mettila in bozza.')
      return
    }
    if (!confirm('Sei sicuro di voler eliminare questa specialistica? Verrà tolta anche dalle schede dei medici e dalle patologie collegate.')) return
    setSaving(true)
    try {
      // Pulizia dei riferimenti: medici (specialistica e sue terapie) e patologie
      const batch = writeBatch(db)
      const [mediciSnap, patologieSnap] = await Promise.all([
        getDocs(query(collection(db, 'medici'), where('specialisticheIds', 'array-contains', id))),
        getDocs(query(collection(db, 'patologie'), where('specialisticaId', '==', id))),
      ])
      const sottoIds = sottoIniziali
      mediciSnap.docs.forEach((d) =>
        batch.update(d.ref, {
          specialisticheIds: arrayRemove(id),
          ...(sottoIds.length && { sottoSpecialisticheIds: arrayRemove(...sottoIds) }),
        })
      )
      patologieSnap.docs.forEach((d) => batch.update(d.ref, { specialisticaId: '' }))
      batch.delete(doc(db, 'specialistiche', id))
      await batch.commit()
      await revalidatePublic(['/ambulatori', `/ambulatori/${form.slug}`, '/sport', '/'])
      router.push('/admin/dashboard/specialistiche')
      router.refresh()
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
            <label htmlFor="spec-slug" className="block text-sm font-medium text-slate-300 mb-1">Slug</label>
            <input
              id="spec-slug"
              type="text"
              value={form.slug}
              readOnly={slugBloccato}
              aria-describedby="spec-slug-aiuto"
              onChange={(e) => update('slug', e.target.value)}
              className="w-full bg-slate-700 border border-slate-600 text-white placeholder-slate-400 rounded px-4 py-3 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-primary read-only:opacity-60"
            />
            <p id="spec-slug-aiuto" className="text-xs text-slate-400 mt-1">
              {slugBloccato
                ? 'Slug fisso: lo usa una pagina dedicata del sito (/sport o /dsa).'
                : "Indirizzo della pagina: /ambulatori/slug. Cambiandolo, i vecchi link smettono di funzionare."}
            </p>
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
            <div className="flex items-center gap-4">
              {form.sottoSpecialistiche.length > 1 && (
                <button
                  type="button"
                  onClick={() => setRiordino((v) => !v)}
                  aria-pressed={riordino}
                  className={`text-sm flex items-center gap-1.5 rounded-full px-3 py-1 transition-colors ${
                    riordino
                      ? 'bg-primary text-white'
                      : 'text-slate-300 hover:text-white hover:bg-slate-700'
                  }`}
                >
                  <ArrowUpDown size={15} /> {riordino ? 'Fine riordino' : 'Riordina'}
                </button>
              )}
              {!riordino && (
                <button
                  onClick={addSottoSpecialistica}
                  className="text-primary text-sm flex items-center gap-1 hover:text-primary/80 transition-colors"
                >
                  <Plus size={16} /> Aggiungi
                </button>
              )}
            </div>
          </div>
          <p className="text-xs text-slate-400 mb-4">
            I medici si abbinano direttamente nella scheda di ogni medico. Qui sotto vedi solo chi è già associato a ciascuna terapia.
            La descrizione breve viene mostrata nel modale che si apre cliccando la terapia sulla pagina pubblica.
            L&apos;ordine qui è quello del sito: trascina dalla maniglia ⋮⋮ o usa le frecce, poi salva.
          </p>

          {form.sottoSpecialistiche.length === 0 ? (
            <p className="text-slate-400 text-sm">Nessuna sotto-specialistica aggiunta.</p>
          ) : (
            <ListaOrdinabile
              elementi={form.sottoSpecialistiche}
              onRiordina={(nuove) => update('sottoSpecialistiche', nuove)}
              className={riordino ? 'space-y-1.5' : 'space-y-4'}
              renderElemento={(sotto, i, maniglia) => {
                if (riordino) {
                  return (
                    <RigaRiordino
                      maniglia={maniglia}
                      posizione={i}
                      totale={form.sottoSpecialistiche.length}
                      nome={sotto.nome}
                      onSposta={(a) => moveSottoSpecialistica(i, a)}
                    />
                  )
                }
                const medici = mediciBySotto[sotto.id] || []
                return (
                  <div className="bg-slate-700/50 rounded-lg p-4 space-y-3">
                    <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                      {maniglia}
                      <input
                        type="text"
                        value={sotto.nome}
                        onChange={(e) => updateSottoSpecialisticaNome(i, e.target.value)}
                        className="flex-1 min-w-[12rem] bg-slate-700 border border-slate-600 text-white placeholder-slate-400 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                        placeholder="Nome sotto-specialistica / terapia"
                      />
                      <OrdineSottoControlli
                        posizione={i}
                        totale={form.sottoSpecialistiche.length}
                        nome={sotto.nome}
                        onSposta={(a) => moveSottoSpecialistica(i, a)}
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
              }}
            />
          )}
        </div>

        {/* Stato pubblicazione */}
        <div className="bg-slate-800 rounded-lg border border-slate-700 p-6">
          <InterruttorePubblicazione
            attivo={form.pubblicata}
            onCambia={(v) => update('pubblicata', v)}
            etichette={['Pubblicata', 'Bozza']}
          />
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
