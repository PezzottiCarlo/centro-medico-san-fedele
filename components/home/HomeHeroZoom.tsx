'use client'

import Image from 'next/image'
import { useEffect, useRef, useState } from 'react'
import { Phone, Calendar, ArrowRight, ChevronDown, Pointer } from 'lucide-react'
import type { HeroConfig, HeroCTA } from '@/types'

function WhatsAppIcon({ size = 18, className = '' }: { size?: number; className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="currentColor"
      className={className}
      aria-hidden="true"
    >
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347zM12.004 2C6.477 2 2 6.477 2 12c0 1.76.463 3.47 1.345 4.968L2 22l5.136-1.33A9.956 9.956 0 0 0 12.004 22c5.523 0 10-4.477 10-10S17.527 2 12.004 2zm0 18.067a8.052 8.052 0 0 1-4.106-1.125l-.295-.176-3.05.79.814-2.972-.192-.306a8.013 8.013 0 0 1-1.244-4.278c0-4.43 3.604-8.034 8.073-8.034 2.157 0 4.185.842 5.709 2.37a8.006 8.006 0 0 1 2.362 5.682c0 4.43-3.603 8.034-8.071 8.034z" />
    </svg>
  )
}

function ctaClasses(cta: HeroCTA): string {
  switch (cta.icona) {
    case 'whatsapp':
      return 'text-white bg-[#25D366] hover:bg-[#1ebe57] shadow-lg shadow-[#25D366]/30'
    case 'phone':
      return 'text-white bg-sky-500 hover:bg-sky-400 shadow-lg shadow-sky-500/30'
    case 'calendar':
      return 'text-white bg-primary hover:bg-primary-dark shadow-lg shadow-primary/30'
    case 'arrow':
      return 'text-white bg-secondary hover:bg-secondary-dark shadow-lg shadow-secondary/30'
    default:
      return 'text-white bg-white/10 hover:bg-white/20 border border-white/30 backdrop-blur'
  }
}

function CtaIcon({ kind, size = 18 }: { kind?: HeroCTA['icona']; size?: number }) {
  if (kind === 'phone') return <Phone size={size} aria-hidden="true" />
  if (kind === 'whatsapp') return <WhatsAppIcon size={size} />
  if (kind === 'calendar') return <Calendar size={size} aria-hidden="true" />
  if (kind === 'arrow') return <ArrowRight size={size} aria-hidden="true" />
  return null
}

// La foto di default ha la mascotte che saluta sul bancone, spostata a sinistra.
// Il punto indicato è il centro del gruppo mela + fumetto "Ciao!", misurato
// sull'immagine: corpo al 23–36% della larghezza, fumetto fino al 40%.
const SFONDO_DEFAULT = {
  src: '/hero-bg.jpg',
  larghezza: 6912,
  altezza: 3456,
  fuocoX: 0.31,
  fuocoY: 0.53,
}

/**
 * `object-position` che porta il punto di fuoco al centro della hero, quando la
 * foto ritagliata da `object-cover` lo permette. Se l'immagine non è abbastanza
 * larga (o alta) per centrarlo, lo spostamento si ferma al bordo della foto:
 * il punto non è più al centro ma resta dentro l'inquadratura.
 */
function posizionePerFuoco(
  contenitoreL: number,
  contenitoreA: number,
  fuocoX: number,
  fuocoY: number
): string {
  const scala = Math.max(
    contenitoreL / SFONDO_DEFAULT.larghezza,
    contenitoreA / SFONDO_DEFAULT.altezza
  )
  const asse = (contenitore: number, resa: number, fuoco: number) => {
    const eccesso = resa - contenitore
    if (eccesso < 1) return 50
    // Scostamento che centra il fuoco, limitato a [-eccesso, 0]
    const scostamento = Math.min(0, Math.max(-eccesso, contenitore / 2 - fuoco * resa))
    return (-scostamento / eccesso) * 100
  }
  const x = asse(contenitoreL, SFONDO_DEFAULT.larghezza * scala, fuocoX)
  const y = asse(contenitoreA, SFONDO_DEFAULT.altezza * scala, fuocoY)
  return `${x.toFixed(2)}% ${y.toFixed(2)}%`
}

