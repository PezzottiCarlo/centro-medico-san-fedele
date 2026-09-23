'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useState, useEffect, useRef } from 'react'
import { usePathname } from 'next/navigation'
import { Menu, X, ChevronRight, ArrowRight } from 'lucide-react'
import { DSASwitch } from '@/components/accessibility/DSASwitch'
import { MelaButton } from '../ui/MelaButton'
import { paginaScura } from '@/lib/temaPagine'

interface NavItem {
  label: string
  href: string
}

const NAV_ITEMS: NavItem[] = [
  { label: 'Home', href: '/' },
  { label: 'Servizi', href: '/ambulatori' },
  { label: 'Medici', href: '/medici' },
  { label: 'Convenzioni', href: '/convenzioni' },
  { label: 'Storia', href: '/storia' },
  { label: 'News', href: '/news' },
  { label: 'Contatti', href: '/contatti' },
]


function isActive(href: string, pathname: string): boolean {
  if (href === '/') return pathname === '/'
  // "Servizi" copre anche le pagine /dsa e /sport (sono servizi/specialistiche)
  if (href === '/ambulatori') {
    return (
      pathname === '/ambulatori' ||
      pathname.startsWith('/ambulatori/') ||
      pathname === '/dsa' ||
      pathname === '/sport'
    )
  }
  // "Contatti" copre anche /dove-siamo (mergiata)
  if (href === '/contatti') {
    return pathname === '/contatti' || pathname === '/dove-siamo'
  }
  return pathname === href || pathname.startsWith(href + '/')
}

