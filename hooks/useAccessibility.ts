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

export const AccessibilityContext = createContext<AccessibilityContextType>({
  ...defaultState,
  toggleDsaMode: () => {},
  toggleHighContrast: () => {},
})

export function useAccessibility() {
  return useContext(AccessibilityContext)
}

export function useAccessibilityProvider() {
  const [state, setState] = useState<AccessibilityState>(defaultState)

  useEffect(() => {
    const stored = localStorage.getItem('accessibility')
    if (stored) {
      try {
        const parsed = JSON.parse(stored) as AccessibilityState
        setState(parsed)
        applyClasses(parsed)
      } catch {}
    }
  }, [])

  function applyClasses(s: AccessibilityState) {
    const html = document.documentElement
    html.classList.toggle('dsa-mode', s.dsaMode)
    html.classList.toggle('high-contrast', s.highContrast)
  }

  const toggleDsaMode = useCallback(() => {
    setState((prev) => {
      const next = { ...prev, dsaMode: !prev.dsaMode }
      localStorage.setItem('accessibility', JSON.stringify(next))
      applyClasses(next)
      return next
    })
  }, [])

  const toggleHighContrast = useCallback(() => {
    setState((prev) => {
      const next = { ...prev, highContrast: !prev.highContrast }
      localStorage.setItem('accessibility', JSON.stringify(next))
      applyClasses(next)
      return next
    })
  }, [])

  return { ...state, toggleDsaMode, toggleHighContrast }
}
