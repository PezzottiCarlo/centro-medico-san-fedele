'use client'

import { useCallback } from 'react'

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

const ATTESA_MAX_MS = 8_000

/** Rifiuta se `promessa` non si risolve entro `ms`: uno script bloccato non deve congelare il modulo. */
function conTimeout<T>(promessa: Promise<T>, ms: number): Promise<T> {
  return new Promise((resolve, reject) => {
    const t = window.setTimeout(() => reject(new Error('timeout reCAPTCHA')), ms)
    promessa.then(
      (v) => {
        window.clearTimeout(t)
        resolve(v)
      },
      (e) => {
        window.clearTimeout(t)
        reject(e)
      }
    )
  })
}

/**
 * Carica lo script di reCAPTCHA solo quando serve davvero.
 *
 * Non lo mettiamo nel layout: sarebbe un terzo servizio Google su ogni pagina,
 * anche su quelle senza moduli, con il relativo passaggio di indirizzo IP da
 * dichiarare nella cookie policy. Qui parte alla prima richiesta di token,
 * cioè all'invio del modulo.
 *
 * Il caricamento è condiviso da tutti i moduli della pagina; se fallisce si
 * azzera, così il prossimo invio riprova da capo.
 */
let caricamento: Promise<void> | null = null

function caricaScript(): Promise<void> {
  if (!caricamento) {
    caricamento = nuovoCaricamento().catch((e) => {
      caricamento = null
      throw e
    })
  }
  return caricamento
}

function nuovoCaricamento(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined') return reject(new Error('no window'))
    if (window.grecaptcha) return resolve()

    // Un tag rimasto da un tentativo fallito non scatenerà più load/error:
    // aspettarlo bloccherebbe l'invio per sempre. Si toglie e si riprova.
    document.getElementById(SCRIPT_ID)?.remove()

    const s = document.createElement('script')
    s.id = SCRIPT_ID
    s.src = `https://www.google.com/recaptcha/api.js?render=${SITE_KEY}`
    s.async = true
    s.onload = () => resolve()
    s.onerror = () => {
      s.remove()
      reject(new Error('script non caricato'))
    }
    document.head.appendChild(s)
  })
}

/**
 * Restituisce una funzione che produce un token reCAPTCHA per l'azione data.
 * Senza site key configurata torna `undefined`: il modulo funziona lo stesso e
 * il server, non avendo il segreto, salta a sua volta la verifica.
 *
 * Se lo script non si carica (ad blocker, rete) torna `undefined` entro pochi
 * secondi: il server, con il segreto configurato, rifiuta la richiesta e il
 * modulo mostra il messaggio d'errore con l'invito a chiamare.
 */
export function useRecaptcha() {
  return useCallback(async (azione: string): Promise<string | undefined> => {
    if (!SITE_KEY) return undefined
    try {
      await conTimeout(caricaScript(), ATTESA_MAX_MS)
      const grecaptcha = window.grecaptcha
      if (!grecaptcha) return undefined
      await conTimeout(new Promise<void>((r) => grecaptcha.ready(() => r())), ATTESA_MAX_MS)
      return await conTimeout(grecaptcha.execute(SITE_KEY, { action: azione }), ATTESA_MAX_MS)
    } catch {
      return undefined
    }
  }, [])
}
