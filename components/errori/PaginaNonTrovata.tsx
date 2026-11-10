import Link from 'next/link'
import Image from 'next/image'
import { Home, Search, Phone } from 'lucide-react'

/** Contenuto della pagina 404, usato sia dentro sia fuori dal layout pubblico. */
export function PaginaNonTrovata() {
  return (
    <section className="section">
      <div className="container-main flex max-w-3xl flex-col items-center text-center">
        <Image
          src="/mela-idea.png"
          alt=""
          width={454}
          height={550}
          sizes="120px"
          className="mb-6 h-auto w-28"
          priority
        />
        <p className="mb-2 text-sm font-bold uppercase tracking-widest text-primary">Errore 404</p>
        <h1 className="heading-1 mb-4">Pagina non trovata</h1>
        <p className="mb-8 max-w-xl text-lg text-gray-600">
          La pagina che cerchi non esiste o è stata spostata. Puoi tornare alla home, cercare tra
          i nostri servizi oppure contattarci: ti aiutiamo noi.
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          <Link href="/" className="btn-primary inline-flex items-center gap-2">
            <Home size={18} aria-hidden /> Torna alla home
          </Link>
          <Link href="/ambulatori" className="btn-secondary inline-flex items-center gap-2">
            <Search size={18} aria-hidden /> Specialistiche e servizi
          </Link>
          <Link href="/contatti" className="btn-ghost inline-flex items-center gap-2">
            <Phone size={18} aria-hidden /> Contatti
          </Link>
        </div>
      </div>
    </section>
  )
}
