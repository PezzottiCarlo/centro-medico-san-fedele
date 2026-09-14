'use client'

import Link from 'next/link'

export interface Consensi {
  consensoDati: boolean
  consensoMarketing: boolean
}

interface ConsensiPrivacyProps {
  value: Consensi
  onChange: (value: Consensi) => void
}

/**
 * Le due caselle di consenso mostrate in fondo ai moduli di contatto e
 * prenotazione. Sono la controparte visibile della Privacy Policy:
 *
 * - `consensoDati` è obbligatoria e copre il trattamento dei dati della
 *   richiesta, compresi quelli sulla salute che emergono dalla specialistica
 *   scelta o dal testo del messaggio (art. 9 §2 lett. a GDPR).
 * - `consensoMarketing` è facoltativa e riguarda solo le comunicazioni
 *   ulteriori: negarla non impedisce l'invio della richiesta.
 *
 * Entrambe vengono salvate insieme al lead come prova del consenso (art. 7 §1).
 */
export function ConsensiPrivacy({ value, onChange }: ConsensiPrivacyProps) {
  return (
    <div className="space-y-3 border-t border-gray-100 pt-4">
      <label className="flex items-start gap-3 cursor-pointer group">
        <input
          type="checkbox"
          required
          checked={value.consensoDati}
          onChange={(e) => onChange({ ...value, consensoDati: e.target.checked })}
          className="mt-0.5 h-4 w-4 flex-shrink-0 rounded-sm border-gray-300 text-primary focus:ring-2 focus:ring-primary cursor-pointer"
        />
        <span className="text-sm text-gray-600 leading-snug">
          Ho letto l&apos;
          <Link
            href="/privacy"
            target="_blank"
            className="text-primary underline underline-offset-2 hover:text-primary-dark"
          >
            informativa privacy
          </Link>{' '}
          e acconsento al trattamento dei miei dati, compresi quelli relativi alla salute, per
          gestire la richiesta che sto inviando. <span aria-hidden>*</span>
        </span>
      </label>

      <label className="flex items-start gap-3 cursor-pointer group">
        <input
          type="checkbox"
          checked={value.consensoMarketing}
          onChange={(e) => onChange({ ...value, consensoMarketing: e.target.checked })}
          className="mt-0.5 h-4 w-4 flex-shrink-0 rounded-sm border-gray-300 text-primary focus:ring-2 focus:ring-primary cursor-pointer"
        />
        <span className="text-sm text-gray-600 leading-snug">
          Acconsento a ricevere comunicazioni sui servizi e le iniziative del Centro Medico San
          Fedele. <span className="text-gray-400">(facoltativo)</span>
        </span>
      </label>

      {/* I termini di Google richiedono questa dicitura quando il badge
          fluttuante di reCAPTCHA è nascosto (vedi .grecaptcha-badge in
          globals.css). */}
      <p className="text-xs text-gray-400 leading-snug">
        Questo modulo è protetto da reCAPTCHA: si applicano la{' '}
        <a
          href="https://policies.google.com/privacy"
          target="_blank"
          rel="noopener noreferrer"
          className="underline hover:text-gray-600"
        >
          Privacy Policy
        </a>{' '}
        e i{' '}
        <a
          href="https://policies.google.com/terms"
          target="_blank"
          rel="noopener noreferrer"
          className="underline hover:text-gray-600"
        >
          Termini di servizio
        </a>{' '}
        di Google.
      </p>
    </div>
  )
}
