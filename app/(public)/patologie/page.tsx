import { generatePageMetadata } from '@/lib/seo'
import Image from 'next/image'
import { ArrowRight } from 'lucide-react'
import { HeroGradient } from '@/components/layout/HeroGradient'
import { getHeroConfig } from '@/lib/firebase/hero'
import { caricaSchedePatologie, type SchedaPatologia } from '@/lib/patologie'
import { ApriPatologia } from '@/components/patologie/ApriPatologia'

export const revalidate = 60
export const metadata = generatePageMetadata({
  title: 'Patologie',
  description: 'Informazioni sulle patologie trattate al Centro Medico San Fedele.',
  slug: 'patologie',
})

async function getData(): Promise<SchedaPatologia[]> {
  try {
    return await caricaSchedePatologie()
  } catch (error) {
    console.error('[Patologie] Lettura non riuscita:', error)
    return []
  }
}

/**
 * Elenco delle patologie. Ogni patologia si apre in una finestra: le pagine
 * singole /patologie/<slug> non esistono più (reindirizzate qui).
 */
export default async function PatologiePage() {
  const [schede, hero] = await Promise.all([getData(), getHeroConfig('patologie')])

  return (
    <>
      <HeroGradient config={hero} />

      <div className="section">
        <div className="container-main">
          {schede.length === 0 ? (
            <p className="text-center text-gray-500">Nessuna patologia disponibile al momento.</p>
          ) : (
            <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {schede.map((s) => (
                <li key={s.id}>
                  <article className="group relative h-full glass-card hover:shadow-card-hover transition-all hover:-translate-y-1 has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-primary has-[:focus-visible]:ring-offset-2">
                    {s.immagine ? (
                      <div className="relative w-full h-40 rounded-lg overflow-hidden mb-4 -mt-1 bg-bg-soft">
                        <Image src={s.immagine} alt="" fill className="object-contain p-2" sizes="(max-width: 768px) 100vw, 33vw" />
                      </div>
                    ) : s.specialistica?.icona ? (
                      <div aria-hidden className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-2xl mb-4">
                        {s.specialistica.icona}
                      </div>
                    ) : null}
                    {s.specialistica && (
                      <p className="inline-block text-xs font-medium text-primary-dark bg-primary/10 px-3 py-1 rounded-full">
                        {s.specialistica.icona && <span aria-hidden>{s.specialistica.icona} </span>}
                        {s.specialistica.nome}
                      </p>
                    )}
                    <h2 className="font-semibold text-text-main text-lg mt-3 mb-2">
                      <ApriPatologia
                        scheda={s}
                        className="text-left group-hover:text-primary transition-colors focus:outline-none after:absolute after:inset-0 after:content-['']"
                      >
                        {s.nome}
                      </ApriPatologia>
                    </h2>
                    {s.anteprima && (
                      <p className="text-gray-600 text-sm leading-relaxed line-clamp-3">{s.anteprima}</p>
                    )}
                    <span aria-hidden className="inline-flex items-center gap-1 text-primary-dark text-sm font-medium mt-4 group-hover:gap-2 transition-all">
                      Scopri di più <ArrowRight size={14} />
                    </span>
                  </article>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </>
  )
}
