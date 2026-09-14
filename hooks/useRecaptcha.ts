'use client'

import { useCallback, useRef } from 'react'

declare global {
  interface Window {
    grecaptcha?: {
      ready: (cb: () => void) => void
      execute: (siteKey: string, opts: { action: string }) => Promise<string>
    }
  }
}

const SITE_KEY = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY
const SCRIPT_ID = 'recaptcha-v3'

/**
 * Carica lo script di reCAPTCHA solo quando serve davvero.
 *
 * Non lo mettiamo nel layout: sarebbe un terzo servizio Google su ogni pagina,
 * anche su quelle senza moduli, con il relativo passaggio di indirizzo IP da
 * dichiarare nella cookie policy. Qui parte alla prima richiesta di token,
 * cioè all'invio del modulo.
 */
function caricaScript(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined') return reject(new Error('no window'))
    if (window.grecaptcha) return resolve()

    const esistente = document.getElementById(SCRIPT_ID)
    if (esistente) {
      esistente.addEventListener('load', () => resolve())
      esistente.addEventListener('error', () => reject(new Error('script non caricato')))
      return
    }

    const s = document.createElement('script')
    s.id = SCRIPT_ID
    s.src = `https://www.google.com/recaptcha/api.js?render=${SITE_KEY}`
    s.async = true
    s.onload = () => resolve()
    s.onerror = () => reject(new Error('script non caricato'))
    document.head.appendChild(s)
  })
}

/**
 * Restituisce una funzione che produce un token reCAPTCHA per l'azione data.
 * Senza site key configurata torna `undefined`: il modulo funziona lo stesso e
 * il server, non avendo il segreto, salta a sua volta la verifica.
 */
export function useRecaptcha() {
  const pronto = useRef<Promise<void> | null>(null)

  return useCallback(async (azione: string): Promise<string | undefined> => {
    if (!SITE_KEY) return undefined
    try {
      if (!pronto.current) pronto.current = caricaScript()
      await pronto.current
      const grecaptcha = window.grecaptcha
      if (!grecaptcha) return undefined
      await new Promise<void>((r) => grecaptcha.ready(() => r()))
      return await grecaptcha.execute(SITE_KEY, { action: azione })
    } catch {
      // Rete o script bloccato da un ad blocker: meglio inviare senza token che
      // impedire del tutto la richiesta.
      return undefined
    }
  }, [])
}
