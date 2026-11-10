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

// Versione precisa: gli alias "-latest" possono sparire (vedi apphosting.yaml)
const MODEL = process.env.VERTEX_MODEL || 'gemini-2.5-flash'

/** Oltre questo tempo si rinuncia e il paziente vede il messaggio di ripiego. */
const TIMEOUT_MS = 20_000

// Cache del client (la parte costosa è il setup auth).
let client: GoogleGenAI | null = null

function getClient(): GoogleGenAI {
  if (client) return client

  const project =
    process.env.GCLOUD_PROJECT ||
    process.env.FIREBASE_ADMIN_PROJECT_ID ||
    'san-fedele-dev'
  // Regione UE: nella chat i pazienti descrivono sintomi (dati sanitari, art. 9
  // GDPR) e l'endpoint `global` non garantisce che restino in Europa
  const location = process.env.VERTEX_LOCATION || 'europe-west4'

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
      // L'SDK non ha timeout di default: se Vertex si blocca il paziente vedrebbe
      // "sta scrivendo…" fino al timeout di Cloud Run
      httpOptions: { timeout: TIMEOUT_MS },
      abortSignal: AbortSignal.timeout(TIMEOUT_MS + 2_000),
    },
  })

  const fine = response.candidates?.[0]?.finishReason
  const text = response.text?.trim()
  if (!text) {
    throw new Error('Risposta vuota dal modello')
  }
  if (fine && fine !== 'STOP') {
    console.warn('[chatbot] risposta interrotta:', fine, JSON.stringify(response.usageMetadata))
    return chiudiRispostaTroncata(text)
  }
  return text
}

/**
 * Una risposta interrotta può finire a metà di un link markdown, che il
 * browser mostrerebbe come testo grezzo (con i dati del frammento #nome=…).
 * Si taglia l'ultimo link incompleto e si avvisa il paziente.
 */
export function chiudiRispostaTroncata(testo: string): string {
  const aperto = testo.lastIndexOf('[')
  const pulito =
    aperto >= 0 && !/\]\([^)]*\)/.test(testo.slice(aperto)) ? testo.slice(0, aperto) : testo
  return `${pulito.trimEnd()}\n\n_La risposta si è interrotta: se ti serve altro, chiedimelo pure._`
}
