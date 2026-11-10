'use client'

import { useEffect, useState, type ReactNode } from 'react'
import { onAuthStateChanged, signOut } from 'firebase/auth'
import { Loader2 } from 'lucide-react'
import { auth } from '@/lib/firebase/client'

/**
 * Le pagine admin scrivono su Firestore dal browser: servono sia il cookie di
 * sessione (verificato dal layout sul server) sia l'utente Firebase del
 * browser. Se quest'ultimo manca (cache cancellata, logout da un'altra scheda)
 * i salvataggi fallirebbero con un errore generico: meglio riportare al login.
 */
export function GuardiaAdmin({ children }: { children: ReactNode }) {
  const [stato, setStato] = useState<'attesa' | 'ok'>('attesa')

  useEffect(() => {
    return onAuthStateChanged(auth, async (utente) => {
      if (utente) {
        setStato('ok')
        return
      }
      await fetch('/api/auth/session', { method: 'DELETE' }).catch(() => {})
      await signOut(auth).catch(() => {})
      window.location.replace('/admin/login?motivo=sessione')
    })
  }, [])

  if (stato === 'attesa') {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center" role="status">
        <Loader2 size={32} className="animate-spin text-primary" aria-hidden />
        <span className="sr-only">Verifica dell&apos;accesso in corso…</span>
      </div>
    )
  }
  return <>{children}</>
}
