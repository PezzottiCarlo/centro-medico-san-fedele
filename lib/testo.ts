/**
 * Testo semplice da HTML redazionale: per meta description, JSON-LD,
 * anteprime delle card e la knowledge base del chatbot. Prima c'erano sette
 * copie di questa funzione, con regole diverse.
 */
export function testoSemplice(html: string | undefined | null): string {
  if (!html) return ''
  return html
    .replace(/<(br|\/p|\/li|\/h[1-6])\s*\/?>/gi, ' ')
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#0?39;|&apos;/g, "'")
    .replace(/\s+/g, ' ')
    .trim()
}

/** Primi `max` caratteri, tagliati a fine parola con "…"; stringa vuota se non c'è testo. */
export function riassunto(testo: string | undefined | null, max = 160): string {
  const pulito = testoSemplice(testo)
  if (pulito.length <= max) return pulito
  const taglio = pulito.slice(0, max - 1)
  const spazio = taglio.lastIndexOf(' ')
  return `${(spazio > max * 0.6 ? taglio.slice(0, spazio) : taglio).replace(/[\s,;:.]+$/, '')}…`
}

/**
 * Testo dell'admin, oppure stringa vuota se è un segnaposto rimasto lì ("da
 * fare", "todo", "xxx", una sola lettera…): meglio nessuna descrizione che
 * "da fare" in vista ai pazienti.
 */
export function testoReale(testo: string | undefined | null): string {
  const t = (testo ?? '').trim()
  if (t.length < 3) return ''
  if (/^(da fare|todo|tbd|xxx+|lorem ipsum|test|prova)\b/i.test(t)) return ''
  return t
}
