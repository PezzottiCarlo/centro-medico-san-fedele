'use client'

import { useState, useEffect } from 'react'
import { doc, getDoc, setDoc } from 'firebase/firestore'
import { db } from '@/lib/firebase/client'
import Link from 'next/link'
import { ArrowLeft, Loader2, Plus, Save, Trash2 } from 'lucide-react'
import { SITE_CONFIG_DEFAULT } from '@/lib/siteConfig'
import type { SiteConfig, SiteConfigOrario } from '@/types'

export default function SiteConfigPage() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [form, setForm] = useState<SiteConfig>(SITE_CONFIG_DEFAULT)

  useEffect(() => {
    async function load() {
      try {
        const snap = await getDoc(doc(db, 'site_config', 'main'))
        if (snap.exists()) {
          setForm({
            ...SITE_CONFIG_DEFAULT,
            ...(snap.data() as Partial<SiteConfig>),
          })
        }
      } catch (err) {
        const msg = err instanceof Error ? err.message : ''
        if (msg.includes('permission') || msg.includes('PERMISSION_DENIED')) {
          setError(
            'Permessi Firestore mancanti: esegui "firebase deploy --only firestore:rules" per attivare le regole site_config.'
          )
        } else {
          setError('Errore nel caricamento. I valori mostrati sono i predefiniti.')
        }
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  function update<K extends keyof SiteConfig>(key: K, value: SiteConfig[K]) {
    setForm((f) => ({ ...f, [key]: value }))
  }

  function updateOrario(idx: number, key: keyof SiteConfigOrario, value: string) {
    setForm((f) => {
      const orari = [...f.orari]
      orari[idx] = { ...orari[idx], [key]: value }
      return { ...f, orari }
    })
  }

  function addOrario() {
    setForm((f) => ({ ...f, orari: [...f.orari, { giorno: '', ore: '' }] }))
  }

  function removeOrario(idx: number) {
    setForm((f) => ({ ...f, orari: f.orari.filter((_, i) => i !== idx) }))
  }

  function updateDomanda(idx: number, value: string) {
    setForm((f) => {
      const domande = [...(f.chatbotDomande ?? [])]
      domande[idx] = value
      return { ...f, chatbotDomande: domande }
    })
  }

  function addDomanda() {
    setForm((f) => ({ ...f, chatbotDomande: [...(f.chatbotDomande ?? []), ''] }))
  }

  function removeDomanda(idx: number) {
    setForm((f) => ({
      ...f,
      chatbotDomande: (f.chatbotDomande ?? []).filter((_, i) => i !== idx),
    }))
  }

  async function handleSave() {
    setSaving(true)
    setError('')
    setSuccess('')
    try {
      const payload: SiteConfig = { ...form, aggiornatoIl: new Date().toISOString() }
      const cleaned = JSON.parse(JSON.stringify(payload))
      await setDoc(doc(db, 'site_config', 'main'), cleaned, { merge: true })
      try {
        await Promise.all([
          fetch('/api/admin/revalidate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ path: '/' }),
          }),
          fetch('/api/admin/revalidate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ slug: 'contatti' }),
          }),
          // I dati del titolare compaiono nelle pagine legali
          fetch('/api/admin/revalidate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ paths: ['/privacy', '/cookie-policy'] }),
          }),
        ])
      } catch {}
      setSuccess('Configurazione salvata. Le modifiche compaiono entro pochi secondi.')
    } catch (err) {
      const msg = err instanceof Error ? err.message : ''
      if (msg.includes('permission') || msg.includes('PERMISSION_DENIED')) {
        setError(
          'Permessi Firestore mancanti: esegui "firebase deploy --only firestore:rules" per attivare le regole site_config.'
        )
      } else {
        setError('Errore durante il salvataggio.')
      }
    } finally {
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
        <div className="max-w-2xl mx-auto px-4 py-3 sm:py-4 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <Link href="/admin/dashboard" className="text-slate-400 hover:text-primary flex-shrink-0">
              <ArrowLeft size={20} />
            </Link>
            <h1 className="font-semibold text-white text-sm sm:text-base">Contatti & info</h1>
          </div>
          <button
            onClick={handleSave}
            disabled={saving}
            className="btn-primary flex items-center gap-2 text-sm flex-shrink-0"
          >
            {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
            <span className="hidden sm:inline">Salva</span>
          </button>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-6 sm:py-8">
        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 rounded p-3 mb-4 text-sm">
            {error}
          </div>
        )}
        {success && (
          <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 rounded p-3 mb-4 text-sm">
            {success}
          </div>
        )}

        <div className="bg-slate-800 rounded-lg border border-slate-700 p-5 sm:p-6 space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">
                Telefono (display)
              </label>
              <input
                type="text"
                value={form.telefono}
                onChange={(e) => update('telefono', e.target.value)}
                placeholder="031 333 3585"
                className="w-full bg-slate-700 border border-slate-600 text-white placeholder-slate-400 rounded px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">
                Telefono E.164 (link tel:)
              </label>
              <input
                type="text"
                value={form.telefonoE164}
                onChange={(e) => update('telefonoE164', e.target.value)}
                placeholder="+390313333585"
                className="w-full bg-slate-700 border border-slate-600 text-white placeholder-slate-400 rounded px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">
                WhatsApp E.164
              </label>
              <input
                type="text"
                value={form.whatsappE164 || ''}
                onChange={(e) => update('whatsappE164', e.target.value)}
                placeholder="+390313333585"
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
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Indirizzo</label>
              <input
                type="text"
                value={form.indirizzo}
                onChange={(e) => update('indirizzo', e.target.value)}
                placeholder="Via Risorgimento, 1"
                className="w-full bg-slate-700 border border-slate-600 text-white placeholder-slate-400 rounded px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Città</label>
              <input
                type="text"
                value={form.citta}
                onChange={(e) => update('citta', e.target.value)}
                className="w-full bg-slate-700 border border-slate-600 text-white placeholder-slate-400 rounded px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">CAP</label>
              <input
                type="text"
                value={form.cap}
                onChange={(e) => update('cap', e.target.value)}
                className="w-full bg-slate-700 border border-slate-600 text-white placeholder-slate-400 rounded px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Provincia</label>
              <input
                type="text"
                value={form.provincia}
                onChange={(e) => update('provincia', e.target.value)}
                className="w-full bg-slate-700 border border-slate-600 text-white placeholder-slate-400 rounded px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">
              Indirizzo completo (display)
            </label>
            <input
              type="text"
              value={form.indirizzoCompleto}
              onChange={(e) => update('indirizzoCompleto', e.target.value)}
              placeholder="Via Risorgimento, 1 — 22030 Longone al Segrino (CO)"
              className="w-full bg-slate-700 border border-slate-600 text-white placeholder-slate-400 rounded px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">
              Google Maps URL
            </label>
            <input
              type="url"
              value={form.mapsUrl || ''}
              onChange={(e) => update('mapsUrl', e.target.value)}
              placeholder="https://maps.google.com/?q=..."
              className="w-full bg-slate-700 border border-slate-600 text-white placeholder-slate-400 rounded px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div className="border-t border-slate-700 pt-5 space-y-4">
            <div>
              <h2 className="text-sm font-semibold text-white">Profili social</h2>
              <p className="text-xs text-slate-400 mt-1">
                Indirizzo completo della pagina del centro, che inizia con https://. Le icone
                compaiono nel footer solo per i profili compilati.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Instagram</label>
                <input
                  type="url"
                  value={form.instagramUrl || ''}
                  onChange={(e) => update('instagramUrl', e.target.value)}
                  placeholder="https://www.instagram.com/nomeprofilo"
                  className="w-full bg-slate-700 border border-slate-600 text-white placeholder-slate-400 rounded px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Facebook</label>
                <input
                  type="url"
                  value={form.facebookUrl || ''}
                  onChange={(e) => update('facebookUrl', e.target.value)}
                  placeholder="https://www.facebook.com/nomepagina"
                  className="w-full bg-slate-700 border border-slate-600 text-white placeholder-slate-400 rounded px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">LinkedIn</label>
                <input
                  type="url"
                  value={form.linkedinUrl || ''}
                  onChange={(e) => update('linkedinUrl', e.target.value)}
                  placeholder="https://www.linkedin.com/company/nomeazienda"
                  className="w-full bg-slate-700 border border-slate-600 text-white placeholder-slate-400 rounded px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>
          </div>

          <div className="border-t border-slate-700 pt-5 space-y-4">
            <div>
              <h2 className="text-sm font-semibold text-white">Dati del titolare del trattamento</h2>
              <p className="text-xs text-slate-400 mt-1">
                Compaiono nella{' '}
                <Link href="/privacy" target="_blank" className="text-primary hover:underline">
                  Privacy Policy
                </Link>{' '}
                e nella Cookie Policy. Finché restano vuoti, le pagine legali mostrano un avviso
                al posto del dato mancante.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-slate-300 mb-1">
                  Ragione sociale
                </label>
                <input
                  type="text"
                  value={form.ragioneSociale || ''}
                  onChange={(e) => update('ragioneSociale', e.target.value)}
                  placeholder="Centro Medico San Fedele S.r.l."
                  className="w-full bg-slate-700 border border-slate-600 text-white placeholder-slate-400 rounded px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Partita IVA</label>
                <input
                  type="text"
                  value={form.partitaIva || ''}
                  onChange={(e) => update('partitaIva', e.target.value)}
                  placeholder="01234567890"
                  className="w-full bg-slate-700 border border-slate-600 text-white placeholder-slate-400 rounded px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">
                  Codice fiscale
                </label>
                <input
                  type="text"
                  value={form.codiceFiscale || ''}
                  onChange={(e) => update('codiceFiscale', e.target.value)}
                  placeholder="Se diverso dalla partita IVA"
                  className="w-full bg-slate-700 border border-slate-600 text-white placeholder-slate-400 rounded px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-slate-300 mb-1">
                  PEC <span className="text-slate-500 font-normal">(facoltativa)</span>
                </label>
                <input
                  type="email"
                  value={form.pec || ''}
                  onChange={(e) => update('pec', e.target.value)}
                  placeholder="centromedico@pec.it"
                  className="w-full bg-slate-700 border border-slate-600 text-white placeholder-slate-400 rounded px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>
          </div>

          <div className="border-t border-slate-700 pt-5 space-y-4">
            <div>
              <h2 className="text-sm font-semibold text-white">
                Responsabile della Protezione dei Dati (DPO)
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Lascia vuoto se non è stato nominato: la sezione sparisce dalla Privacy Policy.
                Per chi tratta dati sanitari su larga scala la nomina è spesso obbligatoria
                (art. 37 GDPR).
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">
                  Nome del DPO
                </label>
                <input
                  type="text"
                  value={form.dpoNome || ''}
                  onChange={(e) => update('dpoNome', e.target.value)}
                  placeholder="Nome e cognome o società"
                  className="w-full bg-slate-700 border border-slate-600 text-white placeholder-slate-400 rounded px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">
                  Email del DPO
                </label>
                <input
                  type="email"
                  value={form.dpoEmail || ''}
                  onChange={(e) => update('dpoEmail', e.target.value)}
                  placeholder="dpo@esempio.it"
                  className="w-full bg-slate-700 border border-slate-600 text-white placeholder-slate-400 rounded px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>
          </div>

          <div className="border-t border-slate-700 pt-5">
            <div className="flex items-center justify-between mb-3">
              <label className="text-sm font-medium text-slate-300">Orari di apertura</label>
              <button
                type="button"
                onClick={addOrario}
                className="text-primary text-sm hover:text-primary-dark flex items-center gap-1"
              >
                <Plus size={14} /> Aggiungi riga
              </button>
            </div>
            <div className="space-y-2">
              {form.orari.map((o, idx) => (
                <div key={idx} className="grid grid-cols-[1fr_1fr_auto] gap-2">
                  <input
                    type="text"
                    value={o.giorno}
                    onChange={(e) => updateOrario(idx, 'giorno', e.target.value)}
                    placeholder="Lunedì – Venerdì"
                    className="bg-slate-700 border border-slate-600 text-white placeholder-slate-400 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                  <input
                    type="text"
                    value={o.ore}
                    onChange={(e) => updateOrario(idx, 'ore', e.target.value)}
                    placeholder="09:00 – 19:30"
                    className="bg-slate-700 border border-slate-600 text-white placeholder-slate-400 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                  <button
                    type="button"
                    onClick={() => removeOrario(idx)}
                    className="text-red-400 hover:text-red-300 px-2"
                    aria-label="Rimuovi riga"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="border-t border-slate-700 pt-5">
            <div className="flex items-center justify-between mb-1">
              <label className="text-sm font-medium text-slate-300">Domande suggerite chatbot</label>
              <button
                type="button"
                onClick={addDomanda}
                className="text-primary text-sm hover:text-primary-dark flex items-center gap-1"
              >
                <Plus size={14} /> Aggiungi domanda
              </button>
            </div>
            <p className="text-xs text-slate-400 mb-3">
              Mostrate all&apos;apertura del chatbot MelaBot. Cliccandole, l&apos;utente invia subito la domanda.
            </p>
            <div className="space-y-2">
              {(form.chatbotDomande ?? []).length === 0 ? (
                <p className="text-slate-400 text-sm">Nessuna domanda impostata.</p>
              ) : (
                (form.chatbotDomande ?? []).map((q, idx) => (
                  <div key={idx} className="grid grid-cols-[1fr_auto] gap-2">
                    <input
                      type="text"
                      value={q}
                      onChange={(e) => updateDomanda(idx, e.target.value)}
                      placeholder="es. Come posso prenotare una visita?"
                      className="bg-slate-700 border border-slate-600 text-white placeholder-slate-400 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                    <button
                      type="button"
                      onClick={() => removeDomanda(idx)}
                      className="text-red-400 hover:text-red-300 px-2"
                      aria-label="Rimuovi domanda"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
