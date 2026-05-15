'use client'

import Image from 'next/image'
import { useEffect, useRef, useState } from 'react'
import { Phone, Calendar, ArrowRight } from 'lucide-react'
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

interface HomeHeroZoomProps {
  config: HeroConfig
}

export function HomeHeroZoom({ config }: HomeHeroZoomProps) {
  const wrapperRef = useRef<HTMLDivElement>(null)
  const [progress, setProgress] = useState(0)
  const [isDesktop, setIsDesktop] = useState(false)

  useEffect(() => {
    const mq = window.matchMedia('(min-width: 768px)')
    const onChange = () => setIsDesktop(mq.matches)
    onChange()
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [])

  useEffect(() => {
    if (!isDesktop) {
      setProgress(1)
      return
    }
    let ticking = false
    function update() {
      ticking = false
      if (!wrapperRef.current) return
      const rect = wrapperRef.current.getBoundingClientRect()
      const vh = window.innerHeight
      const scrolled = Math.max(0, -rect.top)
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
  }, [isDesktop])

  const clamp = (v: number, min = 0, max = 1) => Math.max(min, Math.min(max, v))
  const headlineP = clamp((progress - 0.05) / 0.5)
  const buttonsP = clamp((progress - 0.45) / 0.5)
  const overlayAlpha = 0.25 + progress * 0.3

  const ctaPrimaria = config.ctaPrimaria
  const ctaSecondaria = config.ctaSecondaria
  const bgImage = config.immagine || '/hero-bg.jpg'

  if (!isDesktop) {
    return (
      <section className="relative w-full min-h-[88vh] flex items-center overflow-hidden" aria-label="Hero">
        <Image src={bgImage} alt="" fill priority sizes="100vw" className="object-cover" />
        <div className="absolute inset-0 bg-black/45" />
        <div className="relative z-10 container-main py-12">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-3xl sm:text-4xl font-light tracking-tight text-white drop-shadow-md">
              {config.titolo}{' '}
              {config.titoloEvidenziato && (
                <span className="font-semibold block sm:inline">{config.titoloEvidenziato}</span>
              )}
            </h1>
            {(ctaPrimaria || ctaSecondaria) && (
              <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
                {ctaPrimaria && (
                  <a
                    href={ctaPrimaria.href}
                    target={ctaPrimaria.href.startsWith('http') ? '_blank' : undefined}
                    rel={ctaPrimaria.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                    className={`inline-flex items-center gap-2 px-6 py-3 rounded-full font-semibold transition-all w-full sm:w-auto justify-center min-h-[44px] ${ctaClasses(ctaPrimaria)}`}
                  >
                    <CtaIcon kind={ctaPrimaria.icona} />
                    {ctaPrimaria.testo}
                  </a>
                )}
                {ctaSecondaria && (
                  <a
                    href={ctaSecondaria.href}
                    target={ctaSecondaria.href.startsWith('http') ? '_blank' : undefined}
                    rel={ctaSecondaria.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                    className={`inline-flex items-center gap-2 px-6 py-3 rounded-full font-semibold transition-all w-full sm:w-auto justify-center min-h-[44px] ${ctaClasses(ctaSecondaria)}`}
                  >
                    <CtaIcon kind={ctaSecondaria.icona} />
                    {ctaSecondaria.testo}
                  </a>
                )}
              </div>
            )}
          </div>
        </div>
      </section>
    )
  }

  return (
    <section ref={wrapperRef} className="relative" style={{ height: '200vh' }} aria-label="Hero">
      <div className="sticky top-0 h-screen w-full overflow-hidden">
        <Image src={bgImage} alt="" fill priority sizes="100vw" className="object-cover" />
        <div
          className="absolute inset-0 transition-colors"
          style={{ backgroundColor: `rgba(0,0,0,${overlayAlpha})` }}
        />
        <div className="absolute inset-0 flex items-center justify-center px-6">
          <div className="text-center max-w-4xl w-full">
            <h1
              className="text-5xl md:text-6xl lg:text-7xl font-light tracking-tight text-white drop-shadow-md"
              style={{
                opacity: headlineP,
                transform: `translateY(${(1 - headlineP) * 32}px)`,
                transition: 'opacity 0.05s linear',
                willChange: 'opacity, transform',
              }}
            >
              {config.titolo}{' '}
              {config.titoloEvidenziato && (
                <span className="font-semibold">{config.titoloEvidenziato}</span>
              )}
            </h1>

            {(ctaPrimaria || ctaSecondaria) && (
              <div
                className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4"
                style={{
                  opacity: buttonsP,
                  transform: `translateY(${(1 - buttonsP) * 24}px)`,
                  pointerEvents: buttonsP > 0.5 ? 'auto' : 'none',
                  willChange: 'opacity, transform',
                }}
              >
                {ctaPrimaria && (
                  <a
                    href={ctaPrimaria.href}
                    target={ctaPrimaria.href.startsWith('http') ? '_blank' : undefined}
                    rel={ctaPrimaria.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                    className={`group inline-flex items-center gap-2.5 px-7 py-3 rounded-full font-semibold transition-all ${ctaClasses(ctaPrimaria)}`}
                  >
                    <CtaIcon kind={ctaPrimaria.icona} />
                    {ctaPrimaria.testo}
                  </a>
                )}
                {ctaSecondaria && (
                  <a
                    href={ctaSecondaria.href}
                    target={ctaSecondaria.href.startsWith('http') ? '_blank' : undefined}
                    rel={ctaSecondaria.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                    className={`group inline-flex items-center gap-2.5 px-7 py-3 rounded-full font-semibold transition-all ${ctaClasses(ctaSecondaria)}`}
                  >
                    <CtaIcon kind={ctaSecondaria.icona} />
                    {ctaSecondaria.testo}
                  </a>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
