'use client'

import { useState, useMemo, useEffect, useRef } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { CheckCircle, ChevronRight, ChevronLeft, Loader2, Phone, MessageCircle } from 'lucide-react'
import { cn } from '@/lib/utils'
import { ConsensiPrivacy } from '@/components/ui/ConsensiPrivacy'
import { useRecaptcha } from '@/hooks/useRecaptcha'

/* ── Types ─────────────────────────────────────────────────── */

interface SottoSpec {
  id: string
  nome: string
}

interface Specialistica {
  id: string
  nome: string
  slug: string
  icona: string
  sottoSpecialistiche: SottoSpec[]
}

interface Medico {
  id: string
  nome: string
  slug: string
  specialisticheIds: string[]
  sottoSpecialisticheIds: string[]
  suChiamata: boolean
}

type Step = 'spec' | 'sotto' | 'medico' | 'dati'

/* ── Component ─────────────────────────────────────────────── */

export function PrenotaForm({
  specialistiche,
  medici,
}: {
  specialistiche: Specialistica[]
  medici: Medico[]
}) {
  const searchParams = useSearchParams()

  const preselectedMedico = searchParams.get('medico') || ''
  const preselectedSotto = searchParams.get('sottoSpecialistica') || ''
  // `step=dati` porta subito ai dati personali (es. "Prenota ora" della pagina
  // DSA): la specialistica è già decisa, il resto lo chiarisce la segreteria.
  const direttoAiDati = searchParams.get('step') === 'dati'

  // Dalla pagina di un medico arriva solo il medico: se lavora in una sola
  // specialistica si può dedurre, e il paziente salta dritto ai suoi dati.
  const medicoPreselezionato = medici.find((m) => m.slug === preselectedMedico)
  const specDelMedico = medicoPreselezionato
    ? specialistiche.filter((s) => medicoPreselezionato.specialisticheIds.includes(s.id))
    : []
  const preselectedSpec =
    searchParams.get('specialistica') || (specDelMedico.length === 1 ? specDelMedico[0].slug : '')

  // Oggetto sotto-specialistica preselezionato (se la spec lo contiene)
  const preselectedSottoObj = preselectedSpec
    ? specialistiche
        .find((s) => s.slug === preselectedSpec)
        ?.sottoSpecialistiche?.find((s) => s.id === preselectedSotto)
    : undefined

  // Calcola lo step iniziale saltando quelli che sarebbero vuoti dato il preselect
  function computeInitial(): {
    step: Step
    skippedMedico: boolean
  } {
    if (!preselectedSpec) return { step: 'spec', skippedMedico: false }
    const spec = specialistiche.find((s) => s.slug === preselectedSpec)
    if (!spec) return { step: 'spec', skippedMedico: false }
    if (medicoPreselezionato) return { step: 'dati', skippedMedico: false }
    if (direttoAiDati) return { step: 'dati', skippedMedico: true }
    if (preselectedSottoObj) {
      const mediciDisponibili = medici.filter(
        (m) => m.sottoSpecialisticheIds.includes(preselectedSottoObj.id) && !m.suChiamata
      )
      if (mediciDisponibili.length > 0) return { step: 'medico', skippedMedico: false }
      return { step: 'dati', skippedMedico: true }
    }
    if ((spec.sottoSpecialistiche?.length ?? 0) > 0) {
      return { step: 'sotto', skippedMedico: false }
    }
    const mediciDisponibili = medici.filter(
      (m) => m.specialisticheIds.includes(spec.id) && !m.suChiamata
    )
    if (mediciDisponibili.length > 0) return { step: 'medico', skippedMedico: false }
    // niente sotto-spec e niente medici → vai diretto a "dati", segnala skip
    return { step: 'dati', skippedMedico: true }
  }

  const [step, setStep] = useState<Step>(() => computeInitial().step)
  const primoRender = useRef(true)

  // A ogni cambio di step la pagina torna in cima: il passo nuovo inizia
  // dall'alto e non resta a metà dello schermo dove si trovava il precedente.
  useEffect(() => {
    if (primoRender.current) {
      primoRender.current = false
      return
    }
    const ridotto = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    window.scrollTo({ top: 0, behavior: ridotto ? 'auto' : 'smooth' })
  }, [step])

  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  // Stato form (dati che vanno all'API)
  const [specSlug, setSpecSlug] = useState(preselectedSpec)
  const [sottoNome, setSottoNome] = useState(preselectedSottoObj?.nome ?? '')
  const [sottoId, setSottoId] = useState(preselectedSottoObj?.id ?? '')
  const [medicoSlug, setMedicoSlug] = useState(medicoPreselezionato ? preselectedMedico : '')
  // Il paziente non sceglie servizio o medico: vuole essere richiamato
  const [consulto, setConsulto] = useState(false)
  const [consultoDa, setConsultoDa] = useState<Step>('spec')
  const [nome, setNome] = useState('')
  const [cognome, setCognome] = useState('')
  const [telefono, setTelefono] = useState('')
  const [email, setEmail] = useState('')
  const [messaggio, setMessaggio] = useState('')
  const [consensi, setConsensi] = useState({ consensoDati: false, consensoMarketing: false })
  const recaptcha = useRecaptcha()

  // Tiene traccia se il medico step è stato saltato (per il back da dati)
  const [skippedMedico, setSkippedMedico] = useState<boolean>(
    () => computeInitial().skippedMedico
  )

  /* ── Derived data ──────────────────────────────────────── */

  const selectedSpec = useMemo(
    () => specialistiche.find((s) => s.slug === specSlug),
    [specialistiche, specSlug]
  )

  const sottoSpecs = selectedSpec?.sottoSpecialistiche ?? []
  const hasSottoSpecs = sottoSpecs.length > 0

  // Medici compatibili con la selezione corrente (non su chiamata)
  const availableMedici = useMemo(() => {
    if (!selectedSpec) return []

    if (sottoId) {
      return medici.filter(
        (m) => m.sottoSpecialisticheIds.includes(sottoId) && !m.suChiamata
      )
    }

    // No sotto-spec scelta → tutti i medici della specialistica non su chiamata
    return medici.filter(
      (m) => m.specialisticheIds.includes(selectedSpec.id) && !m.suChiamata
    )
  }, [medici, selectedSpec, sottoId])

  /* ── Stepper labels ────────────────────────────────────── */

  const visibleSteps = useMemo(() => {
    const steps = [{ key: 'spec', label: 'Specialistica' }]
    if (hasSottoSpecs) steps.push({ key: 'sotto', label: 'Sotto-specialistica' })
    steps.push({ key: 'medico', label: 'Medico' })
    steps.push({ key: 'dati', label: 'Dati personali' })
    return steps
  }, [hasSottoSpecs])

  const stepperIndex = useMemo(() => {
    const idx = visibleSteps.findIndex((s) => s.key === step)
    // Se medico è stato saltato e siamo in dati, l'index è l'ultimo
    if (step === 'dati') return visibleSteps.length - 1
    return idx >= 0 ? idx : 0
  }, [step, visibleSteps])

  /* ── Navigation ────────────────────────────────────────── */

  function selectSpecialistica(slug: string) {
    const spec = specialistiche.find((s) => s.slug === slug)
    setSpecSlug(slug)
    setSottoNome('')
    setSottoId('')
    setSkippedMedico(false)
    setConsulto(false)

    // Medico arrivato dalla sua pagina: se lavora in questa specialistica
    // resta scelto e il paziente passa direttamente ai dati
    if (spec && medicoPreselezionato?.specialisticheIds.includes(spec.id)) {
      setMedicoSlug(medicoPreselezionato.slug)
      setStep('dati')
      return
    }
    setMedicoSlug('')

    if (spec && spec.sottoSpecialistiche && spec.sottoSpecialistiche.length > 0) {
      setStep('sotto')
    } else {
      // No sotto-spec → vai a medico
      setStep('medico')
    }
  }

  function selectSottoSpecialistica(id: string, nome: string) {
    setSottoId(id)
    setSottoNome(nome)
    setMedicoSlug('')
    setSkippedMedico(false)

    // Controlla se ci sono medici con orario fisso per questa sotto-spec
    const mediciDisponibili = medici.filter(
      (m) => m.sottoSpecialisticheIds.includes(id) && !m.suChiamata
    )

    if (mediciDisponibili.length === 0) {
      // Nessun medico disponibile → salta al form dati
      setSkippedMedico(true)
      setStep('dati')
    } else {
      setStep('medico')
    }
  }

  // Al posto di "nessuna preferenza": niente servizio né medico, la segreteria
  // richiama il paziente e lo indirizza. Si passa subito ai dati personali.
  function richiediConsulto() {
    setSottoId('')
    setSottoNome('')
    setMedicoSlug('')
    setConsulto(true)
    setConsultoDa(step)
    setStep('dati')
  }

  function selectMedico(slug: string) {
    setMedicoSlug(slug)
    setConsulto(false)
    setStep('dati')
  }

  // Nessun medico disponibile per la selezione: si prosegue senza sceglierlo
  function skipMedico() {
    setMedicoSlug('')
    setStep('dati')
  }

  function goBack() {
    if (step === 'dati' && consulto) {
      setConsulto(false)
      setStep(consultoDa)
    } else if (step === 'dati') {
      if (skippedMedico) {
        // Il medico era stato saltato → torna a sotto-spec (o spec)
        setStep(hasSottoSpecs ? 'sotto' : 'spec')
      } else {
        setStep('medico')
      }
    } else if (step === 'medico') {
      setStep(hasSottoSpecs ? 'sotto' : 'spec')
    } else if (step === 'sotto') {
      setStep('spec')
    }
  }

  /* ── Submit ────────────────────────────────────────────── */

  async function handleSubmit() {
    setLoading(true)
    setError('')
    try {
      const recaptchaToken = await recaptcha('prenota')
      const res = await fetch('/api/prenota', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          specialistica: specSlug,
          sottoSpecialistica: sottoNome,
          medico: medicoSlug,
          consultoTelefonico: consulto,
          nome,
          cognome,
          telefono,
          email,
          messaggio,
          ...consensi,
          recaptchaToken,
        }),
      })
      const data = await res.json()
      if (data.success) {
        setSuccess(true)
      } else {
        setError(data.message || 'Errore durante l\'invio. Riprova.')
      }
    } catch {
      setError('Errore di connessione. Riprova.')
    } finally {
      setLoading(false)
    }
  }

  /* ── Success ───────────────────────────────────────────── */

  if (success) {
    return (
      <div className="text-center py-12">
        <CheckCircle size={64} className="text-green-500 mx-auto mb-4" />
        <h2 className="heading-3 mb-2">Richiesta inviata!</h2>
        <p className="text-gray-500 max-w-md mx-auto">
          Grazie {nome} {cognome}! Ti contatteremo al numero {telefono} entro 24 ore lavorative
          {consulto ? ' per il consulto telefonico.' : ' per confermare la tua prenotazione.'}
        </p>
      </div>
    )
  }

  /* ── Render ────────────────────────────────────────────── */

  return (
    <div className="max-w-2xl mx-auto">
      {/* Via d'uscita per chi non trova il servizio: prima cosa della pagina */}
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center gap-3 rounded-lg border border-primary/15 bg-bg-soft px-5 py-4">
        <MessageCircle size={22} className="text-primary flex-shrink-0 hidden sm:block" aria-hidden />
        <p className="text-sm text-text-main/80 flex-1">
          <strong className="text-text-main">Non trovi quello che cerchi?</strong> Scrivici e ti
          aiutiamo a scegliere il servizio o lo specialista giusto.
        </p>
        <Link
          href="/contatti#modulo-contatti"
          className="inline-flex items-center justify-center gap-1.5 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary-dark transition-colors whitespace-nowrap"
        >
          Contattaci <ChevronRight size={16} />
        </Link>
      </div>

      {/* Stepper */}
      <div className="flex items-center justify-center mb-10">
        {visibleSteps.map((s, i) => (
          <div key={s.key} className="flex items-center">
            <div
              className={cn(
                'w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors',
                i < stepperIndex
                  ? 'bg-green-500 text-white'
                  : i === stepperIndex
                  ? 'bg-primary text-white'
                  : 'bg-gray-200 text-gray-400'
              )}
            >
              {i < stepperIndex ? <CheckCircle size={16} /> : i + 1}
            </div>
            <span
              className={cn(
                'ml-2 text-sm font-medium hidden sm:inline',
                i === stepperIndex ? 'text-primary' : 'text-gray-400'
              )}
            >
              {s.label}
            </span>
            {i < visibleSteps.length - 1 && (
              <div className={cn('w-12 h-0.5 mx-3', i < stepperIndex ? 'bg-green-500' : 'bg-gray-200')} />
            )}
          </div>
        ))}
      </div>

      {/* ── Step: Specialistica ──────────────────────────── */}
      {step === 'spec' && (
        <div>
          <h2 className="heading-3 mb-6">Scegli la specialistica</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {specialistiche.map((s) => (
              <button
                key={s.id}
                onClick={() => selectSpecialistica(s.slug)}
                className="flex items-center gap-3 p-4 rounded border-2 text-left transition-all border-gray-200 hover:border-primary hover:bg-primary/5"
              >
                <span className="text-2xl">{s.icona}</span>
                <span className="font-medium text-sm">{s.nome}</span>
                <ChevronRight size={16} className="ml-auto text-gray-300" />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ── Step: Sotto-specialistica ────────────────────── */}
      {step === 'sotto' && (
        <div>
          <h2 className="heading-3 mb-2">Scegli la sotto-specialistica</h2>
          <p className="text-gray-400 text-sm mb-6">
            Non sai quale scegliere? Richiedi un consulto telefonico: ti richiamiamo noi.
          </p>
          <div className="space-y-3">
            <ConsultoButton onClick={richiediConsulto} />
            {sottoSpecs.map((s) => {
              const count = medici.filter((m) => m.sottoSpecialisticheIds.includes(s.id)).length
              return (
                <button
                  key={s.id}
                  onClick={() => selectSottoSpecialistica(s.id, s.nome)}
                  className="w-full flex items-center gap-3 p-4 rounded border-2 text-left transition-all border-gray-200 hover:border-primary hover:bg-primary/5"
                >
                  <span className="font-medium text-sm">{s.nome}</span>
                  {count > 0 && (
                    <span className="text-xs text-gray-400 ml-auto mr-2">
                      {count} {count === 1 ? 'medico' : 'medici'}
                    </span>
                  )}
                  <ChevronRight size={16} className="text-gray-300 flex-shrink-0" />
                </button>
              )
            })}
          </div>
          <div className="mt-6">
            <button onClick={() => setStep('spec')} className="btn-ghost flex items-center gap-2">
              <ChevronLeft size={18} /> Indietro
            </button>
          </div>
        </div>
      )}

      {/* ── Step: Medico ─────────────────────────────────── */}
      {step === 'medico' && (
        <MedicoStep
          medici={availableMedici}
          onSelect={selectMedico}
          onSkip={skipMedico}
          onConsulto={richiediConsulto}
          onBack={goBack}
        />
      )}

      {/* ── Step: Dati personali ─────────────────────────── */}
      {step === 'dati' && (
        <div>
          <h2 className="heading-3 mb-4">I tuoi dati</h2>
          <RiepilogoScelta
            consulto={consulto}
            specialistica={selectedSpec?.nome}
            sotto={sottoNome}
            medico={medici.find((m) => m.slug === medicoSlug)?.nome}
          />
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-text-main mb-1">Nome *</label>
                <input
                  type="text"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  className="w-full border border-gray-300 rounded-sm px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Mario"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-main mb-1">Cognome *</label>
                <input
                  type="text"
                  value={cognome}
                  onChange={(e) => setCognome(e.target.value)}
                  className="w-full border border-gray-300 rounded-sm px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Rossi"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-text-main mb-1">Telefono *</label>
              <input
                type="tel"
                value={telefono}
                onChange={(e) => setTelefono(e.target.value)}
                className="w-full border border-gray-300 rounded-sm px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="+39 333 000 0000"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-text-main mb-1">Email *</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full border border-gray-300 rounded-sm px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="mario@email.it"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-text-main mb-1">
                Messaggio / Motivo della visita
              </label>
              <textarea
                value={messaggio}
                onChange={(e) => setMessaggio(e.target.value)}
                rows={4}
                className="w-full border border-gray-300 rounded-sm px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                placeholder="Descrivi brevemente il motivo della visita..."
              />
            </div>
          </div>

          <div className="mt-5">
            <ConsensiPrivacy value={consensi} onChange={setConsensi} />
          </div>

          {error && (
            <p className="text-red-600 text-sm mt-3 bg-red-50 border border-red-200 rounded p-3">
              {error}
            </p>
          )}

          <div className="flex gap-3 mt-6">
            <button onClick={goBack} className="btn-ghost flex items-center gap-2">
              <ChevronLeft size={18} /> Indietro
            </button>
            <button
              onClick={handleSubmit}
              disabled={
                loading || !nome || !cognome || !telefono || !email || !consensi.consensoDati
              }
              className="btn-primary flex items-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <><Loader2 size={18} className="animate-spin" /> Invio...</>
              ) : (
                <>Invia richiesta <ChevronRight size={18} /></>
              )}
            </button>
          </div>
          <p className="text-xs text-gray-400 mt-3">* Campi obbligatori.</p>
        </div>
      )}
    </div>
  )
}

/* ── Medico sub-component ──────────────────────────────────── */

function MedicoStep({
  medici,
  onSelect,
  onSkip,
  onConsulto,
  onBack,
}: {
  medici: { id: string; nome: string; slug: string }[]
  onSelect: (slug: string) => void
  onSkip: () => void
  onConsulto: () => void
  onBack: () => void
}) {
  if (medici.length === 0) {
    return (
      <div>
        <h2 className="heading-3 mb-4">Scelta medico</h2>
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 text-center mb-6">
          <p className="text-gray-500 mb-2">
            Al momento non ci sono medici con disponibilita fissa per questa selezione.
          </p>
          <p className="text-gray-400 text-sm">
            La segreteria ti contatterà per assegnarti lo specialista più adatto.
          </p>
        </div>
        <div className="flex gap-3">
          <button onClick={onBack} className="btn-ghost flex items-center gap-2">
            <ChevronLeft size={18} /> Indietro
          </button>
          <button onClick={onSkip} className="btn-primary flex items-center gap-2">
            Prosegui <ChevronRight size={18} />
          </button>
        </div>
      </div>
    )
  }

  return (
    <div>
      <h2 className="heading-3 mb-6">Scegli il medico (opzionale)</h2>
      <div className="space-y-3">
        <ConsultoButton onClick={onConsulto} />
        {medici.map((m) => (
          <button
            key={m.id}
            onClick={() => onSelect(m.slug)}
            className="w-full flex items-center gap-3 p-4 rounded border-2 text-left transition-all border-gray-200 hover:border-primary hover:bg-primary/5"
          >
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold flex-shrink-0">
              {m.nome.charAt(0)}
            </div>
            <span className="font-medium">{m.nome}</span>
            <ChevronRight size={16} className="ml-auto text-gray-300" />
          </button>
        ))}
      </div>
      <div className="mt-6">
        <button onClick={onBack} className="btn-ghost flex items-center gap-2">
          <ChevronLeft size={18} /> Indietro
        </button>
      </div>
    </div>
  )
}

/* ── Consulto telefonico ───────────────────────────────────── */

function ConsultoButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full flex items-center gap-3 p-4 rounded border-2 text-left transition-all border-primary/30 bg-primary/5 hover:border-primary hover:bg-primary/10"
    >
      <span className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center flex-shrink-0">
        <Phone size={18} aria-hidden />
      </span>
      <span>
        <span className="block font-semibold text-text-main">Richiedi consulto telefonico</span>
        <span className="block text-xs text-gray-500">
          Non sai cosa scegliere? Lasciaci i tuoi dati, ti richiamiamo noi.
        </span>
      </span>
      <ChevronRight size={16} className="ml-auto text-primary flex-shrink-0" />
    </button>
  )
}

/** Ricorda nel passo finale cosa si sta prenotando (o che è un consulto). */
function RiepilogoScelta({
  consulto,
  specialistica,
  sotto,
  medico,
}: {
  consulto: boolean
  specialistica?: string
  sotto?: string
  medico?: string
}) {
  const voci = consulto
    ? ['Consulto telefonico', specialistica].filter(Boolean)
    : [specialistica, sotto, medico].filter(Boolean)
  if (voci.length === 0) return null
  return (
    <div className="mb-6 flex flex-wrap items-center gap-2 text-sm">
      <span className="text-gray-500">{consulto ? 'Richiesta:' : 'Stai prenotando:'}</span>
      {voci.map((v) => (
        <span key={v} className="rounded-full bg-primary/10 px-3 py-1 font-medium text-primary">
          {v}
        </span>
      ))}
    </div>
  )
}
