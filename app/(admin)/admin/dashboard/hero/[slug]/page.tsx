'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { doc, getDoc, setDoc } from 'firebase/firestore'
import { db } from '@/lib/firebase/client'
import { ImageUpload } from '@/components/admin/ImageUpload'
import Link from 'next/link'
import { ArrowLeft, Loader2, Save } from 'lucide-react'
import {
  CTA_LINK_EMAIL,
  CTA_LINK_TELEFONO,
  CTA_LINK_WHATSAPP,
  HERO_DEFAULTS,
  HERO_PAGE_LABELS,
  HERO_PAGE_SLUGS,
  HeroPageSlug,
  normalizzaLinkCta,
} from '@/lib/heroDefaults'
import type { HeroCTA, HeroCtaIcon, HeroConfig } from '@/types'

// Link che seguono i contatti di /admin/dashboard/site-config
const CTA_LINK_RAPIDI: { label: string; href: string; icona: HeroCtaIcon }[] = [
  { label: 'Telefono del centro', href: CTA_LINK_TELEFONO, icona: 'phone' },
  { label: 'WhatsApp del centro', href: CTA_LINK_WHATSAPP, icona: 'whatsapp' },
  { label: 'Email del centro', href: CTA_LINK_EMAIL, icona: 'none' },
]

function normalizzaCta(cta?: HeroCTA): HeroCTA | undefined {
  return cta && { ...cta, href: normalizzaLinkCta(cta.href) }
}

const CTA_ICONS: { value: HeroCtaIcon; label: string }[] = [
  { value: 'none', label: 'Nessuna' },
  { value: 'phone', label: 'Telefono' },
  { value: 'whatsapp', label: 'WhatsApp' },
  { value: 'calendar', label: 'Calendario' },
  { value: 'arrow', label: 'Freccia' },
]

function emptyCta(): HeroCTA {
  return { testo: '', href: '', icona: 'none' }
}

