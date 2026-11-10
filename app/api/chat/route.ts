import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { getKnowledgeBase } from '@/lib/chatbot/knowledgeBase'
import { buildSystemPrompt } from '@/lib/chatbot/systemPrompt'
import { generateReply } from '@/lib/chatbot/llm'
import { getSiteConfig } from '@/lib/firebase/siteConfig'
import { SITE_CONFIG_DEFAULT } from '@/lib/siteConfig'
import { ipChiamante, limiteSuperato } from '@/lib/rateLimit'
import { codiceErrore, leggiJson } from '@/lib/richieste'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// I messaggi del paziente sono brevi; le risposte del bot che il browser
// rimanda come cronologia possono essere più lunghe (elenchi, link)
const ChatMessageSchema = z.discriminatedUnion('role', [
  z.object({ role: z.literal('user'), content: z.string().trim().min(1).max(1000) }),
  z.object({ role: z.literal('assistant'), content: z.string().min(1).max(4000) }),
])

const ChatRequestSchema = z.object({
  messages: z.array(ChatMessageSchema).min(1).max(20),
})

// ─── Rate limit best-effort (vedi lib/rateLimit.ts) ────────────────
const RATE_LIMIT = 15 // richieste
const RATE_WINDOW_MS = 60 * 1000 // per minuto

const MAX_BYTE = 64 * 1024

export async function POST(request: NextRequest) {
  // Limite e validazione prima di qualunque lettura da Firestore: le richieste
  // rifiutate non devono costare nulla
  const ip = ipChiamante(request.headers)
  if (limiteSuperato(`chat:${ip}`, RATE_LIMIT, RATE_WINDOW_MS)) {
    return NextResponse.json(
      {
        success: false,
        message: 'Hai inviato troppi messaggi in poco tempo. Attendi un momento e riprova. 🙂',
      },
      { status: 429 }
    )
  }
  const letto = await leggiJson(request, MAX_BYTE)
  if ('errore' in letto) return letto.errore

  const site = await getSiteConfig().catch(() => SITE_CONFIG_DEFAULT)
  const errorFallback = `Mi dispiace, c'è stato un problema tecnico. Riprova tra poco oppure chiamaci al ${site.telefono || SITE_CONFIG_DEFAULT.telefono}.`

  try {
    const { messages } = ChatRequestSchema.parse(letto.dati)

    if (messages[messages.length - 1].role !== 'user') {
      return NextResponse.json(
        { success: false, message: 'Richiesta non valida' },
        { status: 400 }
      )
    }

    const knowledgeBase = await getKnowledgeBase()
    const systemPrompt = buildSystemPrompt(knowledgeBase, site)
    const reply = await generateReply(systemPrompt, messages)

    return NextResponse.json({ success: true, reply })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, message: 'Richiesta non valida' },
        { status: 400 }
      )
    }
    console.error('[chatbot] /api/chat error:', codiceErrore(error), (error as Error)?.message?.slice(0, 200))
    return NextResponse.json(
      { success: false, message: errorFallback },
      { status: 502 }
    )
  }
}
