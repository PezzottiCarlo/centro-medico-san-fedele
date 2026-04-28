import Image from 'next/image'

interface PageHeroProps {
  title: string
  subtitle?: string
  label?: string
  imageSrc?: string
  imageScale?: number // zoom dell'immagine bg (1 = nessuno zoom, 1.15 = +15%)
}

export function PageHero({ title, subtitle, label, imageSrc, imageScale = 1 }: PageHeroProps) {
  return (
    <section className="relative w-full min-h-[320px] md:min-h-[380px] flex items-center overflow-hidden">
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
            <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/55 to-black/40" />
          </>
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary-dark to-[#145a85]" />
        )}
      </div>

      {/* Content */}
      <div className="container-main text-center w-full py-16">
        {label && (
          <p className="text-white/70 font-medium tracking-wide uppercase text-sm mb-3">
            {label}
          </p>
        )}
        <h1 className="heading-1 !text-white mb-4 drop-shadow-md">{title}</h1>
        {subtitle && (
          <p className="text-lg md:text-xl text-white/80 max-w-2xl mx-auto leading-relaxed drop-shadow">
            {subtitle}
          </p>
        )}
      </div>
    </section>
  )
}
