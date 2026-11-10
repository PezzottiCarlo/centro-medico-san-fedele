import type { Metadata } from 'next'
import { PaginaNonTrovata } from '@/components/errori/PaginaNonTrovata'

export const metadata: Metadata = {
  title: 'Pagina non trovata',
  robots: { index: false, follow: true },
}

// Per i notFound() delle pagine pubbliche (medico, news, patologia inesistenti)
export default function NotFound() {
  return <PaginaNonTrovata />
}
