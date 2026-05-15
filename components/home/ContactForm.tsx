'use client'

import { useState } from 'react'
import { CheckCircle, Loader2 } from 'lucide-react'
import { MelaButton } from '@/components/ui/MelaButton'
import { usePrenotaForm } from '@/hooks/usePrenotaForm'

export function ContactForm() {
  const { loading, success, error, submit } = usePrenotaForm()
  const [form, setForm] = useState({
    nome: '',
    cognome: '',
    telefono: '',
    email: '',
    messaggio: '',
  })

  const update = (k: keyof typeof form, v: string) => setForm((f) => ({ ...f, [k]: v }))

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    await submit(form)
  }

  if (success) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-12 text-center">
        <CheckCircle size={48} className="text-green-500" />
        <h3 className="font-semibold text-text-main text-lg">Messaggio inviato!</h3>
        <p className="text-gray-500 text-sm max-w-xs">
          Grazie per averci scritto. Ti risponderemo il prima possibile.
        </p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
        <div>
          <label className="block text-sm font-medium text-text-main mb-1">Nome *</label>
          <input
            type="text"
            required
            value={form.nome}
            onChange={(e) => update('nome', e.target.value)}
            placeholder="Mario"
            className="w-full border border-gray-300 rounded-sm px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-text-main mb-1">Cognome *</label>
          <input
            type="text"
            required
            value={form.cognome}
            onChange={(e) => update('cognome', e.target.value)}
            placeholder="Rossi"
            className="w-full border border-gray-300 rounded-sm px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-text-main mb-1">Telefono</label>
        <input
          type="tel"
          value={form.telefono}
          onChange={(e) => update('telefono', e.target.value)}
          placeholder="+39 333 000 0000"
          className="w-full border border-gray-300 rounded-sm px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-text-main mb-1">Email *</label>
        <input
          type="email"
          required
          value={form.email}
          onChange={(e) => update('email', e.target.value)}
          placeholder="mario@email.it"
          className="w-full border border-gray-300 rounded-sm px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-text-main mb-1">Messaggio *</label>
        <textarea
          required
          rows={5}
          value={form.messaggio}
          onChange={(e) => update('messaggio', e.target.value)}
          placeholder="Scrivi qui la tua richiesta o domanda..."
          className="w-full border border-gray-300 rounded-sm px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary resize-none"
        />
      </div>

      {error && (
        <p className="text-red-600 text-sm bg-red-50 border border-red-200 rounded p-3">{error}</p>
      )}

      <MelaButton
        type="submit"
        mela="chiama"
        melaSize="md"
        melaPosition="left"
        fullWidth
        showArrow={false}
        disabled={loading}
        className="mt-2"
      >
        {loading ? (
          <>
            <Loader2 size={18} className="animate-spin" /> La mela sta correndo...
          </>
        ) : (
          <>Inviamelo, ti rispondo!</>
        )}
      </MelaButton>
      <p className="text-xs text-gray-400">
        * Campi obbligatori. I tuoi dati saranno trattati secondo la nostra Privacy Policy.
      </p>
    </form>
  )
}
