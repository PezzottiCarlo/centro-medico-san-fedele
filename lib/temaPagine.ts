/**
 * Pagine con il tema scuro (slate + smeraldo): navbar e sezioni comuni del
 * layout, come "Hai una domanda?", si adattano per non spezzare lo stile.
 */
export const PAGINE_SCURE = ['/sport']

export function paginaScura(pathname: string | null): boolean {
  return !!pathname && PAGINE_SCURE.includes(pathname)
}
