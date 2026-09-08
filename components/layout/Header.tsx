'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { Menu, X } from 'lucide-react'
import { DSASwitch } from '@/components/accessibility/DSASwitch'
import { MelaButton } from '../ui/MelaButton'

interface NavItem {
  label: string
  href: string
}

const NAV_ITEMS: NavItem[] = [
  { label: 'Servizi', href: '/ambulatori' },
  { label: 'Medici', href: '/medici' },
  { label: 'Convenzioni', href: '/convenzioni' },
  { label: 'Storia', href: '/storia' },
  { label: 'News', href: '/news' },
  { label: 'Contatti', href: '/contatti' },
]

// Pagine che usano il tema scuro per la navbar (estetica accattivante)
const DARK_PAGES = ['/sport']

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
  const dark = DARK_PAGES.includes(pathname)

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
      className={`sticky top-0 z-50 backdrop-blur-xl transition-all duration-300 ${dark
        ? 'bg-slate-950/90 shadow-[0_1px_0_0_rgba(255,255,255,0.06)]'
        : 'bg-white/90 shadow-sm'
        }`}
    >

      {/* Main nav — logo left, titolo absolutely centered, actions right */}
      <nav
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

        {/* Voci menu inline — appaiono solo quando si scrolla (desktop) */}
        <div
          aria-hidden={!scrolled}
          className={`hidden lg:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 items-center gap-7 transition-all duration-300 ${scrolled ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
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

          {/* Mobile toggle */}
          <button
            className={`lg:hidden p-2 ${dark ? 'text-white' : 'text-text-main'}`}
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Menu"
          >
            {mobileOpen ? <X size={28} /> : <Menu size={28} />}
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

      {/* Mobile menu */}
      {mobileOpen && (
        <div
          className={`lg:hidden border-t py-4 ${dark ? 'bg-slate-900 border-slate-800' : 'bg-white border-gray-100'
            }`}
        >
          <div className="container-main flex flex-col gap-0">
            <div
              className={`rounded-lg overflow-hidden border ${dark ? 'border-slate-700' : 'border-gray-100'
                }`}
            >
              {NAV_ITEMS.map((item, idx) => {
                const active = isActive(item.href, pathname)
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`font-medium py-3 px-4 block transition-colors ${idx < NAV_ITEMS.length - 1
                      ? dark ? 'border-b border-slate-700' : 'border-b border-gray-100'
                      : ''
                      } ${dark
                        ? active ? 'text-emerald-400 bg-emerald-500/10' : 'text-white/80 hover:text-emerald-400 hover:bg-emerald-500/10'
                        : active ? 'text-primary bg-primary/10' : 'text-text-main hover:text-primary hover:bg-primary/5'
                      }`}
                    onClick={() => setMobileOpen(false)}
                  >
                    {item.label}
                  </Link>
                )
              })}
            </div>
            <Link
              href="/prenota"
              className={`text-center mt-4 py-3 rounded font-semibold transition-all ${dark
                ? 'bg-emerald-500 hover:bg-emerald-400 text-slate-950'
                : 'btn-primary'
                }`}
              onClick={() => setMobileOpen(false)}
            >
              Prenota Visita
            </Link>
            <div className="mt-3">
              <DSASwitch />
            </div>
          </div>
        </div>
      )}
    </header>
  )
}
