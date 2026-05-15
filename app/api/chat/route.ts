import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { getKnowledgeBase } from '@/lib/chatbot/knowledgeBase'
import { buildSystemPrompt } from '@/lib/chatbot/systemPrompt'
import { generateReply } from '@/lib/chatbot/llm'
import { getSiteConfig } from '@/lib/firebase/siteConfig'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const ChatMessageSchema = z.object({
  role: z.enum(['user', 'assistant']),
  content: z.string().min(1).max(1000),
})

const ChatRequestSchema = z.object({
  messages: z.array(ChatMessageSchema).min(1).max(20),
})

// ─── Rate limit best-effort (per-istanza) ──────────────────────────
const RATE_LIMIT = 15 // richieste
const RATE_WINDOW_MS = 60 * 1000 // per minuto
const hits = new Map<string, number[]>()

function isRateLimited(ip: string): boolean {
  const now = Date.now()
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < RATE_WINDOW_MS)
  recent.push(now)
  hits.set(ip, recent)
  return recent.length > RATE_LIMIT
}

export async function POST(request: NextRequest) {
  const site = await getSiteConfig().catch(() => null)
  const errorFallback = `Mi dispiace, c'è stato un problema tecnico. Riprova tra poco oppure chiamaci al ${site?.telefono || '031 333 3585'}.`

  try {
    const ip =
      request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
      'unknown'

    if (isRateLimited(ip)) {
      return NextResponse.json(
        {
          success: false,
          message:
            'Hai inviato troppi messaggi in poco tempo. Attendi un momento e riprova. 🙂',
        },
        { status: 429 }
      )
    }

    const body = await request.json()
    const { messages } = ChatRequestSchema.parse(body)

    if (messages[messages.length - 1].role !== 'user') {
      return NextResponse.json(
        { success: false, message: 'Richiesta non valida' },
        { status: 400 }
      )
    }

    const knowledgeBase = await getKnowledgeBase()
    const systemPrompt = buildSystemPrompt(knowledgeBase)
    const reply = await generateReply(systemPrompt, messages)

    return NextResponse.json({ success: true, reply })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, message: 'Richiesta non valida' },
        { status: 400 }
      )
    }
    console.error('[chatbot] /api/chat error:', error)
    return NextResponse.json(
      { success: false, message: errorFallback },
      { status: 502 }
    )
  }
}
