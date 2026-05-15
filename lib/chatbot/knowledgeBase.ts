import { adminDb } from '@/lib/firebase/admin'
import { CENTER_INFO } from '@/lib/siteConfig'
import type {
  Specialistica,
  Medico,
  Patologia,
  NewsEvento,
  Convenzione,
} from '@/types'

/**
 * Base di conoscenza del chatbot: testo semplice compilato dai contenuti
 * pubblicati su Firestore. Viene letta ad ogni richiesta (con cache ~5 min)
 * cosi il chatbot resta sempre allineato al sito.
 */

const TTL_MS = 5 * 60 * 1000 // 5 minuti
let cache: { value: string; expires: number } | null = null

/** Rimuove tag/entita HTML e normalizza gli spazi. */
function stripHtml(html: string | undefined | null): string {
  if (!html) return ''
  return html
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, ' ')
    .trim()
}

/** Tronca un testo lungo per contenere il costo in token. */
function truncate(text: string, max: number): string {
  if (text.length <= max) return text
  return text.slice(0, max).trimEnd() + '…'
}

/** Costruisce la knowledge base interrogando Firestore. */
async function buildKnowledgeBase(): Promise<string> {
  const [specSnap, mediciSnap, patSnap, newsSnap, convSnap] = await Promise.all([
    adminDb.collection('specialistiche').get(),
    adminDb.collection('medici').get(),
    adminDb.collection('patologie').get(),
    adminDb.collection('news_eventi').get(),
    adminDb.collection('convenzioni').get(),
  ])

  const specialistiche = specSnap.docs
    .map((d) => ({ id: d.id, ...(d.data() as Omit<Specialistica, 'id'>) }))
    .filter((s) => s.pubblicata !== false)
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))

  const medici = mediciSnap.docs
    .map((d) => ({ id: d.id, ...(d.data() as Omit<Medico, 'id'>) }))
    .filter((m) => m.pubblicato === true)

  const patologie = patSnap.docs.map((d) => ({
    id: d.id,
    ...(d.data() as Omit<Patologia, 'id'>),
  }))

  const news = newsSnap.docs
    .map((d) => ({ id: d.id, ...(d.data() as Omit<NewsEvento, 'id'>) }))
    .filter((n) => n.pubblicato === true)
    .sort((a, b) => (b.dataPublicazione || '').localeCompare(a.dataPublicazione || ''))
    .slice(0, 8)

  const convenzioni = convSnap.docs
    .map((d) => ({ id: d.id, ...(d.data() as Omit<Convenzione, 'id'>) }))
    .filter((c) => c.attiva)

  // Mappe id -> nome per risolvere le relazioni
  const specById = new Map(specialistiche.map((s) => [s.id, s.nome]))
  const medicoById = new Map(medici.map((m) => [m.id, m.nome]))
  const sottoById = new Map<string, string>()
  for (const s of specialistiche) {
    for (const sotto of s.sottoSpecialistiche ?? []) {
      sottoById.set(sotto.id, sotto.nome)
    }
  }

  const sections: string[] = []

  // ─── Centro ──────────────────────────────────────────────────
  sections.push(
    [
      '=== INFORMAZIONI SUL CENTRO ===',
      `Nome: ${CENTER_INFO.nome}`,
      `Indirizzo: ${CENTER_INFO.indirizzo}`,
      `Telefono: ${CENTER_INFO.telefono}`,
      `Orari di apertura: ${CENTER_INFO.orari}`,
      'Per prenotare una visita si usa la pagina /prenota del sito oppure si chiama il centro.',
    ].join('\n')
  )

  // ─── Specialistiche ──────────────────────────────────────────
  if (specialistiche.length > 0) {
    const lines = specialistiche.map((s) => {
      const parts = [`• ${s.nome}`]
      if (s.descrizioneBreve) parts.push(`  Sintesi: ${s.descrizioneBreve}`)
      const desc = stripHtml(s.descrizione)
      if (desc) parts.push(`  Descrizione: ${truncate(desc, 600)}`)
      const sotto = s.sottoSpecialistiche ?? []
      if (sotto.length > 0) {
        parts.push('  Prestazioni / sotto-specialistiche:')
        for (const ss of sotto) {
          const ssDesc = ss.descrizione ? ` — ${truncate(ss.descrizione, 250)}` : ''
          parts.push(`    - ${ss.nome}${ssDesc}`)
        }
      }
      return parts.join('\n')
    })
    sections.push(`=== SPECIALISTICHE E PRESTAZIONI ===\n${lines.join('\n')}`)
  }

  // ─── Medici ──────────────────────────────────────────────────
  if (medici.length > 0) {
    const lines = medici.map((m) => {
      const parts = [`• ${m.nome}${m.mansione ? ` — ${m.mansione}` : ''}`]
      const aree = (m.specialisticheIds ?? [])
        .map((id) => specById.get(id))
        .filter(Boolean)
      if (aree.length > 0) parts.push(`  Aree: ${aree.join(', ')}`)
      const terapie = (m.sottoSpecialisticheIds ?? [])
        .map((id) => sottoById.get(id))
        .filter(Boolean)
      if (terapie.length > 0) parts.push(`  Terapie/prestazioni: ${terapie.join(', ')}`)
      const bio = stripHtml(m.bio)
      if (bio) parts.push(`  Bio: ${truncate(bio, 400)}`)
      const cv = stripHtml(m.curriculum)
      if (cv) parts.push(`  Curriculum: ${truncate(cv, 600)}`)
      if (m.suChiamata) {
        parts.push('  Disponibilita: riceve su appuntamento (medico esterno, nessun orario fisso).')
      } else if (m.orari && m.orari.length > 0) {
        const orari = m.orari
          .map((o) => `${o.giorno} ${o.ore} (${o.tipo})`)
          .join('; ')
        parts.push(`  Orari: ${orari}`)
      }
      if (m.telefono) parts.push(`  Telefono: ${m.telefono}`)
      if (m.email) parts.push(`  Email: ${m.email}`)
      return parts.join('\n')
    })
    sections.push(`=== MEDICI ===\n${lines.join('\n')}`)
  }

  // ─── Patologie ───────────────────────────────────────────────
  if (patologie.length > 0) {
    const lines = patologie.map((p) => {
      const parts = [`• ${p.nome}`]
      const specNome = specById.get(p.specialisticaId)
      if (specNome) parts.push(`  Specialistica: ${specNome}`)
      const desc = stripHtml(p.descrizione)
      if (desc) parts.push(`  Descrizione: ${truncate(desc, 500)}`)
      const med = (p.mediciIds ?? []).map((id) => medicoById.get(id)).filter(Boolean)
      if (med.length > 0) parts.push(`  Medici che la trattano: ${med.join(', ')}`)
      return parts.join('\n')
    })
    sections.push(`=== PATOLOGIE TRATTATE ===\n${lines.join('\n')}`)
  }

  // ─── News / Eventi ───────────────────────────────────────────
  if (news.length > 0) {
    const lines = news.map((n) => {
      const parts = [`• [${n.categoria}] ${n.titolo} (${n.dataPublicazione?.slice(0, 10) ?? ''})`]
      const corpo = stripHtml(n.corpo)
      if (corpo) parts.push(`  ${truncate(corpo, 400)}`)
      return parts.join('\n')
    })
    sections.push(`=== NEWS ED EVENTI RECENTI ===\n${lines.join('\n')}`)
  }

  // ─── Convenzioni ─────────────────────────────────────────────
  if (convenzioni.length > 0) {
    const lines = convenzioni.map((c) => {
      const desc = c.descrizione ? ` — ${c.descrizione}` : ''
      return `• ${c.nome}${desc}`
    })
    sections.push(`=== CONVENZIONI ATTIVE ===\n${lines.join('\n')}`)
  }

  return sections.join('\n\n')
}

/**
 * Restituisce la knowledge base, servendola dalla cache se ancora valida.
 * In caso di errore di build, ripiega su una cache stale se disponibile.
 */
export async function getKnowledgeBase(): Promise<string> {
  if (cache && Date.now() < cache.expires) {
    return cache.value
  }
  try {
    const value = await buildKnowledgeBase()
    cache = { value, expires: Date.now() + TTL_MS }
    return value
  } catch (error) {
    if (cache) {
      console.error('[chatbot] buildKnowledgeBase fallita, uso cache stale:', error)
      return cache.value
    }
    throw error
  }
}
