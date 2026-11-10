'use client'

import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import type { AccessibilityState } from '@/types'

interface AccessibilityContextType extends AccessibilityState {
  toggleDsaMode: () => void
  toggleHighContrast: () => void
}

const defaultState: AccessibilityState = {
  dsaMode: false,
  highContrast: false,
}

/** Chiave in localStorage: la legge anche lo script in <head> di app/layout.tsx */
export const CHIAVE_ACCESSIBILITA = 'accessibility'

export const AccessibilityContext = createContext<AccessibilityContextType>({
  ...defaultState,
  toggleDsaMode: () => {},
  toggleHighContrast: () => {},
})

export function useAccessibility() {
  return useContext(AccessibilityContext)
}

function applyClasses(s: AccessibilityState) {
  const html = document.documentElement
  html.classList.toggle('dsa-mode', s.dsaMode)
  html.classList.toggle('high-contrast', s.highContrast)
}

/**
 * localStorage può non esistere o lanciare un errore (Chrome con "blocca i
 * dati dei siti", modalità privata di alcuni browser): prima l'errore usciva
 * dall'effect e faceva crollare tutto il sito pubblico. Qui si ignora: le
 * preferenze semplicemente non vengono ricordate.
 */
function leggi(): AccessibilityState | null {
  try {
    const salvato = window.localStorage.getItem(CHIAVE_ACCESSIBILITA)
    if (!salvato) return null
    const dati = JSON.parse(salvato) as Partial<AccessibilityState>
    return { dsaMode: !!dati.dsaMode, highContrast: !!dati.highContrast }
  } catch {
    return null
  }
}

function salva(s: AccessibilityState) {
  try {
    window.localStorage.setItem(CHIAVE_ACCESSIBILITA, JSON.stringify(s))
  } catch {
    /* preferenza non ricordata, ma applicata */
  }
}

export function useAccessibilityProvider() {
  const [state, setState] = useState<AccessibilityState>(defaultState)

  useEffect(() => {
    const salvato = leggi()
    if (salvato) {
      setState(salvato)
      applyClasses(salvato)
    }
  }, [])

  const aggiorna = useCallback((modifica: (s: AccessibilityState) => AccessibilityState) => {
    setState((prev) => {
      const next = modifica(prev)
      salva(next)
      applyClasses(next)
      return next
    })
  }, [])

  const toggleDsaMode = useCallback(() => aggiorna((s) => ({ ...s, dsaMode: !s.dsaMode })), [aggiorna])
  const toggleHighContrast = useCallback(
    () => aggiorna((s) => ({ ...s, highContrast: !s.highContrast })),
    [aggiorna]
  )

  return { ...state, toggleDsaMode, toggleHighContrast }
}
