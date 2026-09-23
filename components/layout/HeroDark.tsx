import Link from 'next/link'
import { CtaIcon } from '@/components/ui/CtaIcon'
import type { HeroConfig, HeroCTA } from '@/types'

interface HeroDarkProps {
  config: HeroConfig
  badge?: string
}

function isExternal(href: string) {
  return href.startsWith('http') || href.startsWith('mailto:') || href.startsWith('tel:')
}

function CTAButton({ cta, variant }: { cta: HeroCTA; variant: 'primary' | 'secondary' }) {
  const base =
    'inline-flex items-center gap-2 px-6 sm:px-8 py-3 sm:py-4 rounded-lg transition-all text-base sm:text-lg min-h-[48px]'
  const styles =
    variant === 'primary'
      ? 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold hover:shadow-lg hover:shadow-emerald-500/25'
      : 'border border-slate-700 hover:border-slate-500 text-slate-300 hover:text-white'

  // La freccia segue il testo, le altre icone (WhatsApp, telefono, calendario) lo precedono
  const content = (
    <>
      {cta.icona !== 'arrow' && <CtaIcon kind={cta.icona} size={20} />}
      {cta.testo}
      {cta.icona === 'arrow' && <CtaIcon kind="arrow" size={20} />}
    </>
  )

  if (isExternal(cta.href) || cta.href.startsWith('#')) {
    return (
      <a
        href={cta.href}
        target={cta.href.startsWith('http') ? '_blank' : undefined}
        rel={cta.href.startsWith('http') ? 'noopener noreferrer' : undefined}
        className={`${base} ${styles}`}
      >
        {content}
      </a>
    )
  }
  return (
    <Link href={cta.href} className={`${base} ${styles}`}>
      {content}
    </Link>
  )
}

export function HeroDark({ config, badge = 'Centro Medico San Fedele' }: HeroDarkProps) {
  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-slate-900 to-emerald-950" />
      <div
        className="absolute inset-0 opacity-[0.07]"
        style={{
          backgroundImage:
            'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%2310b981\' fill-opacity=\'1\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
        }}
      />

      <div className="relative container-main py-16 sm:py-20 md:py-32">
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 rounded-full px-4 py-1.5 mb-5 sm:mb-6">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-emerald-400 text-xs sm:text-sm font-semibold tracking-wider uppercase">
              {badge}
            </span>
          </div>
          <h1 className="text-4xl sm:text-5xl md:text-7xl font-black tracking-tight mb-5 sm:mb-6 text-white leading-[1.05]">
            {config.titolo}
            {config.titoloEvidenziato && (
              <>
                <br />
                <span className="bg-gradient-to-r from-emerald-400 via-green-400 to-teal-400 bg-clip-text text-transparent">
                  {config.titoloEvidenziato}
                </span>
              </>
            )}
          </h1>
          {config.sottotitolo && (
            <p className="text-base sm:text-lg md:text-xl text-slate-400 max-w-2xl leading-relaxed mb-7 sm:mb-8">
              {config.sottotitolo}
            </p>
          )}
          {(config.ctaPrimaria || config.ctaSecondaria) && (
            <div className="flex flex-col sm:flex-row flex-wrap gap-3 sm:gap-4">
              {config.ctaPrimaria && <CTAButton cta={config.ctaPrimaria} variant="primary" />}
              {config.ctaSecondaria && (
                <CTAButton cta={config.ctaSecondaria} variant="secondary" />
              )}
            </div>
          )}
        </div>
      </div>

      <div className="hidden md:block absolute -right-32 top-1/2 -translate-y-1/2 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl" />
      <div className="hidden md:block absolute -left-16 -bottom-16 w-64 h-64 bg-teal-500/5 rounded-full blur-3xl" />
    </section>
  )
}
