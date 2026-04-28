'use client'

import { Phone, Clock, MessageCircle } from 'lucide-react'
import { HomeContactForm } from './HomeContactForm'

interface Props {
  specialistiche: { id: string; nome: string }[]
}

export function HomeCallContact({ specialistiche }: Props) {
  return (
    <div className="bg-white rounded-lg shadow-card-hover border border-primary/10 overflow-hidden">
      <div className="grid grid-cols-1 lg:grid-cols-5">
            {/* Left 40% - Chiamata + WhatsApp */}
            <div className="lg:col-span-2 bg-bg-soft p-6 md:p-7 flex flex-col">
              <p className="text-primary uppercase text-[11px] tracking-widest font-bold mb-2">
                Parla con noi
              </p>
              <h2 className="text-2xl md:text-[26px] font-extrabold text-text-main leading-tight mb-4">
                Chiama subito il Centro
              </h2>

              <a
                href="tel:+390313333585"
                className="group flex items-center gap-3 mb-3 hover:text-primary transition-colors"
              >
                <div className="w-11 h-11 md:w-12 md:h-12 rounded-full bg-primary flex items-center justify-center shadow-card group-hover:scale-105 transition-transform flex-shrink-0">
                  <Phone size={20} className="text-white" />
                </div>
                <div>
                  <span className="block text-[10px] uppercase tracking-wide text-text-main/60 font-bold mb-0.5">
                    Telefono
                  </span>
                  <span className="block text-lg md:text-xl font-black text-text-main leading-none">
                    031 333 3585
                  </span>
                </div>
              </a>

              <a
                href="https://wa.me/390313333585"
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center gap-3 mb-3 hover:text-[#25D366] transition-colors"
              >
                <div className="w-11 h-11 md:w-12 md:h-12 rounded-full bg-[#25D366] flex items-center justify-center shadow-card group-hover:scale-105 transition-transform flex-shrink-0">
                  <MessageCircle size={20} className="text-white" />
                </div>
                <div>
                  <span className="block text-[10px] uppercase tracking-wide text-text-main/60 font-bold mb-0.5">
                    WhatsApp
                  </span>
                  <span className="block text-base md:text-lg font-black text-text-main leading-tight">
                    Scrivici ora
                  </span>
                </div>
              </a>

              <div className="mt-auto pt-4 border-t border-primary/15 flex items-start gap-2.5 text-xs text-text-main/70">
                <Clock size={15} className="text-primary mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-bold text-text-main mb-0.5">Lun–Ven</p>
                  <p>09:00–19:30 orario continuato</p>
                </div>
              </div>
            </div>

            {/* Right 60% - Contact form */}
            <div className="lg:col-span-3 p-6 md:p-7">
              <p className="text-primary uppercase text-[11px] tracking-widest font-bold mb-2">
                Modulo contatto
              </p>
              <h2 className="text-2xl md:text-[26px] font-extrabold text-text-main leading-tight mb-4">
                Contattaci subito
              </h2>
              <HomeContactForm specialistiche={specialistiche} embedded />
            </div>
      </div>
    </div>
  )
}
