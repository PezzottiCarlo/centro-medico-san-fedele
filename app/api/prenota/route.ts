import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { adminDb } from '@/lib/firebase/admin'
import { sendLeadEmail } from '@/lib/email'

const PrenotaSchema = z.object({
  nome: z.string().min(2, 'Nome troppo corto').max(100),
  cognome: z.string().min(2, 'Cognome troppo corto').max(100),
  telefono: z.string().min(6, 'Telefono non valido').max(20),
  email: z.string().email('Email non valida'),
  messaggio: z.string().min(5, 'Messaggio troppo corto').max(1000),
  specialistica: z.string().optional(),
  sottoSpecialistica: z.string().optional(),
  medico: z.string().optional(),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const data = PrenotaSchema.parse(body)

    // Save to Firestore
    await adminDb.collection('leads').add({
      ...data,
      timestamp: new Date().toISOString(),
      letto: false,
      fonte: 'form',
    })

    // Send email notification
    try {
      await sendLeadEmail(data)
    } catch (emailError) {
      console.error('Email sending failed:', emailError)
      // Don't fail the request if email fails
    }

    return NextResponse.json({ success: true, message: 'Richiesta inviata con successo' })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, errors: error.errors },
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
