'use client'

import Image from 'next/image'
import { useEffect, useRef, useState } from 'react'
import { ChevronDown, Pointer } from 'lucide-react'
import { CtaIcon } from '@/components/ui/CtaIcon'
import type { HeroConfig, HeroCTA } from '@/types'

function ctaClasses(cta: HeroCTA): string {
  switch (cta.icona) {
    case 'whatsapp':
      return 'text-white bg-[#25D366] hover:bg-[#1ebe57] shadow-lg shadow-[#25D366]/30'
    case 'phone':
      return 'text-white bg-primary hover:bg-primary-dark shadow-lg shadow-primary/30'
    case 'calendar':
      return 'text-white bg-primary hover:bg-primary-dark shadow-lg shadow-primary/30'
    case 'arrow':
      return 'text-white bg-secondary hover:bg-secondary-dark shadow-lg shadow-secondary/30'
    default:
      return 'text-white bg-white/10 hover:bg-white/20 border border-white/30 backdrop-blur'
  }
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
 * `object-position` che porta il punto di fuoco nel punto `bersaglioX` della
 * hero (0.5 = al centro), quando la foto ritagliata da `object-cover` lo
 * permette. Se l'immagine non è abbastanza larga (o alta), lo spostamento si
 * ferma al bordo della foto: il punto resta comunque dentro l'inquadratura.
 */
function posizionePerFuoco(
  contenitoreL: number,
  contenitoreA: number,
  fuocoX: number,
  fuocoY: number,
  bersaglioX = 0.5
): string {
  const scala = Math.max(
    contenitoreL / SFONDO_DEFAULT.larghezza,
    contenitoreA / SFONDO_DEFAULT.altezza
  )
  const asse = (contenitore: number, resa: number, fuoco: number, bersaglio: number) => {
    const eccesso = resa - contenitore
    if (eccesso < 1) return 50
    // Scostamento che porta il fuoco sul bersaglio, limitato a [-eccesso, 0]
    const scostamento = Math.min(0, Math.max(-eccesso, contenitore * bersaglio - fuoco * resa))
    return (-scostamento / eccesso) * 100
  }
  const x = asse(contenitoreL, SFONDO_DEFAULT.larghezza * scala, fuocoX, bersaglioX)
  const y = asse(contenitoreA, SFONDO_DEFAULT.altezza * scala, fuocoY, 0.5)
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
        posizionePerFuoco(
          el.clientWidth,
          el.clientHeight,
          SFONDO_DEFAULT.fuocoX,
          SFONDO_DEFAULT.fuocoY,
          // Da desktop il testo sta a destra: la mela va nel terzo di sinistra
          el.clientWidth >= 1024 ? 0.3 : 0.5
        )
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

/** Dopo quanto compare l'invito a scorrere: quando titolo e bottoni sono entrati. */
const ATTESA_SUGGERIMENTO_MS = 1400

/** Oltre questi pixel di scorrimento l'invito ha fatto il suo lavoro e sparisce. */
const SOGLIA_SCORRIMENTO_PX = 40

/**
 * Evento con cui la hero avvisa il chatbot che l'invito a scorrere è visibile:
 * nel frattempo il chatbot si stringe e rimanda il suo fumetto, così in basso
 * c'è un solo invito alla volta.
 */
export const EVENTO_SUGGERIMENTO_SCROLL = 'sanfedele:suggerimento-scroll'

/**
 * Hero della home, uguale su mobile e desktop: la foto con la mascotte a tutto
 * schermo, titolo e bottoni che entrano da soli in dissolvenza (senza dover
 * scorrere) nella parte bassa, così la mela al centro resta in vista.
 * In fondo un invito a scorrere che, cliccato, porta al contenuto.
 */
export function HomeHeroZoom({ config }: HomeHeroZoomProps) {
  const heroRef = useRef<HTMLElement>(null)
  const [suggerimento, setSuggerimento] = useState(false)

  // L'invito a scorrere compare comunque, appena finita l'entrata del testo, e
  // resta finché si è in cima alla pagina (torna se si risale). Si nasconde
  // mentre la chat è aperta, per non sovrapporsi.
  useEffect(() => {
    let visibile = false
    let chatAperta = false
    let pronto = false

    const imposta = (v: boolean) => {
      if (v === visibile) return
      visibile = v
      setSuggerimento(v)
      window.dispatchEvent(new CustomEvent(EVENTO_SUGGERIMENTO_SCROLL, { detail: { visibile: v } }))
    }
    const aggiorna = () => imposta(pronto && !chatAperta && window.scrollY < SOGLIA_SCORRIMENTO_PX)
    const timer = window.setTimeout(() => {
      pronto = true
      aggiorna()
    }, ATTESA_SUGGERIMENTO_MS)
    const suChat = (e: Event) => {
      chatAperta = !!(e as CustomEvent<{ aperta: boolean }>).detail?.aperta
      aggiorna()
    }

    window.addEventListener('scroll', aggiorna, { passive: true })
    window.addEventListener('sanfedele:chat', suChat)
    return () => {
      window.clearTimeout(timer)
      window.removeEventListener('scroll', aggiorna)
      window.removeEventListener('sanfedele:chat', suChat)
      // Uscendo dalla home il chatbot non deve restare stretto
      imposta(false)
    }
  }, [])

  // Clic sull'invito: scorre fino alla prima sezione dopo la hero, lasciando lo
  // spazio della navbar sticky
  function scorriAlContenuto() {
    const hero = heroRef.current
    if (!hero) return
    const navbar = document.querySelector('header')?.getBoundingClientRect().height ?? 0
    const top = hero.getBoundingClientRect().bottom + window.scrollY - navbar
    const ridotto = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    window.scrollTo({ top, behavior: ridotto ? 'auto' : 'smooth' })
  }

  const ctaPrimaria = config.ctaPrimaria
  const ctaSecondaria = config.ctaSecondaria
  const bgImage = config.immagine || '/hero-bg.jpg'

  return (
    <section
      ref={heroRef}
      // Schermo meno navbar (vedi .hero-schermo in globals.css)
      className="hero-schermo relative min-h-[480px] w-full overflow-hidden"
      aria-label="Hero"
    >
      <SfondoHero src={bgImage} />
      {/* Scurisce solo dove sta il testo: in basso su telefono, a destra su
          desktop. La mela resta luminosa. */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-black/15 to-black/65 lg:bg-gradient-to-r lg:from-black/5 lg:via-black/20 lg:to-black/65" />

      {/* Telefono e tablet: testo in basso e centrato, sotto la mela.
          Desktop: testo nella metà destra, la mela libera nel terzo di sinistra. */}
      <div className="absolute inset-x-0 bottom-0 flex justify-center px-6 pb-28 md:pb-32 lg:inset-y-0 lg:left-auto lg:w-[56%] lg:items-center lg:justify-start lg:pb-0 lg:pl-4 lg:pr-12 xl:pr-24">
        <div className="text-center lg:text-left max-w-4xl lg:max-w-2xl w-full">
          <h1 className="text-3xl sm:text-4xl md:text-6xl xl:text-7xl font-light tracking-tight text-white drop-shadow-md motion-safe:animate-[hero-compari_0.9s_ease-out_0.2s_both]">
            {config.titolo}{' '}
            {config.titoloEvidenziato && (
              <span className="font-semibold block sm:inline lg:block">{config.titoloEvidenziato}</span>
            )}
          </h1>

          {(ctaPrimaria || ctaSecondaria) && (
            <div className="mt-6 md:mt-9 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3 sm:gap-4 motion-safe:animate-[hero-compari_0.9s_ease-out_0.55s_both]">
              {ctaPrimaria && <CtaLink cta={ctaPrimaria} />}
              {ctaSecondaria && <CtaLink cta={ctaSecondaria} />}
            </div>
          )}
        </div>
      </div>

      {/* Invito a scorrere, cliccabile. Il tipo segue il dispositivo di
          puntamento, non la larghezza: un tablet vede il dito, una finestra
          desktop stretta la freccia. */}
      <button
        type="button"
        onClick={scorriAlContenuto}
        aria-label="Scorri ai contenuti"
        tabIndex={suggerimento ? 0 : -1}
        className={`absolute inset-x-0 mx-auto bottom-5 md:bottom-7 z-10 flex w-max flex-col items-center gap-2 transition-all duration-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-white rounded-lg ${
          suggerimento ? 'visible opacity-100' : 'invisible opacity-0'
        }`}
      >
        {/* Schermi touch: un dito che trascina verso l'alto */}
        <span data-suggerimento="dito" className="hidden [@media(pointer:coarse)]:flex flex-col items-center gap-1">
          <span className="relative h-14 w-10">
            <span className="absolute left-1/2 top-0 h-full w-1 -translate-x-1/2 rounded-full bg-gradient-to-t from-white/0 via-white/50 to-white/0" />
            <Pointer
              size={30}
              strokeWidth={1.75}
              className="absolute bottom-0 left-1/2 -ml-[15px] text-white drop-shadow-[0_2px_6px_rgba(0,0,0,0.5)] motion-safe:animate-[dito-scorri_1.8s_ease-in-out_infinite]"
            />
          </span>
          <span className="text-xs font-semibold uppercase tracking-[0.18em] text-white drop-shadow">
            Scorri
          </span>
        </span>

        {/* Mouse e trackpad: una freccia verso il basso */}
        <span data-suggerimento="freccia" className="flex [@media(pointer:coarse)]:hidden flex-col items-center gap-2">
          <span className="text-xs font-semibold uppercase tracking-[0.18em] text-white drop-shadow">
            Scorri
          </span>
          <span className="flex h-12 w-12 items-center justify-center rounded-full border-2 border-white/70 bg-white/10 text-white shadow-lg backdrop-blur-sm transition-colors hover:bg-white/25 motion-safe:animate-[freccia-giu_1.6s_ease-in-out_infinite]">
            <ChevronDown size={26} strokeWidth={2.25} />
          </span>
        </span>
      </button>
    </section>
  )
}
