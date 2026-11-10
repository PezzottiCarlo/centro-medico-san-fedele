const ETICHETTE: Record<string, string> = {
  news: 'News',
  articolo: 'Articolo',
  evento: 'Evento',
}

/** "articolo" → "Articolo": stessa etichetta nella lista e nel dettaglio. */
export function etichettaCategoria(categoria: string | undefined): string {
  return (categoria && ETICHETTE[categoria]) || categoria || ''
}
