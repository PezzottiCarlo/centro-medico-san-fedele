import type { Metadata } from 'next'
import PublicLayout from './(public)/layout'
import { PaginaNonTrovata } from '@/components/errori/PaginaNonTrovata'

export const metadata: Metadata = {
  title: 'Pagina non trovata',
  robots: { index: false, follow: true },
}

/**
 * Indirizzi che non corrispondono a nessuna pagina: stessa 404 in italiano,
 * dentro il layout del sito (header, footer, chatbot) invece della pagina
 * bianca in inglese di Next.
 */
export default function NotFound() {
  return (
    <PublicLayout>
      <PaginaNonTrovata />
    </PublicLayout>
  )
}
