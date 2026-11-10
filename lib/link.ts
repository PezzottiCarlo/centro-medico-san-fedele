/**
 * Link scritti a mano nell'admin (sito di una convenzione, bottoni della hero,
 * mappa): si accettano solo https, tel, mailto, wa.me e percorsi interni.
 * Un `javascript:` salvato per errore (o da chi ha accesso) diventerebbe
 * codice eseguito al clic del paziente.
 */
export function linkSicuro(href: string | undefined | null): string | null {
  const valore = href?.trim()
  if (!valore) return null
  if (valore.startsWith('/') && !valore.startsWith('//')) return valore
  if (valore.startsWith('#')) return valore
  if (/^(tel|mailto):[^\s]+$/i.test(valore)) return valore
  // Indirizzi scritti senza protocollo ("www.esempio.it"): si assume https
  const conProtocollo = /^www\./i.test(valore) ? `https://${valore}` : valore
  try {
    const url = new URL(conProtocollo)
    return url.protocol === 'https:' || url.protocol === 'http:' ? url.toString() : null
  } catch {
    return null
  }
}

/** Vero per i link che portano fuori dal sito (vanno aperti in una nuova scheda). */
export function linkEsterno(href: string): boolean {
  return /^https?:\/\//i.test(href)
}
