import nodemailer from 'nodemailer'
import path from 'path'
import fs from 'fs'
import { getSiteConfig } from '@/lib/firebase/siteConfig'
import type { SiteConfig } from '@/types'

// Trim difensivo: secret iniettati via `echo ... | firebase apphosting:secrets:set`
// su PowerShell finiscono con \r\n (errore EBADNAME su smtp.gmail.com\r\n).
const EMAIL_HOST = process.env.EMAIL_HOST?.trim()
const EMAIL_PORT = Number(process.env.EMAIL_PORT?.trim()) || 587
const EMAIL_USER = process.env.EMAIL_USER?.trim()
const EMAIL_PASS = process.env.EMAIL_PASS?.trim()
const EMAIL_TO = process.env.EMAIL_TO?.trim()

// Indirizzo mittente. Di solito coincide con la casella con cui ci si autentica,
// ma non sempre: Brevo, SendGrid e Amazon SES usano username che non sono
// indirizzi, e con Microsoft 365 si può inviare da una casella condivisa.
const EMAIL_FROM = process.env.EMAIL_FROM?.trim() || EMAIL_USER

// Porta 465 = TLS implicito (SMTPS, es. Aruba e Register.it); 587 e 25 =
// STARTTLS, con cui la connessione si cifra dopo il saluto. EMAIL_SECURE
// permette di forzare la scelta per i server che non seguono la convenzione.
const EMAIL_SECURE_ENV = process.env.EMAIL_SECURE?.trim().toLowerCase()
const EMAIL_SECURE = EMAIL_SECURE_ENV ? EMAIL_SECURE_ENV === 'true' : EMAIL_PORT === 465

const transporter = nodemailer.createTransport({
  host: EMAIL_HOST,
  port: EMAIL_PORT,
  secure: EMAIL_SECURE,
  // Su STARTTLS rifiuta di proseguire in chiaro se il server non offre la
  // cifratura: in queste mail viaggiano credenziali e dati sanitari.
  requireTLS: !EMAIL_SECURE,
  auth: {
    user: EMAIL_USER,
    pass: EMAIL_PASS,
  },
  // L'API del modulo attende l'invio prima di rispondere: un server SMTP che non
  // risponde non deve tenere in attesa il paziente. I default arrivano a 2 minuti.
  connectionTimeout: 10_000,
  greetingTimeout: 10_000,
  socketTimeout: 20_000,
})

export interface LeadEmailData {
  nome: string
  cognome?: string
  telefono: string
  email: string
  messaggio: string
  specialistica?: string
  sottoSpecialistica?: string
  medico?: string
}

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://centromedicosanfedele.it'

const CID_LOGO = 'logo-sanfedele'
const CID_TITOLO = 'titolo-sanfedele'

interface BrandAsset {
  filename: string
  cid: string
  diskPath: string
}

function brandAssets(): BrandAsset[] {
  const root = process.cwd()
  return [
    { filename: 'logo.png', cid: CID_LOGO, diskPath: path.resolve(root, 'public/logo-san-fedele.png') },
    { filename: 'titolo.png', cid: CID_TITOLO, diskPath: path.resolve(root, 'public/titolo.png') },
  ].filter((a) => fs.existsSync(a.diskPath))
}

function brandAttachments() {
  return brandAssets().map((a) => ({
    filename: a.filename,
    path: a.diskPath,
    cid: a.cid,
  }))
}

interface CentroBrand {
  nome: string
  indirizzo: string
  telefono: string
  telefonoLink: string
  email: string
  orari: string
  sito: string
}

