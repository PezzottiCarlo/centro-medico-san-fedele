'use client'

import Image from 'next/image'
import { MelaButton } from '@/components/ui/MelaButton'

function openChatbot() {
  if (typeof window === 'undefined') return
  window.dispatchEvent(new CustomEvent('sanfedele:open-chat'))
}

/**
 * Banda CTA "Chiedi al nostro assistente" mostrata in fondo a ogni pagina pubblica.
 * Apre il chatbot MelaBot tramite l'evento globale già gestito da ChatbotButton.
 */
export function MelaChatCTA() {
  return (
    <section className="bg-bg-soft border-t border-gray-100">
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
            <h2 className="text-2xl md:text-3xl font-extrabold text-text-main mb-2">
              Hai una domanda?
            </h2>
            <p className="text-text-main/60 font-medium mb-5">
              Il nostro assistente virtuale MelaBot ti risponde subito: prenotazioni, orari,
              specialistiche e convenzioni.
            </p>
            <MelaButton mela="indica" melaSize="md" onClick={openChatbot} showArrow>
              Chiedi al nostro assistente
            </MelaButton>
          </div>
        </div>
      </div>
    </section>
  )
}
