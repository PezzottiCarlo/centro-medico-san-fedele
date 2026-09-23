'use client'

import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { ArrowRight, MessageCircle } from 'lucide-react'
import { paginaScura } from '@/lib/temaPagine'

function openChatbot() {
  if (typeof window === 'undefined') return
  window.dispatchEvent(new CustomEvent('sanfedele:open-chat'))
}

/**
 * Banda CTA "Chiedi al nostro assistente" mostrata in fondo a ogni pagina pubblica.
 * Apre il chatbot MelaBot tramite l'evento globale già gestito da ChatbotButton.
 */
export function MelaChatCTA() {
  // Sulle pagine scure (Medicina sportiva) la banda segue lo stesso tema
  const scura = paginaScura(usePathname())

  return (
    <section
      className={
        scura ? 'bg-slate-950 border-t border-slate-800' : 'bg-bg-soft border-t border-gray-100'
      }
    >
      <div className="container-main py-12 md:py-16">
        <div className="flex flex-col md:flex-row items-center justify-center gap-6 md:gap-10 text-center md:text-left">
          <Image
            src="/mela-idea.png"
            alt=""
            width={120}
            height={120}
            className="w-24 h-24 md:w-28 md:h-28 object-contain flex-shrink-0"
          />
          <div className="max-w-md">
            <h2
              className={`text-2xl md:text-3xl font-extrabold mb-2 ${scura ? 'text-white' : 'text-text-main'}`}
            >
              Hai una domanda?
            </h2>
            <p className={`font-medium mb-5 ${scura ? 'text-slate-400' : 'text-text-main/60'}`}>
              Il nostro assistente virtuale MelaBot ti risponde subito: prenotazioni, orari,
              specialistiche e convenzioni.
            </p>
            {/* Bottone senza mela: la sezione ha già la sua, accanto al titolo */}
            <button
              type="button"
              onClick={openChatbot}
              className={`group inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-semibold shadow-lg transition-all hover:shadow-xl hover:-translate-y-0.5 ${
                scura
                  ? 'bg-emerald-500 text-slate-950 shadow-emerald-500/25 hover:bg-emerald-400 hover:shadow-emerald-500/30'
                  : 'bg-gradient-to-r from-primary/70 via-primary to-primary-dark text-white shadow-primary/25 hover:shadow-primary/30'
              }`}
            >
              <MessageCircle size={18} aria-hidden />
              Chiedi al nostro assistente
              <ArrowRight size={14} className="transition-transform group-hover:translate-x-0.5" aria-hidden />
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}
