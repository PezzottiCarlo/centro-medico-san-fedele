'use client'

import { useState } from 'react'
import { signOut } from 'firebase/auth'
import { auth } from '@/lib/firebase/client'

export function LogoutButton() {
  const [inCorso, setInCorso] = useState(false)

  async function handleLogout() {
    setInCorso(true)
    // Prima il server (revoca e cookie), poi il browser: l'SDK Firebase tiene
    // l'utente in IndexedDB e senza signOut chi usa il PC dopo resterebbe
    // autenticato e potrebbe ancora leggere le richieste dei pazienti.
    try {
      await fetch('/api/auth/session', { method: 'DELETE' })
    } finally {
      await signOut(auth).catch(() => {})
      window.location.href = '/admin/login'
    }
  }

  return (
    <button
      type="button"
      onClick={handleLogout}
      disabled={inCorso}
      className="text-sm text-red-400 hover:text-red-300 transition-colors disabled:opacity-50"
    >
      {inCorso ? 'Uscita…' : 'Esci'}
    </button>
  )
}
