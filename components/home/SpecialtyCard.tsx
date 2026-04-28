import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import type { Specialistica } from '@/types'
import { specialisticaHref } from '@/lib/utils'

export function SpecialtyCard({ spec }: { spec: Specialistica }) {
  return (
    <Link
      href={specialisticaHref(spec.slug)}
      className="group relative block bg-white rounded-lg p-6 shadow-card hover:shadow-card-hover transition-all duration-300 hover:-translate-y-1 border border-gray-100 overflow-hidden"
    >
      {/* Decorative accent bar */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary to-secondary opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

      <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center text-3xl mb-4 group-hover:bg-primary/15 transition-colors">
        {spec.icona}
      </div>
      <h3 className="font-semibold text-text-main text-lg mb-2">{spec.nome}</h3>
      <p className="text-gray-500 text-sm leading-relaxed mb-4">{spec.descrizioneBreve}</p>
      <span className="inline-flex items-center gap-1 text-primary text-sm font-medium group-hover:gap-2 transition-all">
        Scopri di più <ArrowRight size={16} />
      </span>
    </Link>
  )
}
