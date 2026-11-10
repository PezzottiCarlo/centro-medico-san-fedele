import { adminDb } from '@/lib/firebase/admin'

/**
 * Catalogo pubblicato (specialistiche, sotto-specialistiche, medici) usato per
 * verificare le richieste dei moduli: il client manda slug o nomi, il server
 * accetta solo quelli che esistono davvero e ne ricava il nome leggibile.
 * Così nelle mail e nei lead non finisce testo arbitrario (anti-phishing) e
 * la segreteria legge "Fisioterapia", non "fisioterapia-riabilitazione".
 */

interface VoceCatalogo {
  slug: string
  nome: string
  sotto: { id: string; nome: string }[]
}

interface Catalogo {
  specialistiche: VoceCatalogo[]
  medici: { slug: string; nome: string }[]
}

const TTL_MS = 5 * 60 * 1000
let cache: { valore: Catalogo; scade: number } | null = null

async function leggiCatalogo(): Promise<Catalogo> {
  if (cache && Date.now() < cache.scade) return cache.valore
  const [specSnap, mediciSnap] = await Promise.all([
    adminDb.collection('specialistiche').where('pubblicata', '==', true).get(),
    adminDb.collection('medici').where('pubblicato', '==', true).get(),
  ])
  const valore: Catalogo = {
    specialistiche: specSnap.docs.map((d) => {
      const x = d.data()
      return {
        slug: String(x.slug ?? ''),
        nome: String(x.nome ?? ''),
        sotto: ((x.sottoSpecialistiche ?? []) as { id?: string; nome?: string }[])
          .filter((s) => s.id && s.nome)
          .map((s) => ({ id: String(s.id), nome: String(s.nome).trim() })),
      }
    }),
    medici: mediciSnap.docs.map((d) => ({
      slug: String(d.get('slug') ?? ''),
      nome: String(d.get('nome') ?? ''),
    })),
  }
  cache = { valore, scade: Date.now() + TTL_MS }
  return valore
}

function normalizza(testo: string): string {
  return testo.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/\s+/g, ' ').trim()
}

export interface ScelteVerificate {
  specialistica?: { slug: string; nome: string }
  sottoSpecialistica?: { id: string; nome: string }
  medico?: { slug: string; nome: string }
}

/**
 * Risolve le scelte del modulo sul catalogo. Valori sconosciuti vengono
 * scartati (non bloccano la richiesta: il paziente viene comunque richiamato).
 * La specialistica si accetta per slug o per nome, perché i moduli più vecchi
 * mandavano il nome.
 */
export async function verificaScelte(input: {
  specialistica?: string
  sottoSpecialistica?: string
  medico?: string
}): Promise<ScelteVerificate> {
  const catalogo = await leggiCatalogo()
  const esito: ScelteVerificate = {}

  if (input.specialistica) {
    const chiave = normalizza(input.specialistica)
    const spec = catalogo.specialistiche.find(
      (s) => s.slug === input.specialistica || normalizza(s.nome) === chiave
    )
    if (spec) {
      esito.specialistica = { slug: spec.slug, nome: spec.nome }
      if (input.sottoSpecialistica) {
        const chiaveSotto = normalizza(input.sottoSpecialistica)
        const sotto = spec.sotto.find(
          (s) => s.id === input.sottoSpecialistica || normalizza(s.nome) === chiaveSotto
        )
        if (sotto) esito.sottoSpecialistica = sotto
      }
    }
  }

  if (input.medico) {
    const medico = catalogo.medici.find((m) => m.slug === input.medico)
    if (medico) esito.medico = medico
  }

  return esito
}