export function Header() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const pathname = usePathname()
  const dark = paginaScura(pathname)

  // Il menu resta aperto se si naviga verso la pagina già attiva: chiudiamolo
  // a ogni cambio di rotta invece di affidarci al solo onClick delle voci.
  useEffect(() => {
    setMobileOpen(false)
  }, [pathname])

  // Altezza reale della barra: serve a limitare il menu mobile allo spazio che
  // resta sotto di essa. Cambia con lo scroll (logo e padding si riducono),
  // quindi la osserviamo invece di fissarla a un numero.
  const navRef = useRef<HTMLElement>(null)
  const [navH, setNavH] = useState(0)
  useEffect(() => {
    const el = navRef.current
    if (!el) return
    const misura = () => setNavH(el.offsetHeight)
    misura()
    const ro = new ResizeObserver(misura)
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  // Altezza della navbar "grande" (in cima alla pagina) esposta come variabile
  // CSS: la hero della home la sottrae allo schermo, così titolo, bottoni e
  // invito a scorrere stanno sopra la piega. Si misura solo da non scrollati,
  // perché mentre la barra si riduce la hero non deve cambiare altezza.
  const headerRef = useRef<HTMLElement>(null)
  useEffect(() => {
    const el = headerRef.current
    if (!el || scrolled) return
    const misura = () =>
      document.documentElement.style.setProperty('--altezza-header', `${el.offsetHeight}px`)
    misura()
    const ro = new ResizeObserver(misura)
    ro.observe(el)
    return () => ro.disconnect()
  }, [scrolled])

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY
      setScrolled((prev) => (prev ? y > 20 : y > 80))
    }
    onScroll()
    const raf = requestAnimationFrame(onScroll)
    const t = window.setTimeout(onScroll, 100)
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('load', onScroll)
    return () => {
      cancelAnimationFrame(raf)
      clearTimeout(t)
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('load', onScroll)
    }
  }, [])

  return (
    <header
      ref={headerRef}
      className={`sticky top-0 z-[60] backdrop-blur-xl transition-all duration-300 ${dark
        ? 'bg-slate-950/90 shadow-[0_1px_0_0_rgba(255,255,255,0.06)]'
        : 'bg-white/90 shadow-sm'
        }`}
    >

      {/* Main nav — logo left, titolo absolutely centered, actions right */}
      <nav
        ref={navRef}
        className={`container-main relative flex items-center justify-between gap-4 transition-all duration-300 ${scrolled ? 'py-2 md:py-2' : 'py-5 md:py-6'
          }`}
      >
        <Link href="/" className="flex items-center shrink-0 relative z-10">
          <span
            className={`flex items-center justify-center transition-all duration-300 ${dark
              ? 'rounded-full bg-white shadow-[0_2px_12px_-2px_rgba(16,185,129,0.35)] ring-1 ring-emerald-400/30'
              : ''
              } ${dark
                ? scrolled ? 'p-1.5' : 'p-2'
                : ''
              }`}
          >
            <Image
              src="/logo-san-fedele.png"
              alt="Centro Medico San Fedele"
              width={1521}
              height={1320}
              className={`h-auto object-contain transition-all duration-300 ${scrolled ? 'w-10 md:w-11' : 'w-14 md:w-16'
                }`}
              priority
            />
          </span>
        </Link>

        {/* Titolo centrale — si nasconde con lo scroll */}
        <Link
          href="/"
          aria-hidden={scrolled}
          className={`absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center max-w-[60%] md:max-w-[55%] transition-all duration-300 ${scrolled ? 'opacity-0 pointer-events-none scale-95' : 'opacity-100 pointer-events-auto scale-100'
            }`}
        >
          <Image
            src="/titolo.png"
            alt="Centro Medico San Fedele"
            width={1640}
            height={300}
            className={`h-10 md:h-14 lg:h-16 w-auto object-contain max-w-full ${dark ? 'brightness-0 invert' : ''}`}
            priority
          />
        </Link>

        {/* Telefono e tablet: quando il titolo grande sparisce con lo scroll, al
            suo posto compare "Prenota ora", così la prenotazione è sempre a un tocco */}
        <Link
          href="/prenota"
          aria-hidden={!scrolled}
          tabIndex={scrolled ? undefined : -1}
          className={`lg:hidden absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-5 py-2 text-sm font-semibold shadow-sm transition-all duration-300 ${dark
            ? 'bg-emerald-500 text-slate-950 hover:bg-emerald-400'
            : 'bg-primary text-white hover:bg-primary-dark'
            } ${scrolled && !mobileOpen ? 'opacity-100 scale-100' : 'opacity-0 scale-90 pointer-events-none'}`}
        >
          Prenota ora
          <ArrowRight size={16} aria-hidden />
        </Link>

        {/* Voci menu inline — appaiono solo quando si scrolla (desktop) */}
        <div
          aria-hidden={!scrolled}
          className={`hidden lg:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 items-center gap-5 xl:gap-7 transition-all duration-300 ${scrolled ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
            }`}
        >
          {NAV_ITEMS.map((item) => {
            const active = isActive(item.href, pathname)
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`font-medium text-sm transition-colors ${dark
                  ? active ? 'text-emerald-400' : 'text-white/80 hover:text-emerald-400'
                  : active ? 'text-primary' : 'text-text-main hover:text-primary'
                  }`}
              >
                {item.label}
              </Link>
            )
          })}
        </div>

        <div className="flex items-center gap-3 justify-end relative z-10">
          <div className="hidden lg:flex items-center gap-3">
            <DSASwitch compact />
            <MelaButton
              href="/prenota"
              mela="indica"
              melaPosition="right"
              variant="primary"
              melaFlip={true}
              showArrow={false}
              melaSize='sm'
              
            >
              Prenota Visita
            </MelaButton>
          </div>

          {/* Mobile toggle — le due icone si scambiano ruotando */}
          <button
            className={`lg:hidden relative h-11 w-11 rounded-xl flex items-center justify-center transition-colors active:scale-95 ${dark
              ? 'text-white hover:bg-white/10'
              : 'text-text-main hover:bg-primary/10'
              } ${mobileOpen ? (dark ? 'bg-white/10' : 'bg-primary/10') : ''}`}
            onClick={() => setMobileOpen((v) => !v)}
            aria-label={mobileOpen ? 'Chiudi menu' : 'Apri menu'}
            aria-expanded={mobileOpen}
            aria-controls="mobile-menu"
          >
            <Menu
              size={26}
              className={`absolute transition-all duration-300 ${mobileOpen ? 'opacity-0 rotate-90 scale-75' : 'opacity-100 rotate-0 scale-100'
                }`}
            />
            <X
              size={26}
              className={`absolute transition-all duration-300 ${mobileOpen ? 'opacity-100 rotate-0 scale-100' : 'opacity-0 -rotate-90 scale-75'
                }`}
            />
          </button>
        </div>
      </nav>

      {/* Secondary nav row (desktop) — visibile solo in stato grande */}
      <div
        aria-hidden={scrolled}
        className={`hidden lg:block border-t transition-all duration-300 ${dark ? 'border-slate-800' : 'border-gray-100'
          } ${scrolled ? 'max-h-0 opacity-0 overflow-hidden border-transparent' : 'max-h-20 opacity-100'}`}
      >
        <div className="container-main py-3 flex items-center justify-center gap-8">
          {NAV_ITEMS.map((item) => {
            const active = isActive(item.href, pathname)
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`font-medium text-sm transition-colors ${dark
                  ? active ? 'text-emerald-400' : 'text-white/80 hover:text-emerald-400'
                  : active ? 'text-primary' : 'text-text-main hover:text-primary'
                  }`}
              >
                {item.label}
              </Link>
            )
          })}
        </div>
      </div>

      {/* Menu mobile — resta montato per poter animare anche la chiusura.
          Il collasso usa grid-rows 1fr→0fr: si adatta all'altezza reale del
          contenuto senza max-height indovinate a mano. */}
      <div
        id="mobile-menu"
        aria-hidden={!mobileOpen}
        className={`lg:hidden grid overflow-hidden transition-[grid-template-rows,opacity] duration-300 ease-out ${mobileOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
          }`}
      >
        <div className="min-h-0">
          <div
            // Mai più alto dello spazio sotto la barra: se le voci non ci stanno
            // scorre il pannello, non la pagina. `svh` tiene conto della barra
            // del browser mobile anche quando è espansa.
            style={{ maxHeight: navH ? `calc(100svh - ${navH}px)` : undefined }}
            className={`overflow-y-auto overscroll-contain border-t ${dark ? 'border-slate-800 bg-slate-900/95' : 'border-gray-100 bg-white/95'
              }`}
          >
            <div className="container-main py-4">
              <nav className="flex flex-col gap-1">
                {NAV_ITEMS.map((item, idx) => {
                  const active = isActive(item.href, pathname)
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setMobileOpen(false)}
                      // In apertura le voci entrano a cascata; in chiusura
                      // escono tutte insieme, senza coda.
                      style={{ transitionDelay: mobileOpen ? `${60 + idx * 45}ms` : '0ms' }}
                      className={`group flex items-center gap-3 rounded-xl px-3 py-3.5 font-medium transition-all duration-300 ${mobileOpen ? 'translate-y-0 opacity-100' : 'translate-y-2 opacity-0'
                        } ${dark
                          ? active
                            ? 'bg-emerald-500/10 text-emerald-400'
                            : 'text-white/80 hover:bg-white/5 hover:text-emerald-400'
                          : active
                            ? 'bg-primary/10 text-primary'
                            : 'text-text-main hover:bg-primary/5 hover:text-primary'
                        }`}
                    >
                      {/* Barretta di accento: piena sulla voce attiva */}
                      <span
                        className={`h-6 w-1 rounded-full transition-colors ${active
                          ? dark ? 'bg-emerald-400' : 'bg-primary'
                          : dark ? 'bg-white/10' : 'bg-gray-200'
                          }`}
                      />
                      <span className="flex-1">{item.label}</span>
                      <ChevronRight
                        size={16}
                        className={`transition-all duration-200 ${active
                          ? 'opacity-100'
                          : 'opacity-0 -translate-x-1 group-hover:translate-x-0 group-hover:opacity-60'
                          }`}
                      />
                    </Link>
                  )
                })}
              </nav>

              <Link
                href="/prenota"
                onClick={() => setMobileOpen(false)}
                style={{
                  transitionDelay: mobileOpen ? `${60 + NAV_ITEMS.length * 45}ms` : '0ms',
                }}
                className={`mt-4 flex items-center justify-center gap-2 rounded-xl py-3.5 font-semibold shadow-sm transition-all duration-300 active:scale-[0.98] ${mobileOpen ? 'translate-y-0 opacity-100' : 'translate-y-2 opacity-0'
                  } ${dark
                    ? 'bg-emerald-500 text-slate-950 hover:bg-emerald-400'
                    : 'bg-primary text-white hover:bg-primary-dark'
                  }`}
              >
                Prenota Visita
                <ArrowRight size={18} />
              </Link>

              <div
                style={{
                  transitionDelay: mobileOpen ? `${105 + NAV_ITEMS.length * 45}ms` : '0ms',
                }}
                className={`mt-3 transition-all duration-300 ${mobileOpen ? 'translate-y-0 opacity-100' : 'translate-y-2 opacity-0'
                  }`}
              >
                <DSASwitch dark={dark} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Velo sul contenuto sotto al menu: parte dal bordo inferiore
          dell'header, quindi non copre mai la navbar stessa. */}
      <div
        onClick={() => setMobileOpen(false)}
        aria-hidden
        className={`lg:hidden absolute inset-x-0 top-full h-screen bg-slate-950/25 backdrop-blur-[2px] transition-opacity duration-300 ${mobileOpen ? 'opacity-100' : 'pointer-events-none opacity-0'
          }`}
      />
    </header>
  )
}
