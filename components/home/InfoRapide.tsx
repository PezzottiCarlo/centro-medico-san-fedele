import { Clock, Phone, MessageSquareText, MapPin, CalendarCheck, ArrowRight } from 'lucide-react'
import Link from 'next/link'
import { HomeContactForm } from '@/components/home/HomeContactForm'
import { StatoApertura } from '@/components/home/StatoApertura'
import { CtaIcon } from '@/components/ui/CtaIcon'
import type { SiteConfig } from '@/types'

interface Props {
  site: SiteConfig
  specialistiche: { id: string; nome: string }[]
}

/** Numero pulito per i link tel: e wa.me */
function soloCifre(numero: string): string {
  return numero.replace(/[^\d+]/g, '')
}

/**
 * Sezione subito sotto la hero della home: le tre cose che si cercano per
 * prime — quando siete aperti, scrivervi, chiamarvi. Su desktop tre colonne con
 * il modulo al centro; su telefono chiamata e orari vengono prima del modulo.
 */
export function InfoRapide({ site, specialistiche }: Props) {
  const tel = soloCifre(site.telefonoE164 || site.telefono)
  const whatsapp = site.whatsappE164 ? soloCifre(site.whatsappE164).replace(/^\+/, '') : ''

  return (
    <section className="relative bg-gradient-to-b from-bg-soft via-white to-white py-14 md:py-20">
      <div className="container-main">
        <div className="text-center mb-10 md:mb-12">
          <p className="text-primary uppercase text-xs tracking-widest font-bold mb-2">
            Siamo qui per te
          </p>
          <h2 className="heading-2">Contattaci come preferisci</h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.55fr_1fr] gap-5 md:gap-6 items-stretch">
          {/* ── Orari ─────────────────────────────── */}
          <article className="order-2 lg:order-1 flex flex-col rounded-2xl bg-white p-6 md:p-7 shadow-card border border-primary/10">
            <div className="flex items-center justify-between gap-3 mb-5">
              <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-primary-dark text-white shadow-lg shadow-primary/25">
                <Clock size={26} aria-hidden />
              </span>
              <StatoApertura orari={site.orari} />
            </div>
            <h3 className="text-xl font-bold text-text-main mb-4">Orari di apertura</h3>
            <ul className="space-y-2.5 flex-1">
              {site.orari.map((o, i) => {
                const chiuso = o.ore.trim().toLowerCase() === 'chiuso'
                return (
                  <li
                    key={i}
                    className="flex items-baseline justify-between gap-3 border-b border-bg-soft pb-2.5 last:border-0 last:pb-0"
                  >
                    <span className="font-medium text-text-main">{o.giorno}</span>
                    <span className={`text-right font-semibold ${chiuso ? 'text-gray-400' : 'text-primary-dark'}`}>
                      {o.ore}
                    </span>
                  </li>
                )
              })}
            </ul>
            <Link
              href="/prenota"
              className="mt-6 inline-flex items-center justify-center gap-2 rounded-full border-2 border-primary px-5 py-2.5 text-sm font-semibold text-primary transition-colors hover:bg-primary hover:text-white"
            >
              <CalendarCheck size={17} aria-hidden /> Prenota una visita
            </Link>
          </article>

          {/* ── Modulo di contatto ────────────────── */}
          <article className="order-3 lg:order-2 rounded-2xl bg-white p-6 md:p-8 shadow-card-hover border border-primary/10">
            <div className="flex items-center gap-4 mb-6">
              <span className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-secondary to-secondary-dark text-white shadow-lg shadow-secondary/25">
                <MessageSquareText size={26} aria-hidden />
              </span>
              <div>
                <h3 className="text-xl font-bold text-text-main">Scrivici</h3>
                <p className="text-sm text-text-main/60">Ti rispondiamo il prima possibile</p>
              </div>
            </div>
            <HomeContactForm specialistiche={specialistiche} embedded />
          </article>

          {/* ── Chiama il centro ──────────────────── */}
          <article className="order-1 lg:order-3 relative overflow-hidden flex flex-col rounded-2xl bg-gradient-to-br from-primary to-primary-dark p-6 md:p-7 text-white shadow-card-hover">
            <div aria-hidden className="pointer-events-none absolute -right-12 -top-12 h-40 w-40 rounded-full bg-white/10" />
            <div aria-hidden className="pointer-events-none absolute -bottom-16 -left-10 h-44 w-44 rounded-full bg-white/5" />

            <span className="relative flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-primary shadow-lg mb-5">
              <Phone size={26} aria-hidden />
            </span>
            <h3 className="relative text-xl font-bold mb-1">Chiama il centro</h3>
            <p className="relative text-white/75 text-sm mb-5">
              La segreteria risponde negli orari di apertura.
            </p>

            <a
              href={`tel:${tel}`}
              className="relative mb-3 flex items-center justify-center gap-2 rounded-full bg-white px-5 py-3.5 text-lg font-bold text-primary-dark shadow-lg transition-transform hover:scale-[1.02] active:scale-[0.98]"
            >
              <Phone size={20} aria-hidden /> {site.telefono}
            </a>
            {whatsapp && (
              <a
                href={`https://wa.me/${whatsapp}`}
                target="_blank"
                rel="noopener noreferrer"
                className="relative flex items-center justify-center gap-2 rounded-full bg-[#25D366] px-5 py-3 font-semibold text-white shadow-lg shadow-black/10 transition-colors hover:bg-[#1ebe57]"
              >
                <CtaIcon kind="whatsapp" size={20} /> Scrivici su WhatsApp
              </a>
            )}

            <div className="relative mt-auto pt-6">
              <Link
                href="/contatti"
                className="group flex items-start gap-3 rounded-xl bg-white/10 p-4 transition-colors hover:bg-white/15"
              >
                <MapPin size={20} className="mt-0.5 flex-shrink-0" aria-hidden />
                <span className="text-sm leading-snug">
                  <span className="block font-semibold">{site.indirizzo}</span>
                  <span className="text-white/75">
                    {site.cap} {site.citta} ({site.provincia})
                  </span>
                </span>
                <ArrowRight size={16} className="ml-auto mt-0.5 flex-shrink-0 transition-transform group-hover:translate-x-0.5" aria-hidden />
              </Link>
            </div>
          </article>
        </div>
      </div>
    </section>
  )
}
