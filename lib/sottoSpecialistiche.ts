import type { SottoSpecialistica } from '@/types'

/**
 * Ordine delle sotto-specialistiche di una specialistica.
 *
 * Il campo `ordine` è stato aggiunto quando il sito era già in produzione: le
 * sotto-specialistiche salvate prima non ce l'hanno. Per non cambiare nulla a
 * chi non tocca l'ordine, chi non ha `ordine` resta nella posizione in cui è
 * salvato nell'array, come prima. Al primo salvataggio dall'admin ognuna
 * riceve il suo numero (1, 2, 3, ...) nell'ordine mostrato.
 */
export function ordinaSotto<T extends Pick<SottoSpecialistica, 'ordine'>>(lista: T[]): T[] {
  return lista
    .map((sotto, indice) => ({ sotto, chiave: sotto.ordine ?? indice + 1, indice }))
    .sort((a, b) => a.chiave - b.chiave || a.indice - b.indice)
    .map(({ sotto }) => sotto)
}

/** Riassegna `ordine` 1, 2, 3, ... secondo la posizione attuale nella lista. */
export function numeraSotto(lista: SottoSpecialistica[]): SottoSpecialistica[] {
  return lista.map((sotto, indice) => ({ ...sotto, ordine: indice + 1 }))
}

/** Sposta l'elemento da `da` a `a`, lasciando invariato l'ordine relativo degli altri. */
export function spostaSotto<T>(lista: T[], da: number, a: number): T[] {
  if (a < 0 || a >= lista.length || da === a) return lista
  const copia = [...lista]
  const [elemento] = copia.splice(da, 1)
  copia.splice(a, 0, elemento)
  return copia
}
