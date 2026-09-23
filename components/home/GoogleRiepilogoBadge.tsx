import { Star, ExternalLink, PenLine } from 'lucide-react'
import type { GoogleRiepilogo } from '@/lib/reviews'

function LogoGoogle({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" />
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
    </svg>
  )
}

/** Voto del centro su Google, con i link per leggere tutte le recensioni o lasciarne una. */
export function GoogleRiepilogoBadge({ riepilogo }: { riepilogo: GoogleRiepilogo }) {
  const voto = riepilogo.voto.toLocaleString('it-IT', { minimumFractionDigits: 1, maximumFractionDigits: 1 })
  return (
    <div className="mx-auto mb-10 flex max-w-3xl flex-col items-center gap-4 rounded-2xl border border-gray-100 bg-white px-6 py-5 shadow-card sm:flex-row sm:justify-between">
      <div className="flex items-center gap-4">
        <LogoGoogle className="h-10 w-10 flex-shrink-0" />
        <div>
          <div className="flex items-center gap-2">
            <span className="text-3xl font-black text-text-main leading-none">{voto}</span>
            <span className="flex gap-0.5" aria-label={`${voto} stelle su 5`}>
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  size={18}
                  aria-hidden
                  className={i < Math.round(riepilogo.voto) ? 'fill-yellow-400 text-yellow-400' : 'fill-gray-200 text-gray-200'}
                />
              ))}
            </span>
          </div>
          <p className="mt-1 text-sm text-text-main/60">
            su {riepilogo.totale} recensioni Google
          </p>
        </div>
      </div>
      <div className="flex flex-wrap justify-center gap-2">
        <a
          href={riepilogo.url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 rounded-full border border-gray-200 px-4 py-2 text-sm font-semibold text-text-main transition-colors hover:border-primary hover:text-primary"
        >
          Leggi tutte <ExternalLink size={14} aria-hidden />
        </a>
        <a
          href={riepilogo.scriviUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-primary-dark"
        >
          <PenLine size={14} aria-hidden /> Lascia una recensione
        </a>
      </div>
    </div>
  )
}
