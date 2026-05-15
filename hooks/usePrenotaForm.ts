'use client'

import { useState } from 'react'

export interface PrenotaPayload {
  nome: string
  cognome?: string
  telefono?: string
  email: string
  messaggio: string
  specialistica?: string
  sottoSpecialistica?: string
  medico?: string
  fonte?: 'form'
}

interface UsePrenotaFormReturn {
  loading: boolean
  success: boolean
  error: string
  submit: (payload: PrenotaPayload) => Promise<boolean>
  reset: () => void
}

export function usePrenotaForm(): UsePrenotaFormReturn {
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  async function submit(payload: PrenotaPayload): Promise<boolean> {
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/prenota', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...payload, fonte: payload.fonte ?? 'form' }),
      })
      const data = (await res.json()) as { success?: boolean; error?: string }
      if (data.success) {
        setSuccess(true)
        return true
      }
      setError(data.error || "Errore durante l'invio. Riprova.")
      return false
    } catch {
      setError('Errore di connessione. Riprova.')
      return false
    } finally {
      setLoading(false)
    }
  }

  function reset() {
    setLoading(false)
    setSuccess(false)
    setError('')
  }

  return { loading, success, error, submit, reset }
}
