'use client'

import Image from 'next/image'
import { useEffect, useRef, useState } from 'react'
import { Phone } from 'lucide-react'

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

/**
 * Hero scroll-reveal:
 * - Frame 1 (progress 0): solo immagine bg pulita
 * - Frame 2 (progress 0→0.5): appare la scritta principale dal basso
 * - Frame 3 (progress 0.5→1): appaiono i due bottoni
 * - Quando tutto è on-screen, lo sticky si rilascia e riprende lo scroll normale
 */
export function HomeHeroZoom() {
  const wrapperRef = useRef<HTMLDivElement>(null)
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    let ticking = false

    function update() {
      ticking = false
      if (!wrapperRef.current) return
      const rect = wrapperRef.current.getBoundingClientRect()
      const vh = window.innerHeight
      const scrolled = Math.max(0, -rect.top)
      // Reveal completo quando l'utente ha scrollato 1.0 * vh
      const p = Math.min(1, scrolled / vh)
      setProgress(p)
    }

    function onScroll() {
      if (!ticking) {
        ticking = true
        requestAnimationFrame(update)
      }
    }

    update()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', update)
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', update)
    }
  }, [])

  // Easing helpers
  const clamp = (v: number, min = 0, max = 1) => Math.max(min, Math.min(max, v))

  // Headline: appare tra 0.05 e 0.55 (fade + slide-up)
  const headlineP = clamp((progress - 0.05) / 0.5)
  const headlineOpacity = headlineP
  const headlineTranslate = (1 - headlineP) * 32

  // Buttons: appaiono tra 0.45 e 0.95
  const buttonsP = clamp((progress - 0.45) / 0.5)
  const buttonsOpacity = buttonsP
  const buttonsTranslate = (1 - buttonsP) * 24

  // Overlay scuro graduale per leggibilità
  const overlayAlpha = 0.15 + progress * 0.35

  return (
    <section
      ref={wrapperRef}
      className="relative"
      style={{ height: '200vh' }}
      aria-label="Hero"
    >
      <div className="sticky top-0 h-screen w-full overflow-hidden">
        {/* Hero bg */}
        <Image
          src="/hero-bg.jpg"
          alt=""
          fill
          priority
          className="object-cover"
          sizes="100vw"
        />
        <div
          className="absolute inset-0 transition-colors"
          style={{ backgroundColor: `rgba(0,0,0,${overlayAlpha})` }}
        />

        {/* Contenuto centrato — scritta + bottoni */}
        <div className="absolute inset-0 flex items-center justify-center px-6">
          <div className="text-center max-w-4xl w-full">
            <h1
              className="text-4xl md:text-6xl lg:text-7xl font-light tracking-tight text-white drop-shadow-md"
              style={{
                opacity: headlineOpacity,
                transform: `translateY(${headlineTranslate}px)`,
                transition: 'opacity 0.05s linear',
                willChange: 'opacity, transform',
              }}
            >
              La tua salute,{' '}
              <span className="font-semibold">la nostra missione</span>
            </h1>

            <div
              className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4"
              style={{
                opacity: buttonsOpacity,
                transform: `translateY(${buttonsTranslate}px)`,
                pointerEvents: buttonsOpacity > 0.5 ? 'auto' : 'none',
                willChange: 'opacity, transform',
              }}
            >
              <a
                href="tel:+390313333585"
                className="group inline-flex items-center gap-2.5 text-white bg-sky-500 hover:bg-sky-400 shadow-lg shadow-sky-500/30 px-7 py-3 rounded-full font-semibold transition-all"
              >
                <Phone size={18} />
                Chiamaci ora
              </a>
              <a
                href="https://wa.me/390313333585"
                target="_blank"
                rel="noopener noreferrer"
                className="group inline-flex items-center gap-2.5 text-white bg-[#25D366] hover:bg-[#1ebe57] shadow-lg shadow-[#25D366]/30 px-7 py-3 rounded-full font-semibold transition-all"
              >
                <WhatsAppIcon size={18} />
                Chatta ora
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
