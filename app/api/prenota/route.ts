import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { adminDb } from '@/lib/firebase/admin'
import { sendLeadEmail } from '@/lib/email'
import { inviaNotificaWhatsApp } from '@/lib/whatsapp'
import { ipChiamante, limiteSuperato } from '@/lib/rateLimit'
import { verificaRecaptcha } from '@/lib/recaptcha'
import { verificaScelte } from '@/lib/catalogo'
import { codiceErrore, leggiJson } from '@/lib/richieste'

// Ogni invio scrive un lead e spedisce una mail: senza freno l'endpoint è una
// leva per riempire la casella della segreteria. Largo per una persona vera.
const MAX_INVII = 5
const FINESTRA_MS = 10 * 60 * 1000

const MAX_BYTE = 16 * 1024

// Nomi propri: lettere (anche accentate), spazi, apostrofi (anche ’, che la
// tastiera dell'iPhone mette da sola), trattini e punti.
// Niente < > " @ : i nomi finiscono nelle mail e nell'oggetto.
// (RegExp costruita a runtime: il target TypeScript non conosce il flag `u`)
const NOME = new RegExp("^[\\p{L}\\p{M}][\\p{L}\\p{M}'’ .-]*$", 'u')

const PrenotaSchema = z.object({
  nome: z.string().trim().min(2, 'Nome troppo corto').max(60, 'Nome troppo lungo').regex(NOME, 'Il nome contiene caratteri non validi'),
  cognome: z.string().trim().min(2, 'Cognome troppo corto').max(60, 'Cognome troppo lungo').regex(NOME, 'Il cognome contiene caratteri non validi'),
  telefono: z
    .string()
    .trim()
    .max(25, 'Telefono non valido')
    .regex(/^\+?[0-9 ()./-]+$/, 'Telefono non valido')
    .refine((t) => t.replace(/\D/g, '').length >= 6, 'Telefono non valido'),
  email: z.string().trim().max(254, 'Email non valida').email('Email non valida'),
  messaggio: z.string().trim().max(2000, 'Messaggio troppo lungo').default(''),
  // Slug o nomi del catalogo: verificati più sotto, quelli sconosciuti si scartano
  specialistica: z.string().trim().max(120).optional(),
  sottoSpecialistica: z.string().trim().max(150).optional(),
  medico: z.string().trim().max(120).optional(),
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

  const letto = await leggiJson(request, MAX_BYTE)
  if ('errore' in letto) return letto.errore

  try {
    const { recaptchaToken, ...data } = PrenotaSchema.parse(letto.dati)

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

    // Servizio e medico solo se esistono davvero nel catalogo pubblicato
    const scelte = await verificaScelte(data)

    await adminDb.collection('leads').add({
      nome: data.nome,
      cognome: data.cognome,
      telefono: data.telefono,
      email: data.email,
      messaggio: data.messaggio,
      consultoTelefonico: data.consultoTelefonico,
      consensoDati: data.consensoDati,
      consensoMarketing: data.consensoMarketing,
      // Slug per i collegamenti, nome per chi legge (admin e mail)
      ...(scelte.specialistica && {
        specialistica: scelte.specialistica.slug,
        specialisticaNome: scelte.specialistica.nome,
      }),
      ...(scelte.sottoSpecialistica && { sottoSpecialistica: scelte.sottoSpecialistica.nome }),
      ...(scelte.medico && { medico: scelte.medico.slug, medicoNome: scelte.medico.nome }),
      timestamp: new Date().toISOString(),
      letto: false,
      fonte: 'form',
    })

    // Notifiche alla segreteria: mail e, se configurato, WhatsApp. In parallelo
    // e senza far fallire la richiesta, che è già salvata su Firestore.
    const servizio = [scelte.specialistica?.nome, scelte.sottoSpecialistica?.nome, scelte.medico?.nome]
    const [esitoEmail, esitoWhatsApp] = await Promise.allSettled([
      sendLeadEmail({
        nome: data.nome,
        cognome: data.cognome,
        telefono: data.telefono,
        email: data.email,
        messaggio: data.messaggio,
        consultoTelefonico: data.consultoTelefonico,
        specialistica: servizio[0],
        sottoSpecialistica: servizio[1],
        medico: servizio[2],
      }),
      inviaNotificaWhatsApp({
        tipo: data.consultoTelefonico ? 'richiesta di consulto telefonico' : 'richiesta',
        nome: `${data.nome} ${data.cognome}`,
        telefono: data.telefono,
        servizio: servizio.filter(Boolean).join(' · ') || 'non indicato',
      }),
    ])
    // Solo il codice: i messaggi SMTP possono contenere l'indirizzo del paziente
    if (esitoEmail.status === 'rejected') {
      console.error('[prenota] invio email fallito:', codiceErrore(esitoEmail.reason))
    }
    if (esitoWhatsApp.status === 'rejected') {
      console.error('[prenota] notifica WhatsApp fallita:', codiceErrore(esitoWhatsApp.reason))
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
          // Solo il campo, non i valori inviati
          campo: error.errors[0]?.path.join('.'),
        },
        { status: 400 }
      )
    }
    console.error('[prenota] errore:', codiceErrore(error))
    return NextResponse.json(
      { success: false, message: 'Errore interno del server' },
      { status: 500 }
    )
  }
}