export default function EditHeroPage() {
  const router = useRouter()
  const params = useParams()
  const slug = params.slug as HeroPageSlug
  const isValidSlug = HERO_PAGE_SLUGS.includes(slug)
  const defaults = isValidSlug ? HERO_DEFAULTS[slug] : null

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [form, setForm] = useState<HeroConfig>(() =>
    defaults ? { ...defaults } : ({} as HeroConfig)
  )

  useEffect(() => {
    if (!isValidSlug || !defaults) {
      setError('Pagina non valida.')
      setLoading(false)
      return
    }
    async function load() {
      try {
        const snap = await getDoc(doc(db, 'hero_config', slug))
        if (snap.exists()) {
          const data = snap.data() as Partial<HeroConfig>
          setForm({
            ...defaults!,
            ...data,
            ctaPrimaria: normalizzaCta(data.ctaPrimaria ?? defaults!.ctaPrimaria),
            ctaSecondaria: normalizzaCta(data.ctaSecondaria ?? defaults!.ctaSecondaria),
            variant: defaults!.variant,
            pageSlug: slug,
          })
        }
      } catch (err) {
        const msg = err instanceof Error ? err.message : ''
        if (msg.includes('permission') || msg.includes('PERMISSION_DENIED')) {
          setError(
            'Permessi Firestore mancanti: esegui "firebase deploy --only firestore:rules" per attivare le regole hero_config.'
          )
        } else {
          setError('Errore nel caricamento. I valori mostrati sono i predefiniti.')
        }
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [slug, isValidSlug, defaults])

  function update<K extends keyof HeroConfig>(key: K, value: HeroConfig[K]) {
    setForm((f) => ({ ...f, [key]: value }))
  }

  function updateCta(which: 'ctaPrimaria' | 'ctaSecondaria', key: keyof HeroCTA, value: string) {
    setForm((f) => {
      const current = f[which] ?? emptyCta()
      return { ...f, [which]: { ...current, [key]: value } }
    })
  }

  function toggleCta(which: 'ctaPrimaria' | 'ctaSecondaria', enabled: boolean) {
    setForm((f) => ({ ...f, [which]: enabled ? f[which] ?? emptyCta() : undefined }))
  }

  async function handleSave() {
    if (!form.titolo.trim()) {
      setError('Il titolo è obbligatorio.')
      return
    }
    setSaving(true)
    setError('')
    setSuccess('')
    try {
      const payload: HeroConfig = {
        ...form,
        variant: defaults!.variant,
        pageSlug: slug,
        aggiornatoIl: new Date().toISOString(),
      }
      const cleaned = JSON.parse(JSON.stringify(payload))
      await setDoc(doc(db, 'hero_config', slug), cleaned, { merge: true })
      try {
        await fetch('/api/admin/revalidate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ slug }),
        })
      } catch {}
      setSuccess('Hero salvato. Le modifiche compaiono entro pochi secondi.')
    } catch (err) {
      const msg = err instanceof Error ? err.message : ''
      if (msg.includes('permission') || msg.includes('PERMISSION_DENIED')) {
        setError(
          'Permessi Firestore mancanti: esegui "firebase deploy --only firestore:rules" per attivare le regole hero_config.'
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

  if (!isValidSlug || !defaults) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center text-slate-300 gap-4">
        <p>Pagina non valida.</p>
        <Link href="/admin/dashboard/hero" className="text-primary hover:underline">
          ← Torna alla lista
        </Link>
      </div>
    )
  }

  const showImage = form.variant !== 'dark' && form.variant !== 'gradient-soft'
  const showImageScale = form.variant === 'standard'
  const showEvidenziato = form.variant === 'home-zoom' || form.variant === 'dark' || form.variant === 'gradient-soft'
  const showSottotitolo = form.variant !== 'home-zoom'
  const showCta = form.variant === 'home-zoom' || form.variant === 'dark'

  return (
    <div className="min-h-screen bg-slate-900">
      <header className="bg-slate-800 border-b border-slate-700 sticky top-0 z-30 backdrop-blur supports-[backdrop-filter]:bg-slate-800/90">
        <div className="max-w-2xl mx-auto px-4 py-3 sm:py-4 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <Link href="/admin/dashboard/hero" className="text-slate-400 hover:text-primary flex-shrink-0">
              <ArrowLeft size={20} />
            </Link>
            <div className="min-w-0">
              <h1 className="font-semibold text-white text-sm sm:text-base truncate">
                Hero: {HERO_PAGE_LABELS[slug]}
              </h1>
              <p className="text-[10px] sm:text-xs text-slate-500 uppercase tracking-wide">
                Stile: {defaults.variant}
              </p>
            </div>
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
          <div className="flex items-center gap-3">
            <button
              type="button"
              role="switch"
              aria-checked={form.pubblicato}
              onClick={() => update('pubblicato', !form.pubblicato)}
              className={`relative w-12 h-6 rounded-full overflow-hidden transition-colors flex-shrink-0 ${
                form.pubblicato ? 'bg-emerald-500' : 'bg-slate-600'
              }`}
            >
              <span
                className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all duration-200 ${
                  form.pubblicato ? 'left-7' : 'left-1'
                }`}
              />
            </button>
            <div>
              <div className="text-sm font-medium text-slate-300">
                {form.pubblicato ? 'Pubblicato' : 'Disattivato'}
              </div>
              <p className="text-xs text-slate-500">
                {form.pubblicato
                  ? 'Le tue modifiche vengono mostrate sul sito.'
                  : 'Il sito userà i valori predefiniti finché non riattivi.'}
              </p>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Titolo *</label>
            <input
              type="text"
              value={form.titolo}
              onChange={(e) => update('titolo', e.target.value)}
              className="w-full bg-slate-700 border border-slate-600 text-white placeholder-slate-400 rounded px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          {showEvidenziato && (
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">
                Titolo evidenziato
              </label>
              <input
                type="text"
                value={form.titoloEvidenziato || ''}
                onChange={(e) => update('titoloEvidenziato', e.target.value)}
                className="w-full bg-slate-700 border border-slate-600 text-white placeholder-slate-400 rounded px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="Parte in colore / grassetto del titolo"
              />
              <p className="text-xs text-slate-500 mt-1">
                Appare alla fine del titolo, evidenziato (colore o grassetto).
              </p>
            </div>
          )}

          {showSottotitolo && (
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Sottotitolo</label>
              <textarea
                value={form.sottotitolo || ''}
                onChange={(e) => update('sottotitolo', e.target.value)}
                className="w-full bg-slate-700 border border-slate-600 text-white placeholder-slate-400 rounded px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                rows={3}
              />
            </div>
          )}

          {showImage && (
            <ImageUpload
              value={form.immagine || ''}
              onChange={(url) => update('immagine', url)}
              folder="hero"
              label="Immagine di sfondo"
            />
          )}

          {showImageScale && (
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">
                Zoom immagine ({(form.imageScale ?? 1).toFixed(2)}×)
              </label>
              <input
                type="range"
                min="1"
                max="1.5"
                step="0.05"
                value={form.imageScale ?? 1}
                onChange={(e) => update('imageScale', Number(e.target.value))}
                className="w-full accent-primary"
              />
              <p className="text-xs text-slate-500 mt-1">
                1.00× nessuno zoom · 1.50× zoom massimo
              </p>
            </div>
          )}

          {showCta && (
            <CtaEditor
              label="Bottone primario"
              cta={form.ctaPrimaria}
              onToggle={(e) => toggleCta('ctaPrimaria', e)}
              onChange={(key, val) => updateCta('ctaPrimaria', key, val)}
            />
          )}
          {showCta && (
            <CtaEditor
              label="Bottone secondario"
              cta={form.ctaSecondaria}
              onToggle={(e) => toggleCta('ctaSecondaria', e)}
              onChange={(key, val) => updateCta('ctaSecondaria', key, val)}
            />
          )}
        </div>

        <div className="mt-6 text-center">
          <button
            onClick={() => router.push('/admin/dashboard/hero')}
            className="text-slate-400 hover:text-white text-sm"
          >
            ← Torna alla lista
          </button>
        </div>
      </main>
    </div>
  )
}

function CtaEditor({
  label,
  cta,
  onToggle,
  onChange,
}: {
  label: string
  cta?: HeroCTA
  onToggle: (enabled: boolean) => void
  onChange: (key: keyof HeroCTA, val: string) => void
}) {
  const enabled = !!cta
  return (
    <div className="border-t border-slate-700 pt-5">
      <div className="flex items-center justify-between mb-3">
        <div className="text-sm font-medium text-slate-300">{label}</div>
        <button
          type="button"
          role="switch"
          aria-checked={enabled}
          onClick={() => onToggle(!enabled)}
          className={`relative w-10 h-5 rounded-full overflow-hidden transition-colors ${
            enabled ? 'bg-emerald-500' : 'bg-slate-600'
          }`}
        >
          <span
            className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all duration-200 ${
              enabled ? 'left-5' : 'left-0.5'
            }`}
          />
        </button>
      </div>

      {enabled && cta && (
        <div className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <input
              type="text"
              value={cta.testo}
              onChange={(e) => onChange('testo', e.target.value)}
              placeholder="Testo bottone"
              className="bg-slate-700 border border-slate-600 text-white placeholder-slate-400 rounded px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary text-sm"
            />
            <input
              type="text"
              value={cta.href}
              onChange={(e) => onChange('href', e.target.value)}
              placeholder="Link (tel:, https://, /percorso)"
              className="bg-slate-700 border border-slate-600 text-white placeholder-slate-400 rounded px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary text-sm"
            />
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs text-slate-500">Collega a:</span>
            {CTA_LINK_RAPIDI.map((rapido) => (
              <button
                key={rapido.href}
                type="button"
                onClick={() => {
                  onChange('href', rapido.href)
                  if (rapido.icona !== 'none') onChange('icona', rapido.icona)
                }}
                className={`text-xs rounded-full border px-3 py-1 transition-colors ${
                  cta.href === rapido.href
                    ? 'border-emerald-500 bg-emerald-500/10 text-emerald-300'
                    : 'border-slate-600 text-slate-300 hover:border-slate-400'
                }`}
              >
                {rapido.label}
              </button>
            ))}
          </div>
          <p className="text-xs text-slate-500">
            <code>{'{telefono}'}</code>, <code>{'{whatsapp}'}</code> ed <code>{'{email}'}</code> nel
            link vengono sostituiti con i dati di Contatti &amp; info, così restano aggiornati.
          </p>
          <div>
            <label className="block text-xs text-slate-500 mb-1">Icona</label>
            <select
              value={cta.icona || 'none'}
              onChange={(e) => onChange('icona', e.target.value)}
              className="w-full bg-slate-700 border border-slate-600 text-white rounded px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary text-sm"
            >
              {CTA_ICONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}
    </div>
  )
}