function SfondoHero({ src }: { src: string }) {
  const ref = useRef<HTMLDivElement>(null)
  const eDefault = src === SFONDO_DEFAULT.src
  // Prima del calcolo (render server, JS non ancora partito) usiamo il fuoco
  // stesso come posizione: con `object-position: X%` il punto al X% della foto
  // cade al X% del contenitore, quindi la mela è già visibile, solo non centrata.
  const [posizione, setPosizione] = useState<string | undefined>(
    eDefault ? `${SFONDO_DEFAULT.fuocoX * 100}% ${SFONDO_DEFAULT.fuocoY * 100}%` : undefined
  )

  useEffect(() => {
    // Un'immagine caricata da admin ha un soggetto che non conosciamo: resta centrata
    if (!eDefault || !ref.current) return
    const el = ref.current
    const aggiorna = () =>
      setPosizione(
        posizionePerFuoco(el.clientWidth, el.clientHeight, SFONDO_DEFAULT.fuocoX, SFONDO_DEFAULT.fuocoY)
      )
    aggiorna()
    const ro = new ResizeObserver(aggiorna)
    ro.observe(el)
    return () => ro.disconnect()
  }, [eDefault])

  return (
    <div ref={ref} className="absolute inset-0">
      <Image
        src={src}
        alt=""
        fill
        priority
        sizes="100vw"
        className="object-cover"
        style={posizione ? { objectPosition: posizione } : undefined}
      />
    </div>
  )
}

function CtaLink({ cta }: { cta: HeroCTA }) {
  const esterno = cta.href.startsWith('http')
  return (
    <a
      href={cta.href}
      target={esterno ? '_blank' : undefined}
      rel={esterno ? 'noopener noreferrer' : undefined}
      className={`group inline-flex items-center justify-center gap-2 md:gap-2.5 px-6 md:px-7 py-3 min-h-[44px] w-full sm:w-auto rounded-full font-semibold transition-all ${ctaClasses(cta)}`}
    >
      <CtaIcon kind={cta.icona} />
      {cta.testo}
    </a>
  )
}

interface HomeHeroZoomProps {
  config: HeroConfig
}

/** Dopo quanti millisecondi di inattività compare l'invito a scorrere. */
const ATTESA_SUGGERIMENTO_MS = 3000

/** Oltre questo avanzamento titolo e bottoni sono già in vista: l'invito non serve. */
const RIVELAZIONE_QUASI_COMPLETA = 0.9

/**
 * Evento con cui la hero avvisa il chatbot che l'invito a scorrere è visibile:
 * nel frattempo il chatbot si stringe e rimanda il suo fumetto, così in basso
 * c'è un solo invito alla volta.
 */
export const EVENTO_SUGGERIMENTO_SCROLL = 'sanfedele:suggerimento-scroll'

/**
 * Hero con rivelazione allo scroll, uguale su mobile e desktop: al primo
 * accesso si vede solo la foto con la mascotte, poi scorrendo il velo si scurisce
 * e compaiono titolo e bottoni.
 *
 * La sezione è alta il doppio dello schermo e contiene un pannello `sticky`: lo
 * scorrimento dentro la sezione diventa l'avanzamento dell'animazione.
 */
