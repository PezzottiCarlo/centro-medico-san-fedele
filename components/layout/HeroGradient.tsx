import type { HeroConfig } from '@/types'

interface HeroGradientProps {
  config: HeroConfig
}

export function HeroGradient({ config }: HeroGradientProps) {
  return (
    <section className="bg-gradient-to-br from-primary/10 via-bg to-secondary/10 py-14 sm:py-16 md:py-20">
      <div className="container-main text-center">
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-light tracking-tight mb-3 sm:mb-4">
          {config.titolo}
          {config.titoloEvidenziato && (
            <>
              {' '}
              <span className="font-semibold text-primary">{config.titoloEvidenziato}</span>
            </>
          )}
        </h1>
        {config.sottotitolo && (
          <p className="text-gray-500 text-base sm:text-lg md:text-xl max-w-2xl mx-auto">
            {config.sottotitolo}
          </p>
        )}
      </div>
    </section>
  )
}
