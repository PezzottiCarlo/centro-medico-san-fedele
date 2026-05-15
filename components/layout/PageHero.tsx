import Image from 'next/image'
import type { HeroConfig } from '@/types'

interface PageHeroProps {
  config?: HeroConfig
  /** Override per casi legacy o pagine [slug] dinamiche */
  title?: string
  subtitle?: string
  imageSrc?: string
  imageScale?: number
}

export function PageHero({ config, title, subtitle, imageSrc, imageScale }: PageHeroProps) {
  const finalTitle = title ?? config?.titolo ?? ''
  const finalSubtitle = subtitle ?? config?.sottotitolo
  const finalImage = imageSrc ?? config?.immagine
  const finalScale = imageScale ?? config?.imageScale ?? 1

  return (
    <section className="relative w-full min-h-[320px] sm:min-h-[400px] md:min-h-[480px] flex items-end overflow-hidden">
      <div className="absolute inset-0 -z-10">
        {finalImage ? (
          <>
            <Image
              src={finalImage}
              alt=""
              fill
              priority
              sizes="100vw"
              className="object-cover"
              style={
                finalScale !== 1
                  ? { transform: `scale(${finalScale})`, transformOrigin: 'center' }
                  : undefined
              }
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/10" />
          </>
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary-dark to-[#145a85]" />
        )}
      </div>

      <div className="container-main w-full pb-8 sm:pb-10 md:pb-14">
        <span className="block h-1 w-10 rounded-full bg-white/80 mb-3 sm:mb-4 drop-shadow" />
        <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-light tracking-tight text-white drop-shadow-md">
          {finalTitle}
        </h1>
        {finalSubtitle && (
          <p className="mt-3 sm:mt-4 max-w-2xl text-sm sm:text-base md:text-lg text-white/90 drop-shadow">
            {finalSubtitle}
          </p>
        )}
      </div>
    </section>
  )
}