function centroFromSite(site: SiteConfig): CentroBrand {
  const orari = site.orari
    .filter((o) => o.giorno && o.ore && o.ore.toLowerCase() !== 'chiuso')
    .map((o) => `${o.giorno} ${o.ore}`)
    .join(' · ')
  return {
    nome: 'Centro Medico San Fedele',
    indirizzo: site.indirizzoCompleto,
    telefono: site.telefono,
    telefonoLink: site.telefonoE164,
    email: site.email,
    orari: orari || 'Lun–Ven 09:00–19:30',
    sito: SITE_URL.replace(/^https?:\/\//, ''),
  }
}

const C = {
  primary: '#2E9BDA',
  primaryDark: '#1A7BB5',
  text: '#2A3642',
  textSoft: '#6b7280',
  border: '#dbeafe',
  bgSoft: '#E8F3FB',
  bgDeep: '#C9E2F2',
  white: '#ffffff',
}

function escape(s: string): string {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

function nl2br(s: string): string {
  return escape(s).replace(/\n/g, '<br/>')
}

function emailShell(opts: { preheader: string; bodyHtml: string; centro: CentroBrand }): string {
  const { centro } = opts
  return `<!doctype html>
<html lang="it">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <meta name="x-apple-disable-message-reformatting" />
  <title>${centro.nome}</title>
</head>
<body style="margin:0;padding:0;background-color:${C.bgSoft};font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:${C.text};">
  <span style="display:none!important;visibility:hidden;mso-hide:all;font-size:1px;color:${C.bgSoft};line-height:1px;max-height:0;max-width:0;opacity:0;overflow:hidden;">${escape(opts.preheader)}</span>

  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:${C.bgSoft};">
    <tr>
      <td align="center" style="padding:32px 16px;">
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" style="max-width:600px;width:100%;background-color:${C.white};border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.06);">

          <tr>
            <td style="background:linear-gradient(135deg,${C.primary} 0%,${C.primaryDark} 100%);padding:36px 32px 36px 32px;text-align:center;">
              <table role="presentation" cellpadding="0" cellspacing="0" border="0" align="center" style="background:${C.white};border-radius:14px;box-shadow:0 4px 16px rgba(0,0,0,0.10);">
                <tr>
                  <td style="padding:18px 28px;text-align:center;">
                    <img src="cid:${CID_LOGO}" alt="${centro.nome}" width="56" height="56" style="display:inline-block;vertical-align:middle;border:0;" />
                    <img src="cid:${CID_TITOLO}" alt="${centro.nome}" height="36" style="display:inline-block;vertical-align:middle;border:0;height:36px;margin-left:14px;" />
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          ${opts.bodyHtml}

          <tr>
            <td style="background-color:#fafafa;padding:24px 32px;border-top:1px solid ${C.border};">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td style="text-align:center;font-size:12px;color:${C.textSoft};line-height:1.6;">
                    <strong style="color:${C.text};">${centro.nome}</strong><br/>
                    ${escape(centro.indirizzo)}<br/>
                    Tel <a href="tel:${centro.telefonoLink}" style="color:${C.primary};text-decoration:none;">${centro.telefono}</a>
                    &nbsp;·&nbsp;
                    <a href="mailto:${centro.email}" style="color:${C.primary};text-decoration:none;">${centro.email}</a>
                    <br/>
                    <a href="${SITE_URL}" style="color:${C.textSoft};text-decoration:underline;">${centro.sito}</a>
                  </td>
                </tr>
                <tr>
                  <td style="padding-top:16px;text-align:center;font-size:11px;color:#9ca3af;line-height:1.5;">
                    Hai ricevuto questa email perché hai contattato il ${centro.nome}.<br/>
                    Tratteremo i tuoi dati nel rispetto della normativa privacy.
                  </td>
                </tr>
              </table>
            </td>
          </tr>

        </table>
        <div style="font-size:11px;color:#9ca3af;padding-top:16px;">© ${new Date().getFullYear()} ${centro.nome}</div>
      </td>
    </tr>
  </table>
</body>
</html>`
}

function buildSecretariatHtml(data: LeadEmailData, centro: CentroBrand): string {
  const fullName = `${data.nome}${data.cognome ? ' ' + data.cognome : ''}`

  const detailRow = (label: string, value: string) => `
    <tr>
      <td style="padding:10px 0;border-bottom:1px solid ${C.border};font-size:13px;color:${C.textSoft};width:38%;vertical-align:top;">${label}</td>
      <td style="padding:10px 0;border-bottom:1px solid ${C.border};font-size:14px;color:${C.text};font-weight:500;vertical-align:top;">${value}</td>
    </tr>`

  const serviceRows = [
    data.specialistica && detailRow('Specialistica', escape(data.specialistica)),
    data.sottoSpecialistica && detailRow('Sotto-specialistica', escape(data.sottoSpecialistica)),
    data.medico && detailRow('Medico richiesto', escape(data.medico)),
  ].filter(Boolean).join('')

  const body = `
    <tr>
      <td style="padding:32px 32px 8px 32px;">
        <div style="display:inline-block;background-color:${C.primary}15;color:${C.primary};font-size:11px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;padding:5px 10px;border-radius:999px;">Nuova richiesta</div>
        <h1 style="margin:14px 0 6px 0;font-size:24px;font-weight:600;color:${C.text};line-height:1.3;">Hai ricevuto una nuova richiesta di prenotazione</h1>
        <p style="margin:0;color:${C.textSoft};font-size:14px;line-height:1.5;">Da <strong style="color:${C.text};">${escape(fullName)}</strong> tramite il sito web</p>
      </td>
    </tr>

    <tr>
      <td style="padding:24px 32px 0 32px;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:${C.bgSoft};border-radius:12px;border:1px solid ${C.border};">
          <tr>
            <td style="padding:18px 20px;">
              <p style="margin:0 0 4px 0;font-size:11px;font-weight:700;color:${C.textSoft};letter-spacing:0.06em;text-transform:uppercase;">Contatti del paziente</p>
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td style="padding-top:8px;font-size:15px;color:${C.text};">
                    <a href="tel:${escape(data.telefono)}" style="color:${C.primary};text-decoration:none;font-weight:600;">${escape(data.telefono)}</a>
                    <span style="color:${C.textSoft};">&nbsp;·&nbsp;</span>
                    <a href="mailto:${escape(data.email)}" style="color:${C.primary};text-decoration:none;font-weight:600;">${escape(data.email)}</a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </td>
    </tr>

    ${serviceRows ? `
    <tr>
      <td style="padding:24px 32px 0 32px;">
        <p style="margin:0 0 8px 0;font-size:11px;font-weight:700;color:${C.textSoft};letter-spacing:0.06em;text-transform:uppercase;">Servizio richiesto</p>
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
          ${serviceRows}
        </table>
      </td>
    </tr>` : ''}

    <tr>
      <td style="padding:24px 32px 0 32px;">
        <p style="margin:0 0 8px 0;font-size:11px;font-weight:700;color:${C.textSoft};letter-spacing:0.06em;text-transform:uppercase;">Messaggio</p>
        <div style="padding:16px 18px;background:${C.bgSoft};border-left:3px solid ${C.primary};border-radius:6px;font-size:14px;color:${C.text};line-height:1.6;white-space:pre-wrap;">${nl2br(data.messaggio)}</div>
      </td>
    </tr>

    <tr>
      <td style="padding:28px 32px 32px 32px;">
        <table role="presentation" cellpadding="0" cellspacing="0" border="0">
          <tr>
            <td style="border-radius:999px;background:${C.primary};">
              <a href="tel:${escape(data.telefono)}" style="display:inline-block;padding:12px 24px;font-size:14px;color:${C.white};text-decoration:none;font-weight:600;border-radius:999px;">📞 Richiama il paziente</a>
            </td>
            <td style="width:10px;"></td>
            <td style="border-radius:999px;background:${C.white};border:1.5px solid ${C.primary};">
              <a href="mailto:${escape(data.email)}" style="display:inline-block;padding:12px 24px;font-size:14px;color:${C.primary};text-decoration:none;font-weight:600;border-radius:999px;">✉ Rispondi via email</a>
            </td>
          </tr>
        </table>
        <p style="margin:18px 0 0 0;font-size:12px;color:${C.textSoft};">Richiesta ricevuta il ${new Date().toLocaleString('it-IT', { dateStyle: 'long', timeStyle: 'short' })} dal portale web.</p>
      </td>
    </tr>
  `

  return emailShell({
    preheader: `Nuova richiesta da ${fullName} — ${data.telefono}`,
    bodyHtml: body,
    centro,
  })
}

function buildPatientHtml(data: LeadEmailData, centro: CentroBrand): string {
  const summary = [
    data.specialistica && `<li style="padding:4px 0;color:${C.text};"><strong>Specialistica:</strong> ${escape(data.specialistica)}</li>`,
    data.sottoSpecialistica && `<li style="padding:4px 0;color:${C.text};"><strong>Servizio:</strong> ${escape(data.sottoSpecialistica)}</li>`,
    data.medico && `<li style="padding:4px 0;color:${C.text};"><strong>Medico richiesto:</strong> ${escape(data.medico)}</li>`,
  ].filter(Boolean).join('')

  const body = `
    <tr>
      <td style="padding:36px 32px 8px 32px;text-align:center;">
        <div style="display:inline-flex;align-items:center;justify-content:center;width:64px;height:64px;border-radius:50%;background:${C.primary}15;font-size:32px;line-height:64px;">✓</div>
        <h1 style="margin:18px 0 8px 0;font-size:26px;font-weight:600;color:${C.text};line-height:1.3;">Grazie ${escape(data.nome)}!</h1>
        <p style="margin:0;font-size:16px;color:${C.textSoft};line-height:1.6;">Abbiamo ricevuto la tua richiesta.</p>
      </td>
    </tr>

    <tr>
      <td style="padding:24px 32px 0 32px;">
        <p style="margin:0 0 16px 0;font-size:15px;line-height:1.7;color:${C.text};">
          Il nostro team della segreteria ti ricontatterà <strong>quanto prima</strong> per confermare i dettagli della prenotazione e fissare insieme l'appuntamento.
        </p>
        <p style="margin:0;font-size:14px;line-height:1.7;color:${C.textSoft};">
          Di norma rispondiamo <strong style="color:${C.text};">entro 24 ore lavorative</strong> (Lun–Ven). Per richieste urgenti puoi sempre chiamarci direttamente.
        </p>
      </td>
    </tr>

    ${summary ? `
    <tr>
      <td style="padding:28px 32px 0 32px;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:${C.bgSoft};border-radius:12px;">
          <tr>
            <td style="padding:18px 22px;">
              <p style="margin:0 0 8px 0;font-size:11px;font-weight:700;color:${C.textSoft};letter-spacing:0.06em;text-transform:uppercase;">Riepilogo richiesta</p>
              <ul style="margin:6px 0 0 0;padding:0 0 0 18px;font-size:14px;line-height:1.7;">
                ${summary}
              </ul>
            </td>
          </tr>
        </table>
      </td>
    </tr>` : ''}

    <tr>
      <td style="padding:28px 32px 0 32px;">
        <p style="margin:0 0 12px 0;font-size:11px;font-weight:700;color:${C.textSoft};letter-spacing:0.06em;text-transform:uppercase;">Hai bisogno di noi prima?</p>
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
          <tr>
            <td style="padding:14px 18px;border:1px solid ${C.border};border-radius:10px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td style="font-size:13px;color:${C.textSoft};line-height:1.5;">
                    <strong style="color:${C.text};font-size:15px;display:block;margin-bottom:2px;">📞 Telefono</strong>
                    <a href="tel:${centro.telefonoLink}" style="color:${C.primary};text-decoration:none;font-weight:600;font-size:15px;">${centro.telefono}</a><br/>
                    <span style="font-size:12px;">${centro.orari}</span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr><td style="height:10px;"></td></tr>
          <tr>
            <td style="padding:14px 18px;border:1px solid ${C.border};border-radius:10px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td style="font-size:13px;color:${C.textSoft};line-height:1.5;">
                    <strong style="color:${C.text};font-size:15px;display:block;margin-bottom:2px;">📍 Dove siamo</strong>
                    ${escape(centro.indirizzo)}<br/>
                    <a href="${SITE_URL}/contatti" style="color:${C.primary};text-decoration:none;font-size:13px;">Apri indicazioni →</a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </td>
    </tr>

    <tr>
      <td style="padding:28px 32px 32px 32px;text-align:center;">
        <p style="margin:0;font-size:14px;color:${C.text};line-height:1.6;">
          A presto,<br/>
          <strong>Il team del ${centro.nome}</strong>
        </p>
      </td>
    </tr>
  `

  return emailShell({
    preheader: `Abbiamo ricevuto la tua richiesta, ${data.nome}. Ti ricontattiamo a breve.`,
    bodyHtml: body,
    centro,
  })
}

export async function sendLeadEmail(data: LeadEmailData): Promise<void> {
  const site = await getSiteConfig()
  const centro = centroFromSite(site)
  const fullName = `${data.nome}${data.cognome ? ' ' + data.cognome : ''}`
  const attachments = brandAttachments()

  await transporter.sendMail({
    from: `"Portale ${centro.nome}" <${EMAIL_FROM}>`,
    to: EMAIL_TO,
    replyTo: `"${fullName}" <${data.email}>`,
    subject: `Nuova richiesta — ${fullName}${data.specialistica ? ' · ' + data.specialistica : ''}`,
    html: buildSecretariatHtml(data, centro),
    attachments,
  })

  await transporter.sendMail({
    from: `"${centro.nome}" <${EMAIL_FROM}>`,
    to: data.email,
    subject: `Abbiamo ricevuto la tua richiesta, ${data.nome} ✓`,
    html: buildPatientHtml(data, centro),
    attachments,
  })
}
