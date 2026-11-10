'use client'

import { useId, type InputHTMLAttributes, type TextareaHTMLAttributes, type SelectHTMLAttributes, type ReactNode } from 'react'

/**
 * Campi dei moduli pubblici (contatti, prenotazione) con etichetta collegata
 * al campo (`htmlFor`/`id`): prima l'etichetta era un fratello senza
 * collegamento e i lettori di schermo annunciavano solo "campo modifica".
 */

const classeCampo =
  'w-full rounded-sm border border-gray-300 bg-white px-4 py-3 text-text-main placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-primary aria-[invalid=true]:border-red-500'

interface Comuni {
  etichetta: string
  obbligatorio?: boolean
  /** Suggerimento sotto il campo, letto anche dai lettori di schermo */
  aiuto?: ReactNode
}

function Etichetta({ id, etichetta, obbligatorio }: { id: string; etichetta: string; obbligatorio?: boolean }) {
  return (
    <label htmlFor={id} className="mb-1 block text-sm font-medium text-text-main">
      {etichetta}
      {obbligatorio && (
        <>
          <span aria-hidden="true"> *</span>
          <span className="sr-only"> (obbligatorio)</span>
        </>
      )}
    </label>
  )
}

function Aiuto({ id, children }: { id: string; children?: ReactNode }) {
  if (!children) return null
  return (
    <p id={id} className="mt-1 text-xs text-gray-600">
      {children}
    </p>
  )
}

export function CampoTesto({
  etichetta,
  obbligatorio,
  aiuto,
  className = '',
  ...props
}: Comuni & InputHTMLAttributes<HTMLInputElement>) {
  const id = useId()
  return (
    <div className={className}>
      <Etichetta id={id} etichetta={etichetta} obbligatorio={obbligatorio} />
      <input
        id={id}
        required={obbligatorio}
        aria-describedby={aiuto ? `${id}-aiuto` : undefined}
        className={classeCampo}
        {...props}
      />
      <Aiuto id={`${id}-aiuto`}>{aiuto}</Aiuto>
    </div>
  )
}

export function CampoArea({
  etichetta,
  obbligatorio,
  aiuto,
  className = '',
  ...props
}: Comuni & TextareaHTMLAttributes<HTMLTextAreaElement>) {
  const id = useId()
  return (
    <div className={className}>
      <Etichetta id={id} etichetta={etichetta} obbligatorio={obbligatorio} />
      <textarea
        id={id}
        required={obbligatorio}
        aria-describedby={aiuto ? `${id}-aiuto` : undefined}
        className={`${classeCampo} resize-y`}
        {...props}
      />
      <Aiuto id={`${id}-aiuto`}>{aiuto}</Aiuto>
    </div>
  )
}

export function CampoScelta({
  etichetta,
  obbligatorio,
  aiuto,
  className = '',
  children,
  ...props
}: Comuni & SelectHTMLAttributes<HTMLSelectElement>) {
  const id = useId()
  return (
    <div className={className}>
      <Etichetta id={id} etichetta={etichetta} obbligatorio={obbligatorio} />
      <select
        id={id}
        required={obbligatorio}
        aria-describedby={aiuto ? `${id}-aiuto` : undefined}
        className={classeCampo}
        {...props}
      >
        {children}
      </select>
      <Aiuto id={`${id}-aiuto`}>{aiuto}</Aiuto>
    </div>
  )
}

/** Messaggio d'errore del modulo, annunciato subito dai lettori di schermo. */
export function ErroreModulo({ children }: { children?: ReactNode }) {
  if (!children) return null
  return (
    <p role="alert" className="rounded border border-red-200 bg-red-50 p-3 text-sm text-red-700">
      {children}
    </p>
  )
}
