import { Phone, Calendar, ArrowRight } from 'lucide-react'
import type { HeroCTA } from '@/types'

function WhatsAppIcon({ size = 18, className = '' }: { size?: number; className?: string }) {
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

/** Icona scelta in admin per un bottone della hero (vale per tutte le varianti di hero). */
export function CtaIcon({ kind, size = 18 }: { kind?: HeroCTA['icona']; size?: number }) {
  if (kind === 'phone') return <Phone size={size} aria-hidden="true" />
  if (kind === 'whatsapp') return <WhatsAppIcon size={size} />
  if (kind === 'calendar') return <Calendar size={size} aria-hidden="true" />
  if (kind === 'arrow') return <ArrowRight size={size} aria-hidden="true" />
  return null
}
