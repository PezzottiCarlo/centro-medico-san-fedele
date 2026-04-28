import nodemailer from 'nodemailer'

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

export async function sendLeadEmail(data: LeadEmailData): Promise<void> {
  const subject = `Nuova richiesta di prenotazione - ${data.nome} ${data.cognome || ''}`
  const html = `
    <h2>Nuova richiesta di prenotazione</h2>
    <table style="border-collapse:collapse;width:100%">
      <tr><th style="text-align:left;padding:8px;border:1px solid #ddd">Campo</th><th style="text-align:left;padding:8px;border:1px solid #ddd">Valore</th></tr>
      <tr><td style="padding:8px;border:1px solid #ddd"><strong>Nome</strong></td><td style="padding:8px;border:1px solid #ddd">${data.nome}</td></tr>
      ${data.cognome ? `<tr><td style="padding:8px;border:1px solid #ddd"><strong>Cognome</strong></td><td style="padding:8px;border:1px solid #ddd">${data.cognome}</td></tr>` : ''}
      <tr><td style="padding:8px;border:1px solid #ddd"><strong>Telefono</strong></td><td style="padding:8px;border:1px solid #ddd">${data.telefono}</td></tr>
      <tr><td style="padding:8px;border:1px solid #ddd"><strong>Email</strong></td><td style="padding:8px;border:1px solid #ddd">${data.email}</td></tr>
      ${data.specialistica ? `<tr><td style="padding:8px;border:1px solid #ddd"><strong>Specialistica</strong></td><td style="padding:8px;border:1px solid #ddd">${data.specialistica}</td></tr>` : ''}
      ${data.sottoSpecialistica ? `<tr><td style="padding:8px;border:1px solid #ddd"><strong>Sotto-specialistica</strong></td><td style="padding:8px;border:1px solid #ddd">${data.sottoSpecialistica}</td></tr>` : ''}
      ${data.medico ? `<tr><td style="padding:8px;border:1px solid #ddd"><strong>Medico richiesto</strong></td><td style="padding:8px;border:1px solid #ddd">${data.medico}</td></tr>` : ''}
      <tr><td style="padding:8px;border:1px solid #ddd"><strong>Messaggio</strong></td><td style="padding:8px;border:1px solid #ddd">${data.messaggio}</td></tr>
    </table>
    <p style="color:#666;margin-top:16px;font-size:12px">Inviato automaticamente dal portale web Centro Medico San Fedele</p>
  `

  await transporter.sendMail({
    from: `"Portale San Fedele" <${process.env.EMAIL_USER}>`,
    to: process.env.EMAIL_TO,
    subject,
    html,
  })

  //send email to user as confirmation
  await transporter.sendMail({
    from: `"Centro Medico San Fedele" <${process.env.EMAIL_USER}>`,
    to: data.email,
    subject: 'Conferma ricezione richiesta di prenotazione',
    html: `
      <p>Gentile ${data.nome},</p>
      <p>Abbiamo ricevuto la tua richiesta di prenotazione. Il nostro team ti contatterà al più presto per confermare i dettagli.</p>
      <p>Grazie per aver scelto il Centro Medico San Fedele.</p>
      <p>Cordiali saluti,<br/>Il team di San Fedele</p>
    `,
  })
}
