'use client'

import { useState } from 'react'
import { Loader2, Send, CheckCircle } from 'lucide-react'
import { usePrenotaForm } from '@/hooks/usePrenotaForm'
import { ConsensiPrivacy } from '@/components/ui/ConsensiPrivacy'

interface FormData {
  nome: string
  cognome: string
  telefono: string
  email: string
  specialistica: string
  messaggio: string
  consensoDati: boolean
  consensoMarketing: boolean
}

export function HomeContactForm({ specialistiche, embedded = false }: { specialistiche: { id: string; nome: string }[]; embedded?: boolean }) {
  const { loading, success, error, submit, reset } = usePrenotaForm()
  const [form, setForm] = useState<FormData>({
    nome: '',
    cognome: '',
    telefono: '',
    email: '',
    specialistica: '',
    messaggio: '',
    consensoDati: false,
    consensoMarketing: false,
  })

  function update(key: keyof FormData, value: string) {
    setForm((f) => ({ ...f, [key]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const ok = await submit({
      nome: form.nome,
      cognome: form.cognome,
      telefono: form.telefono,
      email: form.email,
      specialistica: form.specialistica,
      messaggio: form.messaggio,
      consensoDati: form.consensoDati,
      consensoMarketing: form.consensoMarketing,
    })
    if (ok) {
      setForm({
        nome: '',
        cognome: '',
        telefono: '',
        email: '',
        specialistica: '',
        messaggio: '',
        consensoDati: false,
        consensoMarketing: false,
      })
    }
  }

  if (success) {
    return (
      <div className={embedded ? 'text-center py-12' : 'glass-card text-center py-12'}>
        <CheckCircle size={48} className="text-secondary mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-text-main mb-2">Richiesta inviata!</h3>
        <p className="text-gray-500">Ti ricontatteremo il prima possibile.</p>
        <button
          onClick={reset}
          className="btn-secondary mt-6"
        >
          Invia un&apos;altra richiesta
        </button>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className={embedded ? '' : 'glass-card'}>
      {!embedded && <h3 className="text-xl font-semibold text-text-main mb-6">Contattaci</h3>}

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-sm p-3 mb-4 text-sm">{error}</div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-sm font-medium text-text-main mb-1">Nome *</label>
          <input
            type="text"
            required
            value={form.nome}
            onChange={(e) => update('nome', e.target.value)}
            className="w-full border border-gray-200 rounded-sm px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary bg-white/80"
            placeholder="Il tuo nome"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-text-main mb-1">Cognome</label>
          <input
            type="text"
            value={form.cognome}
            onChange={(e) => update('cognome', e.target.value)}
            className="w-full border border-gray-200 rounded-sm px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary bg-white/80"
            placeholder="Il tuo cognome"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-sm font-medium text-text-main mb-1">Telefono *</label>
          <input
            type="tel"
            required
            value={form.telefono}
            onChange={(e) => update('telefono', e.target.value)}
            className="w-full border border-gray-200 rounded-sm px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary bg-white/80"
            placeholder="+39 ..."
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-text-main mb-1">Email *</label>
          <input
            type="email"
            required
            value={form.email}
            onChange={(e) => update('email', e.target.value)}
            className="w-full border border-gray-200 rounded-sm px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary bg-white/80"
            placeholder="email@esempio.it"
          />
        </div>
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium text-text-main mb-1">Servizio</label>
        <select
          value={form.specialistica}
          onChange={(e) => update('specialistica', e.target.value)}
          className="w-full border border-gray-200 rounded-sm px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary bg-white/80"
        >
          <option value="">Seleziona un servizio...</option>
          {specialistiche.map((s) => (
            <option key={s.id} value={s.nome}>{s.nome}</option>
          ))}
        </select>
      </div>

      <div className="mb-6">
        <label className="block text-sm font-medium text-text-main mb-1">Messaggio *</label>
        <textarea
          required
          value={form.messaggio}
          onChange={(e) => update('messaggio', e.target.value)}
          className="w-full border border-gray-200 rounded-sm px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary bg-white/80"
          rows={4}
          placeholder="Descrivi brevemente la tua richiesta..."
        />
      </div>

      <ConsensiPrivacy
        value={{ consensoDati: form.consensoDati, consensoMarketing: form.consensoMarketing }}
        onChange={(c) => setForm((f) => ({ ...f, ...c }))}
      />

      <button
        type="submit"
        disabled={loading || !form.consensoDati}
        className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-50"
      >
        {loading ? (
          <><Loader2 size={18} className="animate-spin" /> Invio in corso...</>
        ) : (
          <><Send size={18} /> Invia richiesta</>
        )}
      </button>
    </form>
  )
}
