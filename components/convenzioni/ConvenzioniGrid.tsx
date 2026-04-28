'use client'

import { useState, useEffect, useCallback } from 'react'
import Image from 'next/image'
import { ExternalLink, X, Info } from 'lucide-react'
import type { Convenzione } from '@/types'

interface Props {
  convenzioni: Convenzione[]
}

export function ConvenzioniGrid({ convenzioni }: Props) {
  const [openId, setOpenId] = useState<string | null>(null)
  const [mounted, setMounted] = useState(false)

  const open = convenzioni.find((c) => c.id === openId)

  useEffect(() => {
    if (openId) {
      // Trigger entrance animation on next frame
      requestAnimationFrame(() => setMounted(true))
      document.body.style.overflow = 'hidden'
    } else {
      setMounted(false)
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [openId])

  const close = useCallback(() => {
    setMounted(false)
    // Aspetta la transizione di chiusura prima di smontare
    setTimeout(() => setOpenId(null), 250)
  }, [])

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') close()
    }
    if (openId) window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [openId, close])

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {convenzioni.map((c) => {
          const hasDetail = !!c.descrizione
          return (
            <div
              key={c.id}
              className="group relative bg-white rounded-lg p-6 shadow-card border border-gray-100 flex flex-col items-center text-center h-56 transition-all duration-300 hover:shadow-card-hover hover:-translate-y-1 hover:border-primary/30"
            >
              {/* Logo o iniziale */}
              <div className="flex-1 flex items-center justify-center w-full">
                {c.logo ? (
                  <Image
                    src={c.logo}
                    alt={c.nome}
                    width={120}
                    height={60}
                    className="object-contain max-h-16"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xl font-bold">
                    {c.nome.charAt(0)}
                  </div>
                )}
              </div>

              {/* Nome */}
              <h3 className="font-semibold text-text-main text-lg mt-3 mb-3 line-clamp-1">
                {c.nome}
              </h3>

              {/* Azioni — fisse in fondo */}
              <div className="flex items-center gap-3 text-sm">
                {hasDetail && (
                  <button
                    type="button"
                    onClick={() => setOpenId(c.id)}
                    className="inline-flex items-center gap-1 text-primary font-medium hover:underline"
                  >
                    <Info size={14} /> Scopri
                  </button>
                )}
                {c.url && (
                  <>
                    {hasDetail && <span className="w-px h-4 bg-gray-200" />}
                    <a
                      href={c.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-primary font-medium hover:underline"
                    >
                      Sito <ExternalLink size={12} />
                    </a>
                  </>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Modal */}
      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center px-4"
          aria-modal="true"
          role="dialog"
        >
          {/* Backdrop */}
          <button
            type="button"
            aria-label="Chiudi"
            onClick={close}
            className={`absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity duration-300 ${
              mounted ? 'opacity-100' : 'opacity-0'
            }`}
          />

          {/* Card */}
          <div
            className={`relative bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[85vh] overflow-hidden border border-primary/10 transition-all duration-300 ease-out ${
              mounted
                ? 'opacity-100 scale-100 translate-y-0'
                : 'opacity-0 scale-95 translate-y-2'
            }`}
            style={{ willChange: 'transform, opacity' }}
          >
            {/* Top accent */}
            <div className="h-1 w-full bg-gradient-to-r from-primary via-secondary to-primary" />

            {/* Close */}
            <button
              type="button"
              onClick={close}
              aria-label="Chiudi"
              className="absolute top-4 right-4 w-9 h-9 rounded-full bg-bg-soft hover:bg-primary/10 text-text-main/60 hover:text-primary flex items-center justify-center transition-colors z-10"
            >
              <X size={18} />
            </button>

            {/* Body scrollable */}
            <div className="p-8 md:p-10 overflow-y-auto max-h-[calc(85vh-1rem)]">
              {/* Logo + nome */}
              <div className="flex flex-col items-center text-center mb-6">
                {open.logo ? (
                  <Image
                    src={open.logo}
                    alt={open.nome}
                    width={140}
                    height={70}
                    className="object-contain max-h-20 mb-4"
                  />
                ) : (
                  <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center text-primary text-2xl font-black mb-4">
                    {open.nome.charAt(0)}
                  </div>
                )}
                <h3 className="text-2xl md:text-3xl font-extrabold text-text-main">
                  {open.nome}
                </h3>
              </div>

              {/* Descrizione */}
              {open.descrizione && (
                <p className="text-text-main/75 leading-relaxed text-base whitespace-pre-line">
                  {open.descrizione}
                </p>
              )}

              {/* CTA sito */}
              {open.url && (
                <div className="mt-8 pt-6 border-t border-bg-soft text-center">
                  <a
                    href={open.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-primary inline-flex items-center gap-2"
                  >
                    Visita il sito ufficiale <ExternalLink size={14} />
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
