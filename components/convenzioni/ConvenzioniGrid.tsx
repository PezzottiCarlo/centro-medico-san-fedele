'use client'

import { useState } from 'react'
import Image from 'next/image'
import { ExternalLink, Info } from 'lucide-react'
import { Modale } from '@/components/ui/Modale'
import type { Convenzione } from '@/types'
import { linkSicuro } from '@/lib/link'

interface Props {
  convenzioni: Convenzione[]
}

export function ConvenzioniGrid({ convenzioni }: Props) {
  const [openId, setOpenId] = useState<string | null>(null)
  const open = convenzioni.find((c) => c.id === openId)

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
                    sizes="120px"
                    className="object-contain max-h-16"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xl font-bold">
                    {c.nome.charAt(0)}
                  </div>
                )}
              </div>

              {/* Nome */}
              <h3 className="font-semibold text-text-main text-lg mt-3 mb-1 line-clamp-1">
                {c.nome}
              </h3>

              {/* Sconto / beneficio */}
              {c.sottotitolo && (
                <span className="inline-block bg-primary/10 text-primary text-xs font-bold px-2.5 py-1 rounded-full mb-2 line-clamp-1">
                  {c.sottotitolo}
                </span>
              )}

              {/* Azioni — fisse in fondo */}
              <div className="flex items-center gap-3 text-sm">
                {hasDetail && (
                  <button
                    type="button"
                    onClick={() => setOpenId(c.id)}
                    className="inline-flex items-center gap-1 text-primary font-medium hover:underline"
                  >
                    <Info size={14} aria-hidden /> Scopri
                    <span className="sr-only"> la convenzione {c.nome}</span>
                  </button>
                )}
                {linkSicuro(c.url) && (
                  <>
                    {hasDetail && <span className="w-px h-4 bg-gray-200" />}
                    <a
                      href={linkSicuro(c.url) ?? undefined}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-primary font-medium hover:underline"
                    >
                      Sito <ExternalLink size={12} aria-hidden />
                      <span className="sr-only"> di {c.nome} (si apre in una nuova scheda)</span>
                    </a>
                  </>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {open && (
        <Modale
          titolo={open.nome}
          onChiudi={() => setOpenId(null)}
          fascia="bg-gradient-to-r from-primary via-secondary to-primary"
        >
          <div className="p-8 md:p-10">
            <div className="flex flex-col items-center text-center mb-6">
              {open.logo ? (
                <Image
                  src={open.logo}
                  alt=""
                  width={140}
                  height={70}
                  sizes="140px"
                  className="object-contain max-h-20 mb-4"
                />
              ) : (
                <div aria-hidden className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center text-primary text-2xl font-black mb-4">
                  {open.nome.charAt(0)}
                </div>
              )}
              <h3 className="text-2xl md:text-3xl font-extrabold text-text-main">{open.nome}</h3>
              {open.sottotitolo && (
                <span className="inline-block bg-primary/10 text-primary-dark text-sm font-bold px-3 py-1 rounded-full mt-3">
                  {open.sottotitolo}
                </span>
              )}
            </div>

            {open.descrizione && (
              <p className="text-text-main/80 leading-relaxed text-base whitespace-pre-line">
                {open.descrizione}
              </p>
            )}

            {linkSicuro(open.url) && (
              <div className="mt-8 pt-6 border-t border-bg-soft text-center">
                <a
                  href={linkSicuro(open.url) ?? undefined}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-primary inline-flex items-center gap-2"
                >
                  Visita il sito ufficiale <ExternalLink size={14} aria-hidden />
                  <span className="sr-only">(si apre in una nuova scheda)</span>
                </a>
              </div>
            )}
          </div>
        </Modale>
      )}
    </>
  )
}
