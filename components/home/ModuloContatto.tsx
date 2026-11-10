'use client'

import { useEffect, useRef, useState } from 'react'
import { CheckCircle, Loader2, Send } from 'lucide-react'
import { usePrenotaForm } from '@/hooks/usePrenotaForm'
import { ConsensiPrivacy } from '@/components/ui/ConsensiPrivacy'
import { MelaButton } from '@/components/ui/MelaButton'
import { CampoArea, CampoScelta, CampoTesto, ErroreModulo } from '@/components/ui/Campo'

interface Props {
  /** Se presente, il modulo chiede anche il servizio di interesse */
  specialistiche?: { id: string; nome: string; slug: string }[]
  /** "mela": bottone con la mascotte (pagina Contatti); "semplice": bottone pieno */
  pulsante?: 'mela' | 'semplice'
}

const VUOTO = {
  nome: '',
  cognome: '',
  telefono: '',
  email: '',
  specialistica: '',
  messaggio: '',
  consensoDati: false,
  consensoMarketing: false,
}

/**
 * Modulo "Scrivici" unico per home e pagina Contatti (prima erano due copie
 * con campi obbligatori diversi tra loro e da quelli richiesti dal server: le
 * richieste senza telefono o cognome venivano rifiutate dopo l'invio).
 */
export function ModuloContatto({ specialistiche, pulsante = 'semplice' }: Props) {
  const { loading, success, error, submit, reset } = usePrenotaForm()
  const [form, setForm] = useState(VUOTO)
  const titoloEsito = useRef<HTMLHeadingElement>(null)

  const update = (k: keyof typeof VUOTO, v: string) => setForm((f) => ({ ...f, [k]: v }))

  // Dopo l'invio il modulo sparisce: il focus va sul messaggio di conferma,
  // altrimenti chi usa la tastiera o un lettore di schermo resta "nel vuoto"
  useEffect(() => {
    if (success) titoloEsito.current?.focus()
  }, [success])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const ok = await submit({
      nome: form.nome,
      cognome: form.cognome,
      telefono: form.telefono,
      email: form.email,
      messaggio: form.messaggio,
      ...(form.specialistica && { specialistica: form.specialistica }),
      consensoDati: form.consensoDati,
      consensoMarketing: form.consensoMarketing,
    })
    if (ok) setForm(VUOTO)
  }

  if (success) {
    return (
      <div role="status" className="flex flex-col items-center justify-center gap-4 py-12 text-center">
        <CheckCircle size={48} className="text-secondary-dark" aria-hidden />
        <h3 ref={titoloEsito} tabIndex={-1} className="text-xl font-semibold text-text-main focus:outline-none">
          Richiesta inviata!
        </h3>
        <p className="max-w-xs text-gray-600">
          Grazie per averci scritto: ti rispondiamo entro 24 ore lavorative.
        </p>
        <button type="button" onClick={reset} className="btn-secondary mt-2">
          Invia un&apos;altra richiesta
        </button>
      </div>
    )
  }

  const disabilitato = loading || !form.consensoDati

  return (
    <form onSubmit={handleSubmit} className="space-y-4" noValidate={false}>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <CampoTesto
          etichetta="Nome"
          obbligatorio
          autoComplete="given-name"
          value={form.nome}
          onChange={(e) => update('nome', e.target.value)}
          minLength={2}
          maxLength={60}
        />
        <CampoTesto
          etichetta="Cognome"
          obbligatorio
          autoComplete="family-name"
          value={form.cognome}
          onChange={(e) => update('cognome', e.target.value)}
          minLength={2}
          maxLength={60}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <CampoTesto
          etichetta="Telefono"
          obbligatorio
          type="tel"
          autoComplete="tel"
          inputMode="tel"
          value={form.telefono}
          onChange={(e) => update('telefono', e.target.value)}
          pattern="\+?[0-9 \(\)\.\/\-]{6,25}"
          placeholder="+39 333 000 0000"
          aiuto="Ti richiamiamo a questo numero."
        />
        <CampoTesto
          etichetta="Email"
          obbligatorio
          type="email"
          autoComplete="email"
          value={form.email}
          onChange={(e) => update('email', e.target.value)}
          maxLength={254}
          placeholder="nome@esempio.it"
        />
      </div>

      {specialistiche && specialistiche.length > 0 && (
        <CampoScelta
          etichetta="Servizio di interesse"
          value={form.specialistica}
          onChange={(e) => update('specialistica', e.target.value)}
        >
          <option value="">Nessuna preferenza</option>
          {specialistiche.map((s) => (
            <option key={s.id} value={s.slug}>
              {s.nome}
            </option>
          ))}
        </CampoScelta>
      )}

      <CampoArea
        etichetta="Messaggio"
        obbligatorio
        rows={4}
        minLength={5}
        maxLength={2000}
        value={form.messaggio}
        onChange={(e) => update('messaggio', e.target.value)}
        placeholder="Scrivi qui la tua richiesta o domanda…"
      />

      <ConsensiPrivacy
        value={{ consensoDati: form.consensoDati, consensoMarketing: form.consensoMarketing }}
        onChange={(c) => setForm((f) => ({ ...f, ...c }))}
      />

      <ErroreModulo>{error}</ErroreModulo>

      {pulsante === 'mela' ? (
        <MelaButton
          type="submit"
          mela="chiama"
          melaSize="md"
          melaPosition="left"
          melaAlign="bottom"
          fullWidth
          showArrow={false}
          disabled={disabilitato}
        >
          {loading ? (
            <>
              <Loader2 size={18} className="animate-spin" aria-hidden /> Invio in corso…
            </>
          ) : (
            <>Inviamelo, ti rispondo!</>
          )}
        </MelaButton>
      ) : (
        <button
          type="submit"
          disabled={disabilitato}
          className="btn-primary flex w-full items-center justify-center gap-2 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? (
            <>
              <Loader2 size={18} className="animate-spin" aria-hidden /> Invio in corso…
            </>
          ) : (
            <>
              <Send size={18} aria-hidden /> Invia richiesta
            </>
          )}
        </button>
      )}
      {!form.consensoDati && (
        <p className="text-xs text-gray-600">
          Per inviare serve il consenso al trattamento dei dati. I campi con * sono obbligatori.
        </p>
      )}
    </form>
  )
}
