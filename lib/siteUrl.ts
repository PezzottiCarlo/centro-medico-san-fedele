/**
 * Indirizzo pubblico del sito, senza barra finale: URL canonici, sitemap,
 * dati strutturati e link nelle email partono tutti da qui.
 */
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || 'https://www.centrosanfedele.it').replace(
  /\/+$/,
  ''
)
