'use client'

import { Phone, Clock, MapPin } from 'lucide-react'

function WhatsAppIcon({ size = 24, className = '' }: { size?: number; className?: string }) {
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

export function HomeCall() {
  return (
    <div className="relative bg-gradient-to-br from-white via-bg-soft to-white rounded-[28px] shadow-[0_30px_80px_-20px_rgba(46,155,218,0.35)] ring-1 ring-primary/10 overflow-hidden">
      {/* Soft ambient glows — contenuti nella card */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-24 -left-24 w-72 h-72 rounded-full bg-primary/15 blur-3xl" />
        <div className="absolute -bottom-24 -right-24 w-80 h-80 rounded-full bg-secondary/15 blur-3xl" />
      </div>

      {/* Top accent bar */}
      <div className="relative h-1.5 w-full bg-gradient-to-r from-primary via-secondary to-primary" />

      <div className="relative p-8 md:p-12 lg:p-14">
          <div className="text-center mb-10">
            <p className="inline-flex items-center gap-2 text-primary uppercase text-[11px] tracking-[0.2em] font-bold mb-4">
              <span className="w-8 h-px bg-primary/40" />
              Parla con noi
              <span className="w-8 h-px bg-primary/40" />
            </p>
            <h2 className="text-3xl md:text-5xl font-extrabold text-text-main leading-tight mb-4">
              Siamo qui per te,
              <br />
              <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                in ogni momento
              </span>
            </h2>
            <p className="text-text-main/60 text-base md:text-lg max-w-xl mx-auto leading-relaxed">
              Contattaci per una prenotazione o per un&apos;informazione. Un operatore è pronto a risponderti.
            </p>
          </div>

          {/* Contact cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5 mb-8">
            {/* Phone card */}
            <a
              href="tel:+390313333585"
              className="group relative overflow-hidden rounded-2xl bg-white ring-1 ring-primary/10 p-6 md:p-7 hover:ring-primary/40 hover:-translate-y-1 hover:shadow-[0_20px_40px_-12px_rgba(46,155,218,0.3)] transition-all duration-300"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-primary/0 via-primary/0 to-primary/5 group-hover:to-primary/10 transition-colors" />
              <div className="relative flex items-start gap-4">
                <div className="w-14 h-14 md:w-16 md:h-16 rounded-2xl bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center shadow-lg shadow-primary/30 group-hover:scale-105 transition-transform flex-shrink-0">
                  <Phone size={24} className="text-white" />
                </div>
                <div className="min-w-0">
                  <span className="block text-[10px] uppercase tracking-widest text-text-main/50 font-bold mb-1">
                    Telefono
                  </span>
                  <span className="block text-2xl md:text-3xl font-black text-text-main leading-tight group-hover:text-primary transition-colors">
                    031 333 3585
                  </span>
                  <span className="block text-xs text-text-main/50 mt-1">
                    Chiama il centro direttamente
                  </span>
                </div>
              </div>
            </a>

            {/* WhatsApp card */}
            <a
              href="https://wa.me/390313333585"
              target="_blank"
              rel="noopener noreferrer"
              className="group relative overflow-hidden rounded-2xl bg-white ring-1 ring-[#25D366]/15 p-6 md:p-7 hover:ring-[#25D366]/50 hover:-translate-y-1 hover:shadow-[0_20px_40px_-12px_rgba(37,211,102,0.3)] transition-all duration-300"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-[#25D366]/0 via-[#25D366]/0 to-[#25D366]/5 group-hover:to-[#25D366]/10 transition-colors" />
              <div className="relative flex items-start gap-4">
                <div className="w-14 h-14 md:w-16 md:h-16 rounded-2xl bg-gradient-to-br from-[#25D366] to-[#128C7E] flex items-center justify-center shadow-lg shadow-[#25D366]/30 group-hover:scale-105 transition-transform flex-shrink-0">
                  <WhatsAppIcon size={26} className="text-white" />
                </div>
                <div className="min-w-0">
                  <span className="block text-[10px] uppercase tracking-widest text-text-main/50 font-bold mb-1">
                    WhatsApp
                  </span>
                  <span className="block text-2xl md:text-3xl font-black text-text-main leading-tight group-hover:text-[#128C7E] transition-colors">
                    Scrivici ora
                  </span>
                  <span className="block text-xs text-text-main/50 mt-1">
                    Risposta rapida in chat
                  </span>
                </div>
              </div>
            </a>
          </div>

          {/* Info footer */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-6 border-t border-primary/10">
            <div className="flex items-center gap-3 text-sm text-text-main/70">
              <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Clock size={16} className="text-primary" />
              </div>
              <div>
                <p className="font-bold text-text-main leading-tight">Lun–Ven</p>
                <p className="text-xs">09:00–19:30 orario continuato</p>
              </div>
            </div>
            <div className="flex items-center gap-3 text-sm text-text-main/70">
              <div className="w-9 h-9 rounded-full bg-secondary/10 flex items-center justify-center flex-shrink-0">
                <MapPin size={16} className="text-secondary" />
              </div>
              <div>
                <p className="font-bold text-text-main leading-tight">Longone al Segrino</p>
                <p className="text-xs">Via San Fedele 2, Como</p>
              </div>
            </div>
          </div>
        </div>
    </div>
  )
}
