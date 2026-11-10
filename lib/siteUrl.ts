/**
 * Indirizzo pubblico del sito, senza barra finale: URL canonici, sitemap,
 * dati strutturati e link nelle email partono tutti da qui.
 */
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || 'https://www.centrosanfedele.it').replace(
  /\/+$/,
  ''
)

/**
 * Da dove WhatsApp, Facebook e simili scaricano l'immagine di anteprima e il
 * logo. Finché il dominio vero non è attivo, SITE_URL risponde 404 e i link
 * condivisi restano senza immagine: OG_BASE_URL (apphosting.yaml) punta
 * all'indirizzo che serve davvero il sito. Senza, vale SITE_URL.
 */
export const OG_BASE_URL = (process.env.OG_BASE_URL || SITE_URL).replace(/\/+$/, '')
