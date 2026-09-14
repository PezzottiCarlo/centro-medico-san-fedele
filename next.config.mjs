const isDev = process.env.NODE_ENV !== 'production'

// Il bucket cambia fra ambienti: leggerlo qui evita di inchiodare in config il
// nome di quello di sviluppo.
const bucket =
  process.env.FIREBASE_STORAGE_BUCKET ||
  process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET ||
  'san-fedele-dev.firebasestorage.app'

/**
 * Content Security Policy.
 *
 * `unsafe-inline` sugli script resta necessario finché Next inietta il proprio
 * bootstrap inline senza nonce; il resto è chiuso. Anche così la policy blocca
 * l'incorporamento in iframe di terzi, i plugin e la riscrittura di <base>.
 */
const csp = [
  "default-src 'self'",
  // google.com/gstatic.com servono a reCAPTCHA
  `script-src 'self' 'unsafe-inline' https://www.google.com https://www.gstatic.com${isDev ? " 'unsafe-eval'" : ''}`,
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "font-src 'self' https://fonts.gstatic.com data:",
  `img-src 'self' data: blob: https://storage.googleapis.com https://firebasestorage.googleapis.com`,
  // Firestore, Auth, Storage e Places; in sviluppo anche il websocket di HMR
  `connect-src 'self' https://*.googleapis.com https://*.google.com${isDev ? ' ws: wss:' : ''}`,
  // La mappa nella pagina Contatti e il frame di reCAPTCHA
  "frame-src https://www.google.com https://recaptcha.google.com",
  "frame-ancestors 'none'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  // Solo in produzione: su http://<ip-lan>:3000 del dev server questa direttiva
  // promuove CSS, immagini e script a https, dove non c'è nessun TLS ad
  // ascoltare, e la pagina resta senza stili. Su localhost non si nota perché
  // il browser lo considera già un'origine sicura e la salta.
  ...(isDev ? [] : ['upgrade-insecure-requests']),
].join('; ')

const securityHeaders = [
  { key: 'Content-Security-Policy', value: csp },
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  {
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=(), payment=(), usb=()',
  },
  // HSTS ha senso solo dove si serve davvero in https
  ...(isDev
    ? []
    : [
        {
          key: 'Strict-Transport-Security',
          value: 'max-age=63072000; includeSubDomains; preload',
        },
      ]),
]

/** @type {import('next').NextConfig} */
const nextConfig = {
  // `sanitize-html` è CJS ma tira dentro `htmlparser2`, che è ESM-only: il
  // bundler di Next non li concilia. Gira solo lato server, quindi lo lasciamo
  // risolvere a Node a runtime invece di impacchettarlo.
  experimental: {
    serverComponentsExternalPackages: ['sanitize-html'],
  },

  images: {
    // Il `pathname` è la parte che conta: senza, `storage.googleapis.com`
    // autorizzerebbe qualunque bucket pubblico del mondo, e quindi qualunque
    // file scelto da un estraneo, a passare per l'ottimizzatore di immagini.
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'storage.googleapis.com',
        pathname: `/${bucket}/**`,
      },
      {
        protocol: 'https',
        hostname: 'firebasestorage.googleapis.com',
        pathname: `/v0/b/${bucket}/**`,
      },
    ],
  },

  async headers() {
    return [{ source: '/:path*', headers: securityHeaders }]
  },
}

export default nextConfig
