import sanitizeHtml from 'sanitize-html'

// Le immagini nei testi devono stare nel nostro bucket: quelle linkate da siti
// esterni (es. miniature di Google Immagini) sono bloccate dalla CSP, restano
// rotte e possono avere problemi di copyright. Meglio scartarle qui.
const BUCKET =
  process.env.FIREBASE_STORAGE_BUCKET ||
  process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET ||
  'san-fedele-dev.firebasestorage.app'

function immagineNostra(src: string): boolean {
  return (
    src.startsWith('/') ||
    src.startsWith(`https://storage.googleapis.com/${BUCKET}/`) ||
    src.startsWith(`https://firebasestorage.googleapis.com/v0/b/${BUCKET}/`)
  )
}

/**
 * Ripulisce l'HTML redazionale prima di iniettarlo con `dangerouslySetInnerHTML`.
 *
 * I testi lunghi del sito (corpo delle news, curriculum dei medici, descrizioni
 * di specialistiche, patologie ed eventi storia) arrivano dall'editor del
 * pannello admin e finiscono in pagina come HTML grezzo. Senza questo passaggio
 * chiunque possa scrivere su Firestore potrebbe piazzare uno `<script>`
 * permanente su una pagina pubblica.
 *
 * L'elenco dei tag è quello che l'editor sa produrre, più i titoli: tutto il
 * resto viene scartato invece che scappare — in particolare `script`, `style`,
 * `iframe`, `object` e qualunque attributo `on*`.
 */
const OPZIONI: sanitizeHtml.IOptions = {
  allowedTags: [
    'p', 'br', 'hr',
    'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
    'strong', 'b', 'em', 'i', 'u', 's', 'sub', 'sup', 'mark',
    'ul', 'ol', 'li',
    'blockquote', 'code', 'pre',
    'a', 'img',
    'table', 'thead', 'tbody', 'tr', 'th', 'td',
    'span', 'div',
  ],
  allowedAttributes: {
    a: ['href', 'title', 'target', 'rel'],
    img: ['src', 'alt', 'title', 'width', 'height', 'loading'],
    // `class` serve alle utility di formattazione dell'editor
    '*': ['class'],
  },
  // Niente `javascript:` né `vbscript:`; immagini solo https (e dal bucket, vedi sotto)
  allowedSchemes: ['http', 'https', 'mailto', 'tel'],
  allowedSchemesByTag: { img: ['https'] },
  allowProtocolRelative: false,
  // I link esterni non devono poter manipolare la finestra che li ha aperti
  transformTags: {
    // La pagina ha già il suo h1: un h1 nel testo (es. il nome del medico in
    // cima alla bio) ne creerebbe un secondo
    h1: 'h2',
    a: (tagName, attribs) => {
      const href = attribs.href ?? ''
      const esterno = /^https?:\/\//i.test(href)
      return {
        tagName,
        attribs: esterno
          ? { ...attribs, target: '_blank', rel: 'noopener noreferrer' }
          : attribs,
      }
    },
  },
  // Il contenuto di questi tag va buttato insieme al tag, non lasciato come testo
  nonTextTags: ['style', 'script', 'textarea', 'option', 'noscript'],
  exclusiveFilter: (frame) =>
    // Immagini fuori dal bucket e titoli vuoti (l'editor ne lascia di vuoti)
    (frame.tag === 'img' && !immagineNostra(frame.attribs.src ?? '')) ||
    (/^h[1-6]$/.test(frame.tag) && !frame.text.trim() && !frame.mediaChildren.length),
}

/** HTML redazionale ripulito, pronto per `dangerouslySetInnerHTML`. */
export function pulisciHtml(html: string | null | undefined): string {
  if (!html) return ''
  return sanitizeHtml(html, OPZIONI)
}

/**
 * Serializza un oggetto per un blocco `<script type="application/ld+json">`.
 *
 * `JSON.stringify` da solo non basta: una stringa che contenga `</script>`
 * chiuderebbe il blocco in anticipo e il resto verrebbe interpretato come
 * markup. I dati arrivano da Firestore, quindi la sequenza va neutralizzata.
 */
export function jsonLdSicuro(dati: unknown): string {
  return JSON.stringify(dati).replace(/</g, '\\u003c')
}