export function HomeHeroZoom({ config }: HomeHeroZoomProps) {
  const tracciaRef = useRef<HTMLElement>(null)
  const pannelloRef = useRef<HTMLDivElement>(null)
  const veloRef = useRef<HTMLDivElement>(null)
  const titoloRef = useRef<HTMLHeadingElement>(null)
  const bottoniRef = useRef<HTMLDivElement>(null)
  const avanzamentoRef = useRef(0)
  const [suggerimento, setSuggerimento] = useState(false)

  useEffect(() => {
    const limita = (v: number) => Math.max(0, Math.min(1, v))
    let raf = 0

    // Gli stili vengono scritti direttamente sugli elementi invece di passare da
    // uno stato React: così lo scroll non ri-renderizza la hero (e la foto) a
    // ogni frame, che su un telefono si traduce in scatti.
    function applica() {
      raf = 0
      const traccia = tracciaRef.current
      const pannello = pannelloRef.current
      if (!traccia || !pannello) return
      // Si divide per l'altezza del pannello (in svh) e non per innerHeight, che
      // su mobile cambia mentre la barra del browser si ritira e farebbe saltare
      // l'animazione.
      const scorrimento = Math.max(0, -traccia.getBoundingClientRect().top)
      const avanzamento = Math.min(1, scorrimento / pannello.offsetHeight)
      avanzamentoRef.current = avanzamento
      const titoloP = limita((avanzamento - 0.05) / 0.5)
      const bottoniP = limita((avanzamento - 0.45) / 0.5)

      if (veloRef.current) {
        veloRef.current.style.backgroundColor = `rgba(0,0,0,${0.25 + avanzamento * 0.3})`
      }
      if (titoloRef.current) {
        titoloRef.current.style.opacity = String(titoloP)
        titoloRef.current.style.transform = `translateY(${(1 - titoloP) * 32}px)`
      }
      if (bottoniRef.current) {
        bottoniRef.current.style.opacity = String(bottoniP)
        bottoniRef.current.style.transform = `translateY(${(1 - bottoniP) * 24}px)`
        bottoniRef.current.style.pointerEvents = bottoniP > 0.5 ? 'auto' : 'none'
      }
    }

    function suScroll() {
      if (!raf) raf = requestAnimationFrame(applica)
    }

    applica()
    window.addEventListener('scroll', suScroll, { passive: true })
    window.addEventListener('resize', suScroll)
    return () => {
      if (raf) cancelAnimationFrame(raf)
      window.removeEventListener('scroll', suScroll)
      window.removeEventListener('resize', suScroll)
    }
  }, [])

  // Invito a scorrere: compare dopo qualche secondo senza scroll, tocchi o tasti,
  // e solo finché titolo e bottoni non sono già comparsi. Il movimento del mouse
  // non conta: chi muove il cursore senza scorrere ha comunque bisogno dell'invito.
  useEffect(() => {
    let timer: number | undefined
    let visibile = false
    let chatAperta = false

    const imposta = (v: boolean) => {
      if (v === visibile) return
      visibile = v
      setSuggerimento(v)
      window.dispatchEvent(new CustomEvent(EVENTO_SUGGERIMENTO_SCROLL, { detail: { visibile: v } }))
    }
    const pianifica = () => {
      window.clearTimeout(timer)
      timer = window.setTimeout(() => {
        if (!chatAperta && avanzamentoRef.current < RIVELAZIONE_QUASI_COMPLETA) imposta(true)
      }, ATTESA_SUGGERIMENTO_MS)
    }
    const suAttivita = () => {
      imposta(false)
      pianifica()
    }
    const suChat = (e: Event) => {
      chatAperta = !!(e as CustomEvent<{ aperta: boolean }>).detail?.aperta
      if (chatAperta) imposta(false)
      else pianifica()
    }

    pianifica()
    const passivo: AddEventListenerOptions = { passive: true }
    window.addEventListener('scroll', suAttivita, passivo)
    window.addEventListener('wheel', suAttivita, passivo)
    window.addEventListener('touchstart', suAttivita, passivo)
    window.addEventListener('keydown', suAttivita)
    window.addEventListener('sanfedele:chat', suChat)
    return () => {
      window.clearTimeout(timer)
      window.removeEventListener('scroll', suAttivita)
      window.removeEventListener('wheel', suAttivita)
      window.removeEventListener('touchstart', suAttivita)
      window.removeEventListener('keydown', suAttivita)
      window.removeEventListener('sanfedele:chat', suChat)
      // Uscendo dalla home il chatbot non deve restare stretto
      imposta(false)
    }
  }, [])

  const ctaPrimaria = config.ctaPrimaria
  const ctaSecondaria = config.ctaSecondaria
  const bgImage = config.immagine || '/hero-bg.jpg'

  return (
    <section
      ref={tracciaRef}
      // `svh` con ripiego su `vh` per i browser che non lo conoscono
      className="relative h-[200vh] supports-[height:100svh]:h-[200svh]"
      aria-label="Hero"
    >
      <div
        ref={pannelloRef}
        className="sticky top-0 h-[100vh] supports-[height:100svh]:h-[100svh] w-full overflow-hidden"
      >
        <SfondoHero src={bgImage} />
        <div ref={veloRef} className="absolute inset-0 bg-black/25" />

        <div className="absolute inset-0 flex items-center justify-center px-6">
          <div className="text-center max-w-4xl w-full">
            {/* Stato iniziale nascosto via classi: gli stili inline scritti allo
                scroll hanno la precedenza e React non li sovrascrive. */}
            <h1
              ref={titoloRef}
              className="text-3xl sm:text-4xl md:text-6xl lg:text-7xl font-light tracking-tight text-white drop-shadow-md opacity-0 translate-y-8 [will-change:opacity,transform]"
            >
              {config.titolo}{' '}
              {config.titoloEvidenziato && (
                <span className="font-semibold block sm:inline">{config.titoloEvidenziato}</span>
              )}
            </h1>

            {(ctaPrimaria || ctaSecondaria) && (
              <div
                ref={bottoniRef}
                // Chi naviga da tastiera arriva sui bottoni prima di aver
                // scrollato: col focus devono comparire, non restare invisibili.
                className="mt-8 md:mt-10 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 opacity-0 translate-y-6 pointer-events-none [will-change:opacity,transform] focus-within:!opacity-100 focus-within:!translate-y-0 focus-within:!pointer-events-auto"
              >
                {ctaPrimaria && <CtaLink cta={ctaPrimaria} />}
                {ctaSecondaria && <CtaLink cta={ctaSecondaria} />}
              </div>
            )}
          </div>
        </div>

        {/* Invito a scorrere. È fissato allo schermo e non alla hero: al primo
            accesso il fondo della hero sta sotto la piega, di quanto è alta la
            navbar. Il tipo di invito segue il dispositivo di puntamento, non la
            larghezza: un tablet vede il dito, una finestra desktop stretta la
            freccia. */}
        <div
          aria-hidden
          className={`pointer-events-none fixed inset-x-0 bottom-6 md:bottom-8 z-40 flex justify-center transition-all duration-500 ${suggerimento ? 'visible opacity-100' : 'invisible opacity-0'
            }`}
        >
          {/* Schermi touch: un dito che trascina verso l'alto */}
          <div data-suggerimento="dito" className="hidden [@media(pointer:coarse)]:flex flex-col items-center gap-2">
            <div className="relative h-16 w-10">
              <span className="absolute left-1/2 top-0 h-full w-1 -translate-x-1/2 rounded-full bg-gradient-to-t from-white/0 via-white/50 to-white/0" />
              <Pointer
                size={34}
                strokeWidth={1.75}
                className="absolute bottom-0 left-1/2 -ml-[17px] text-white drop-shadow-[0_2px_6px_rgba(0,0,0,0.5)] motion-safe:animate-[dito-scorri_1.8s_ease-in-out_infinite]"
              />
            </div>
            <span className="text-xs font-semibold uppercase tracking-[0.18em] text-white drop-shadow">
              Scorri
            </span>
          </div>

          {/* Mouse e trackpad: una freccia verso il basso */}
          <div data-suggerimento="freccia" className="flex [@media(pointer:coarse)]:hidden flex-col items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-[0.18em] text-white drop-shadow">
              Scorri
            </span>
            <span className="flex h-12 w-12 items-center justify-center rounded-full border-2 border-white/70 bg-white/10 text-white shadow-lg backdrop-blur-sm motion-safe:animate-[freccia-giu_1.6s_ease-in-out_infinite]">
              <ChevronDown size={26} strokeWidth={2.25} />
            </span>
          </div>
        </div>
      </div>
    </section>
  )
}
