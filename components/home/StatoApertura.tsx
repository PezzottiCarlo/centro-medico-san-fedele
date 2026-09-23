'use client'

import { useEffect, useState } from 'react'
import type { SiteConfigOrario } from '@/types'

const GIORNI = ['domenica', 'lunedì', 'martedì', 'mercoledì', 'giovedì', 'venerdì', 'sabato']

function normalizza(testo: string): string {
  return testo.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
}

/** Indice (0 = domenica) del giorno citato nel testo, o -1. */
function indiceGiorno(testo: string): number {
  const t = normalizza(testo)
  return GIORNI.findIndex((g) => t.startsWith(normalizza(g).slice(0, 3)))
}

/**
 * Vero se `oggi` (0-6) cade nella riga degli orari. Capisce le forme usate in
 * site-config: "Lunedì – Venerdì", "Sabato", "Lunedì, Mercoledì".
 */
function copreGiorno(giorno: string, oggi: number): boolean {
  const parti = giorno.split(/[–—-]/).map((p) => p.trim()).filter(Boolean)
  if (parti.length === 2) {
    const da = indiceGiorno(parti[0])
    const a = indiceGiorno(parti[1])
    if (da < 0 || a < 0) return false
    return da <= a ? oggi >= da && oggi <= a : oggi >= da || oggi <= a
  }
  return giorno.split(/[,/]| e /).some((p) => indiceGiorno(p.trim()) === oggi)
}

/** Fasce "09:00 – 13:00, 14:00 – 19:30" in minuti dall'inizio del giorno. */
function fasce(ore: string): [number, number][] {
  const orari = ore.match(/\d{1,2}[:.]\d{2}/g) ?? []
  const minuti = orari.map((o) => {
    const [h, m] = o.split(/[:.]/).map(Number)
    return h * 60 + m
  })
  const risultato: [number, number][] = []
  for (let i = 0; i + 1 < minuti.length; i += 2) risultato.push([minuti[i], minuti[i + 1]])
  return risultato
}

/**
 * Pallino "Aperto ora" / "Chiuso ora", calcolato nel browser sull'ora
 * italiana. Se gli orari in site-config sono scritti in una forma che non
 * riconosce, non mostra nulla invece di sbagliare.
 */
export function StatoApertura({ orari }: { orari: SiteConfigOrario[] }) {
  const [aperto, setAperto] = useState<boolean | null>(null)

  useEffect(() => {
    function calcola() {
      const adesso = new Date(new Date().toLocaleString('en-US', { timeZone: 'Europe/Rome' }))
      const oggi = adesso.getDay()
      const minuti = adesso.getHours() * 60 + adesso.getMinutes()
      const righe = orari.filter((o) => copreGiorno(o.giorno, oggi))
      if (righe.length === 0) {
        // Nessuna riga per oggi: chiuso solo se gli orari sono leggibili almeno per un giorno
        setAperto(orari.some((o) => fasce(o.ore).length > 0) ? false : null)
        return
      }
      setAperto(righe.some((r) => fasce(r.ore).some(([da, a]) => minuti >= da && minuti < a)))
    }
    calcola()
    const t = window.setInterval(calcola, 60_000)
    return () => window.clearInterval(t)
  }, [orari])

  if (aperto === null) return null
  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold ${
        aperto ? 'bg-secondary/10 text-secondary-dark' : 'bg-gray-100 text-gray-500'
      }`}
    >
      <span className={`h-2 w-2 rounded-full ${aperto ? 'bg-secondary animate-pulse' : 'bg-gray-400'}`} />
      {aperto ? 'Aperto ora' : 'Chiuso ora'}
    </span>
  )
}
