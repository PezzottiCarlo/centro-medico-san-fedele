import nodemailer from 'nodemailer'
import path from 'path'
import fs from 'fs'

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: Number(process.env.EMAIL_PORT) || 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
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

// ─── Brand & contatti centro ──────────────────────────────────────────
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://centromedicosanfedele.it'

// Inline brand images via CID (più affidabili di URL remote — Outlook le mostra
// senza chiedere conferma e funzionano anche senza NEXT_PUBLIC_SITE_URL).
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

const CENTRO = {
  nome: 'Centro Medico San Fedele',
  indirizzo: 'Via San Fedele, 22030 Longone al Segrino (CO)',
  telefono: '031 333 3585',
  telefonoLink: '+390313333585',
  email: 'info@centromedicosanfedele.it',
  orari: 'Lun–Ven 09:00–19:30',
  sito: SITE_URL.replace(/^https?:\/\//, ''),
}

// Palette
const C = {
  primary: '#D05241',
  primaryDark: '#B6452F',
  text: '#1f2937',
  textSoft: '#6b7280',
  border: '#e5e7eb',
  bgSoft: '#f8f5f3',
  white: '#ffffff',
}

// ─── Helper ───────────────────────────────────────────────────────────
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

function emailShell(opts: { preheader: string; bodyHtml: string }): string {
  return `<!doctype html>
<html lang="it">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <meta name="x-apple-disable-message-reformatting" />
  <title>${CENTRO.nome}</title>
</head>
<body style="margin:0;padding:0;background-color:${C.bgSoft};font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:${C.text};">
  <span style="display:none!important;visibility:hidden;mso-hide:all;font-size:1px;color:${C.bgSoft};line-height:1px;max-height:0;max-width:0;opacity:0;overflow:hidden;">${escape(opts.preheader)}</span>

  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:${C.bgSoft};">
    <tr>
      <td align="center" style="padding:32px 16px;">
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" style="max-width:600px;width:100%;background-color:${C.white};border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.06);">

          <!-- Header brand -->
          <tr>
            <td style="background:linear-gradient(135deg,${C.primary} 0%,${C.primaryDark} 100%);padding:32px 32px 28px 32px;text-align:center;">
              <img src="cid:${CID_LOGO}" alt="${CENTRO.nome}" width="72" height="72" style="display:inline-block;border:0;border-radius:50%;background:${C.white};padding:8px;box-shadow:0 2px 8px rgba(0,0,0,0.15);" />
              <div style="margin-top:14px;">
                <img src="cid:${CID_TITOLO}" alt="${CENTRO.nome}" height="34" style="display:inline-block;border:0;height:34px;filter:brightness(0) invert(1);" />
              </div>
            </td>
          </tr>

          <!-- Body -->
          ${opts.bodyHtml}

          <!-- Footer brand -->
          <tr>
            <td style="background-color:#fafafa;padding:24px 32px;border-top:1px solid ${C.border};">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td style="text-align:center;font-size:12px;color:${C.textSoft};line-height:1.6;">
                    <strong style="color:${C.text};">${CENTRO.nome}</strong><br/>
                    ${CENTRO.indirizzo}<br/>
                    Tel <a href="tel:${CENTRO.telefonoLink}" style="color:${C.primary};text-decoration:none;">${CENTRO.telefono}</a>
                    &nbsp;·&nbsp;
                    <a href="mailto:${CENTRO.email}" style="color:${C.primary};text-decoration:none;">${CENTRO.email}</a>
                    <br/>
                    <a href="${SITE_URL}" style="color:${C.textSoft};text-decoration:underline;">${CENTRO.sito}</a>
                  </td>
                </tr>
                <tr>
                  <td style="padding-top:16px;text-align:center;font-size:11px;color:#9ca3af;line-height:1.5;">
                    Hai ricevuto questa email perché hai contattato il ${CENTRO.nome}.<br/>
                    Tratteremo i tuoi dati nel rispetto della normativa privacy.
                  </td>
                </tr>
              </table>
            </td>
          </tr>

        </table>
        <div style="font-size:11px;color:#9ca3af;padding-top:16px;">© ${new Date().getFullYear()} ${CENTRO.nome}</div>
      </td>
    </tr>
  </table>
</body>
</html>`
}

// ─── Email alla segreteria ────────────────────────────────────────────
function buildSecretariatHtml(data: LeadEmailData): string {
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

    <!-- Contatti rapidi -->
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

    <!-- Dettagli richiesta -->
    ${serviceRows ? `
    <tr>
      <td style="padding:24px 32px 0 32px;">
        <p style="margin:0 0 8px 0;font-size:11px;font-weight:700;color:${C.textSoft};letter-spacing:0.06em;text-transform:uppercase;">Servizio richiesto</p>
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
          ${serviceRows}
        </table>
      </td>
    </tr>` : ''}

    <!-- Messaggio -->
    <tr>
      <td style="padding:24px 32px 0 32px;">
        <p style="margin:0 0 8px 0;font-size:11px;font-weight:700;color:${C.textSoft};letter-spacing:0.06em;text-transform:uppercase;">Messaggio</p>
        <div style="padding:16px 18px;background:${C.bgSoft};border-left:3px solid ${C.primary};border-radius:6px;font-size:14px;color:${C.text};line-height:1.6;white-space:pre-wrap;">${nl2br(data.messaggio)}</div>
      </td>
    </tr>

    <!-- CTA -->
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
  })
}

// ─── Email di conferma al paziente ────────────────────────────────────
function buildPatientHtml(data: LeadEmailData): string {
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
    <!-- Riepilogo -->
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

    <!-- Contatti centro / CTA -->
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
                    <a href="tel:${CENTRO.telefonoLink}" style="color:${C.primary};text-decoration:none;font-weight:600;font-size:15px;">${CENTRO.telefono}</a><br/>
                    <span style="font-size:12px;">${CENTRO.orari}</span>
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
                    ${CENTRO.indirizzo}<br/>
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
          <strong>Il team del ${CENTRO.nome}</strong>
        </p>
      </td>
    </tr>
  `

  return emailShell({
    preheader: `Abbiamo ricevuto la tua richiesta, ${data.nome}. Ti ricontattiamo a breve.`,
    bodyHtml: body,
  })
}

// ─── Send ─────────────────────────────────────────────────────────────
export async function sendLeadEmail(data: LeadEmailData): Promise<void> {
  const fullName = `${data.nome}${data.cognome ? ' ' + data.cognome : ''}`

  const attachments = brandAttachments()

  await transporter.sendMail({
    from: `"Portale ${CENTRO.nome}" <${process.env.EMAIL_USER}>`,
    to: process.env.EMAIL_TO,
    replyTo: `"${fullName}" <${data.email}>`,
    subject: `Nuova richiesta — ${fullName}${data.specialistica ? ' · ' + data.specialistica : ''}`,
    html: buildSecretariatHtml(data),
    attachments,
  })

  await transporter.sendMail({
    from: `"${CENTRO.nome}" <${process.env.EMAIL_USER}>`,
    to: data.email,
    subject: `Abbiamo ricevuto la tua richiesta, ${data.nome} ✓`,
    html: buildPatientHtml(data),
    attachments,
  })
}
