import { GoogleGenAI } from '@google/genai'

/**
 * Wrapper isolato attorno all'SDK del provider AI.
 * Per cambiare provider/modello in futuro basta riscrivere SOLO questo file.
 *
 * Provider attuale: Google Gemini tramite Vertex AI (SDK @google/genai).
 * Autenticazione:
 *  - Produzione (App Hosting): Application Default Credentials del service
 *    account compute — nessuna chiave da configurare.
 *  - Locale: riusa FIREBASE_ADMIN_CLIENT_EMAIL + FIREBASE_ADMIN_PRIVATE_KEY
 *    dal .env.local, oppure `gcloud auth application-default login`.
 *
 * Il service account usato (compute in prod, admin in locale) deve avere
 * il ruolo IAM "Vertex AI User" e l'API aiplatform.googleapis.com abilitata.
 */

export interface LlmMessage {
  role: 'user' | 'assistant'
  content: string
}

const MODEL = process.env.VERTEX_MODEL || 'gemini-flash-latest'

// Cache del client (la parte costosa è il setup auth).
let client: GoogleGenAI | null = null

function getClient(): GoogleGenAI {
  if (client) return client

  const project =
    process.env.GCLOUD_PROJECT ||
    process.env.FIREBASE_ADMIN_PROJECT_ID ||
    'san-fedele-dev'
  const location = process.env.VERTEX_LOCATION || 'global'

  const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL
  const rawKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY
  const hasExplicitKey = !!clientEmail && !!rawKey

  client = new GoogleGenAI({
    vertexai: true,
    project,
    location,
    ...(hasExplicitKey && {
      googleAuthOptions: {
        projectId: project,
        credentials: {
          client_email: clientEmail,
          private_key: rawKey!.replace(/\\n/g, '\n'),
        },
      },
    }),
  })
  return client
}

/** Genera la risposta dell'assistente data la history della conversazione. */
export async function generateReply(
  systemPrompt: string,
  history: LlmMessage[]
): Promise<string> {
  const ai = getClient()

  const contents = history.map((m) => ({
    role: m.role === 'assistant' ? ('model' as const) : ('user' as const),
    parts: [{ text: m.content }],
  }))

  const response = await ai.models.generateContent({
    model: MODEL,
    contents,
    config: {
      systemInstruction: systemPrompt,
      // Nei modelli Gemini che "ragionano" i token del ragionamento contano nel
      // limite di output: con 1024 il ragionamento se li mangiava e le risposte
      // (link di prenotazione compresi) si interrompevano a metà. Il ragionamento
      // ha un tetto suo, la risposta tutto lo spazio che le serve.
      maxOutputTokens: 4096,
      thinkingConfig: { thinkingBudget: 1024 },
      temperature: 0.3,
    },
  })

  const fine = response.candidates?.[0]?.finishReason
  if (fine && fine !== 'STOP') {
    console.warn('[chatbot] risposta interrotta:', fine, JSON.stringify(response.usageMetadata))
  }
  const text = response.text?.trim()
  if (!text) {
    throw new Error('Risposta vuota dal modello')
  }
  return text
}
