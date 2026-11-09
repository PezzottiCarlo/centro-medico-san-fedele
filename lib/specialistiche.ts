/**
 * Ordine delle specialistiche: il campo `order` scelto dall'admin (valori anche
 * non consecutivi, es. 0, 2, 5), poi il nome. Chi non ha `order` va in fondo.
 *
 * È usato a basso livello (lib/firebase/admin.ts riordina ogni lettura della
 * collection) e nelle pagine admin che leggono dal browser, così nessuna
 * pagina mostra le specialistiche nell'ordine casuale di Firestore.
 */
export function confrontaSpecialistiche(
  a: { order?: unknown; nome?: unknown },
  b: { order?: unknown; nome?: unknown }
): number {
  const oa = typeof a.order === 'number' ? a.order : Number.POSITIVE_INFINITY
  const ob = typeof b.order === 'number' ? b.order : Number.POSITIVE_INFINITY
  if (oa !== ob) return oa < ob ? -1 : 1
  return String(a.nome ?? '').localeCompare(String(b.nome ?? ''), 'it')
}
