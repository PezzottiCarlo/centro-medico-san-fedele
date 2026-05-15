import Image from 'next/image'

interface PageHeroProps {
  title: string
  /** @deprecated non più mostrato — l'hero lascia spazio all'immagine */
  subtitle?: string
  /** @deprecated non più mostrato — l'hero lascia spazio all'immagine */
  label?: string
  imageSrc?: string
  imageScale?: number // zoom dell'immagine bg (1 = nessuno zoom, 1.15 = +15%)
}

export function PageHero({ title, imageSrc, imageScale = 1 }: PageHeroProps) {
  return (
    <section className="relative w-full min-h-[360px] md:min-h-[480px] flex items-end overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 -z-10">
        {imageSrc ? (
          <>
            <Image
              src={imageSrc}
              alt=""
              fill
              priority
              className="object-cover"
              style={imageScale !== 1 ? { transform: `scale(${imageScale})`, transformOrigin: 'center' } : undefined}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
          </>
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary-dark to-[#145a85]" />
        )}
      </div>

      {/* Content — titolo allineato in basso, lascia respiro all'immagine */}
      <div className="container-main w-full pb-10 md:pb-14">
        <span className="block h-1 w-10 rounded-full bg-white/80 mb-4 drop-shadow" />
        <h1 className="heading-1 !text-white drop-shadow-md">{title}</h1>
      </div>
    </section>
  )
}
