/**
 * Notifica WhatsApp alla segreteria per ogni nuova richiesta, in aggiunta alla
 * mail. Usa la WhatsApp Business Cloud API di Meta.
 *
 * È spenta finché non sono configurate tutte le variabili:
 *   WHATSAPP_TOKEN            token di accesso permanente (secret)
 *   WHATSAPP_PHONE_NUMBER_ID  id del numero mittente, dal pannello Meta
 *   WHATSAPP_TO               numero che riceve le notifiche, es. 393331234567
 *   WHATSAPP_TEMPLATE         nome del modello approvato da Meta
 *   WHATSAPP_TEMPLATE_LANG    lingua del modello (default "it")
 *
 * Meta consente di scrivere per primi solo con un modello approvato: il
 * modello deve avere nel corpo quattro variabili, nell'ordine
 * {{1}} tipo di richiesta, {{2}} nome e cognome, {{3}} telefono, {{4}} servizio.
 * Esempio di testo: "Nuova {{1}} dal sito: {{2}}, tel. {{3}}. Servizio: {{4}}."
 */

export interface NotificaWhatsApp {
  tipo: string
  nome: string
  telefono: string
  servizio: string
}

const API_VERSION = 'v21.0'

export function whatsappConfigurato(): boolean {
  return !!(
    process.env.WHATSAPP_TOKEN?.trim() &&
    process.env.WHATSAPP_PHONE_NUMBER_ID?.trim() &&
    process.env.WHATSAPP_TO?.trim() &&
    process.env.WHATSAPP_TEMPLATE?.trim()
  )
}

/** I parametri dei modelli non ammettono a capo, tab o più di 4 spazi di fila. */
function parametro(testo: string): string {
  return testo.replace(/[\n\r\t]+/g, ' ').replace(/ {4,}/g, '   ').trim().slice(0, 200) || '-'
}

export async function inviaNotificaWhatsApp(dati: NotificaWhatsApp): Promise<void> {
  if (!whatsappConfigurato()) return

  const token = process.env.WHATSAPP_TOKEN!.trim()
  const numeroId = process.env.WHATSAPP_PHONE_NUMBER_ID!.trim()
  const destinatario = process.env.WHATSAPP_TO!.trim().replace(/[^\d]/g, '')

  const res = await fetch(`https://graph.facebook.com/${API_VERSION}/${numeroId}/messages`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      messaging_product: 'whatsapp',
      to: destinatario,
      type: 'template',
      template: {
        name: process.env.WHATSAPP_TEMPLATE!.trim(),
        language: { code: process.env.WHATSAPP_TEMPLATE_LANG?.trim() || 'it' },
        components: [
          {
            type: 'body',
            parameters: [dati.tipo, dati.nome, dati.telefono, dati.servizio].map((t) => ({
              type: 'text',
              text: parametro(t),
            })),
          },
        ],
      },
    }),
    signal: AbortSignal.timeout(10_000),
  })

  if (!res.ok) {
    const dettaglio = await res.text().catch(() => '')
    throw new Error(`WhatsApp API ${res.status}: ${dettaglio.slice(0, 300)}`)
  }
}
