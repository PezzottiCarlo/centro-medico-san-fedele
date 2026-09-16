/**
 * Prova la configurazione SMTP senza passare dal sito.
 *
 *   npm run verifica-email            connessione + autenticazione, nessuna mail inviata
 *   npm run verifica-email -- --invia manda anche una mail di prova a EMAIL_TO
 *
 * Utile quando si cambia provider: si aggiornano le variabili nel .env, si lancia
 * questo script e si fa il deploy solo quando risponde "ok".
 *
 * La costruzione del trasporto rispecchia lib/email.ts: se cambia là, va
 * aggiornata anche qui.
 */
import nodemailer from 'nodemailer'

try {
  process.loadEnvFile('.env')
} catch {
  // Nessun .env: si usano le variabili già presenti nell'ambiente
}

const env = (k) => process.env[k]?.trim()
const host = env('EMAIL_HOST')
const port = Number(env('EMAIL_PORT')) || 587
const user = env('EMAIL_USER')
const pass = env('EMAIL_PASS')
const to = env('EMAIL_TO')
const from = env('EMAIL_FROM') || user
const secureEnv = env('EMAIL_SECURE')?.toLowerCase()
const secure = secureEnv ? secureEnv === 'true' : port === 465

const mancanti = Object.entries({ EMAIL_HOST: host, EMAIL_USER: user, EMAIL_PASS: pass })
  .filter(([, v]) => !v)
  .map(([k]) => k)
if (mancanti.length) {
  console.error(`✗ Variabili mancanti: ${mancanti.join(', ')}`)
  process.exit(1)
}

console.log(`Server:    ${host}:${port} (${secure ? 'TLS implicito' : 'STARTTLS'})`)
console.log(`Utente:    ${user}`)
console.log(`Mittente:  ${from}`)
console.log(`Segreteria: ${to || '(EMAIL_TO non impostata)'}`)

const transporter = nodemailer.createTransport({
  host,
  port,
  secure,
  requireTLS: !secure,
  auth: { user, pass },
  connectionTimeout: 10_000,
  greetingTimeout: 10_000,
  socketTimeout: 20_000,
})

try {
  await transporter.verify()
  console.log('✓ Connessione e autenticazione riuscite')
} catch (err) {
  console.error(`✗ ${err.code ?? 'ERRORE'}: ${err.message}`)
  const suggerimenti = {
    EAUTH: 'Credenziali rifiutate. Con Gmail/Workspace serve una "password per le app"; con Microsoft 365 l\'autenticazione SMTP con password va abilitata sulla casella.',
    ESOCKET: 'Connessione caduta: spesso porta e cifratura non corrispondono. Porta 465 → TLS implicito, 587 → STARTTLS (vedi EMAIL_SECURE).',
    ETIMEDOUT: 'Il server non risponde: controlla host e porta, o se la rete blocca le connessioni SMTP in uscita.',
    ECONNECTION: 'Il server ha rifiutato la connessione: controlla host e porta.',
    EDNS: 'Host inesistente: controlla EMAIL_HOST.',
  }
  // "Greeting never received" arriva quasi sempre da una cifratura sbagliata:
  // su 465 il server aspetta subito il TLS e non saluta chi parla in chiaro.
  // Va distinto dal timeout generico, che manderebbe a cercare nell'host.
  const suggerimento = /greeting never received/i.test(err.message)
    ? `Il server non ha salutato: probabilmente vuole ${secure ? 'STARTTLS' : 'TLS implicito'}. Prova EMAIL_SECURE=${secure ? 'false' : 'true'}.`
    : suggerimenti[err.code]
  if (suggerimento) console.error(`  → ${suggerimento}`)
  process.exit(1)
}

if (process.argv.includes('--invia')) {
  if (!to) {
    console.error('✗ --invia richiede EMAIL_TO')
    process.exit(1)
  }
  const info = await transporter.sendMail({
    from: `"Centro Medico San Fedele" <${from}>`,
    to,
    subject: 'Prova configurazione email del sito',
    text: `Questa è una mail di prova inviata da scripts/verifica-email.mjs.\n\nServer: ${host}:${port}\nMittente: ${from}\n\nSe la ricevi, e non è finita nello spam, la configurazione funziona.`,
  })
  console.log(`✓ Mail di prova inviata a ${to} (id ${info.messageId})`)
  console.log('  Controlla anche lo spam: se finisce lì, mancano i record SPF/DKIM/DMARC del dominio.')
}
