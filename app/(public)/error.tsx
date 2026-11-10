'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { RotateCcw, Home } from 'lucide-react'

/**
 * Errore imprevisto in una pagina pubblica: header e footer restano, al posto
 * del contenuto un messaggio con la possibilità di riprovare. Senza questo file
 * un errore qualunque mostrava "Application error" su schermo bianco.
 */
export default function Errore({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error('[sito] errore nella pagina:', error.digest ?? error.message)
  }, [error])

  return (
    <section className="section" role="alert">
      <div className="container-main max-w-2xl text-center">
        <h1 className="heading-2 mb-4">Qualcosa non ha funzionato</h1>
        <p className="mb-8 text-lg text-gray-600">
          Si è verificato un problema nel caricare questa pagina. Riprova tra qualche istante; se
          il problema continua, contattaci per telefono.
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          <button type="button" onClick={reset} className="btn-primary inline-flex items-center gap-2">
            <RotateCcw size={18} aria-hidden /> Riprova
          </button>
          <Link href="/" className="btn-secondary inline-flex items-center gap-2">
            <Home size={18} aria-hidden /> Torna alla home
          </Link>
        </div>
      </div>
    </section>
  )
}
