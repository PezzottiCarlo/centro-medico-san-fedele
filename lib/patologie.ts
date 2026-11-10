import { adminDb } from '@/lib/firebase/admin'
import { pulisciHtml } from '@/lib/sanitizeHtml'
import { riassunto, testoReale, testoSemplice } from '@/lib/testo'
import { specialisticaHref } from '@/lib/utils'
import type { Medico, Patologia, Specialistica } from '@/types'

/**
 * Tutto quello che serve per mostrare una patologia nella sua finestra
 * (components/patologie): le patologie non hanno più una pagina propria.
 * Preparato sul server, così nel browser arriva HTML già ripulito.
 */
export interface SchedaPatologia {
  id: string
  slug: string
  nome: string
  /** Descrizione dall'editor, già passata da pulisciHtml */
  descrizioneHtml: string
  /** Testo breve per la card (vuoto se la descrizione è un segnaposto) */
  anteprima: string
  immagine?: string
  /** Solo se la specialistica è pubblicata */
  specialistica: { nome: string; icona: string; href: string } | null
  /** Solo i medici pubblicati, in ordine alfabetico */
  medici: { id: string; nome: string; slug: string; foto?: string }[]
  prenotaHref: string
}

/**
 * Le patologie con i dati per la finestra. Con `specialisticaId` solo quelle
 * di una specialistica (pagine Specialistica e Medicina sportiva).
 */
export async function caricaSchedePatologie(specialisticaId?: string): Promise<SchedaPatologia[]> {
  const [patSnap, specSnap, mediciSnap] = await Promise.all([
    specialisticaId
      ? adminDb.collection('patologie').where('specialisticaId', '==', specialisticaId).get()
      : adminDb.collection('patologie').get(),
    adminDb.collection('specialistiche').where('pubblicata', '==', true).get(),
    adminDb.collection('medici').where('pubblicato', '==', true).get(),
  ])

  const specialistiche = new Map(
    specSnap.docs.map((d) => [d.id, { id: d.id, ...(d.data() as Omit<Specialistica, 'id'>) }])
  )
  const medici = new Map(
    mediciSnap.docs.map((d) => [d.id, { id: d.id, ...(d.data() as Omit<Medico, 'id'>) }])
  )

  return patSnap.docs
    .map((d) => ({ id: d.id, ...(d.data() as Omit<Patologia, 'id'>) }))
    .filter((p) => typeof p.slug === 'string' && p.slug && typeof p.nome === 'string' && p.nome.trim())
    .sort((a, b) => a.nome.localeCompare(b.nome, 'it'))
    .map((p) => {
      const spec = p.specialisticaId ? specialistiche.get(p.specialisticaId) : undefined
      // Anche "<p>da fare</p>" è un segnaposto: si controlla il testo, non l'HTML
      const testo = testoReale(testoSemplice(p.descrizione))
      return {
        id: p.id,
        slug: p.slug,
        nome: p.nome.trim(),
        descrizioneHtml: testo ? pulisciHtml(p.descrizione) : '',
        anteprima: riassunto(testo, 120),
        immagine: p.immagine || undefined,
        specialistica: spec
          ? { nome: spec.nome, icona: spec.icona ?? '', href: specialisticaHref(spec.slug) }
          : null,
        medici: (p.mediciIds ?? [])
          .map((id) => medici.get(id))
          .filter((m): m is Medico => !!m && typeof m.slug === 'string' && !!m.slug)
          .sort((a, b) => a.nome.localeCompare(b.nome, 'it'))
          .map((m) => ({ id: m.id, nome: m.nome, slug: m.slug, foto: m.foto || undefined })),
        prenotaHref: spec ? `/prenota?specialistica=${encodeURIComponent(spec.slug)}` : '/prenota',
      }
    })
}
