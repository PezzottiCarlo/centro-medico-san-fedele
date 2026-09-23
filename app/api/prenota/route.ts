import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { adminDb } from '@/lib/firebase/admin'
import { sendLeadEmail } from '@/lib/email'
import { ipChiamante, limiteSuperato } from '@/lib/rateLimit'
import { verificaRecaptcha } from '@/lib/recaptcha'

// Ogni invio scrive un lead e spedisce una mail: senza freno l'endpoint è una
// leva per riempire la casella della segreteria. Largo per una persona vera.
const MAX_INVII = 5
const FINESTRA_MS = 10 * 60 * 1000

const PrenotaSchema = z.object({
  nome: z.string().min(2, 'Nome troppo corto').max(100),
  cognome: z.string().min(2, 'Cognome troppo corto').max(100),
  telefono: z.string().min(6, 'Telefono non valido').max(20),
  email: z.string().email('Email non valida'),
  messaggio: z.string().trim().max(1000).default(''),
  specialistica: z.string().optional(),
  sottoSpecialistica: z.string().optional(),
  medico: z.string().optional(),
  // Il paziente non ha scelto servizio o medico e chiede di essere richiamato
  consultoTelefonico: z.boolean().optional().default(false),
  recaptchaToken: z.string().optional(),
  // Prova del consenso (art. 7 §1 GDPR): senza quello obbligatorio la richiesta
  // non viene accettata nemmeno se il client aggira la checkbox.
  consensoDati: z
    .boolean({
      required_error: 'Devi acconsentire al trattamento dei dati per inviare la richiesta',
    })
    .refine((v) => v, 'Devi acconsentire al trattamento dei dati per inviare la richiesta'),
  consensoMarketing: z.boolean().optional().default(false),
})
  // Il messaggio è facoltativo solo quando la richiesta dice già di cosa si
  // tratta (prenotazione di un servizio o consulto telefonico); dal modulo
  // contatti, invece, è l'unico contenuto.
  .refine((d) => d.messaggio.length >= 5 || !!d.specialistica || d.consultoTelefonico, {
    message: 'Messaggio troppo corto',
    path: ['messaggio'],
  })

export async function POST(request: NextRequest) {
  const ip = ipChiamante(request.headers)
  if (limiteSuperato(`prenota:${ip}`, MAX_INVII, FINESTRA_MS)) {
    return NextResponse.json(
      {
        success: false,
        message:
          'Hai inviato troppe richieste in poco tempo. Attendi qualche minuto oppure chiamaci.',
      },
      { status: 429 }
    )
  }

  try {
    const body = await request.json()
    const { recaptchaToken, ...data } = PrenotaSchema.parse(body)

    const captcha = await verificaRecaptcha(recaptchaToken, 'prenota')
    if (!captcha.ok) {
      console.warn('[prenota] richiesta respinta da reCAPTCHA:', captcha.motivo)
      return NextResponse.json(
        {
          success: false,
          message:
            'Non siamo riusciti a verificare la richiesta. Riprova, oppure chiamaci direttamente.',
        },
        { status: 403 }
      )
    }

    // Save to Firestore
    await adminDb.collection('leads').add({
      ...data,
      timestamp: new Date().toISOString(),
      letto: false,
      fonte: 'form',
    })

    // Send email notification (i consensi restano su Firestore, non servono in mail)
    try {
      const { consensoDati: _cd, consensoMarketing: _cm, ...emailData } = data
      await sendLeadEmail(emailData)
    } catch (emailError) {
      console.error('Email sending failed:', emailError)
      // Don't fail the request if email fails
    }

    return NextResponse.json({ success: true, message: 'Richiesta inviata con successo' })
  } catch (error) {
    if (error instanceof z.ZodError) {
      // `message` è il campo che i form mostrano all'utente: senza, un rifiuto
      // di validazione (es. consenso mancante) apparirebbe come errore generico.
      return NextResponse.json(
        {
          success: false,
          message: error.errors[0]?.message || 'Controlla i dati inseriti e riprova.',
          errors: error.errors,
        },
        { status: 400 }
      )
    }
    console.error('Prenota API error:', error)
    return NextResponse.json(
      { success: false, message: 'Errore interno del server' },
      { status: 500 }
    )
  }
}
