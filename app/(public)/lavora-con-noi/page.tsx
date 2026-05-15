import Link from 'next/link'
import { generatePageMetadata } from '@/lib/seo'
import { Mail } from 'lucide-react'
import { PageHero } from '@/components/layout/PageHero'
import { getHeroConfig } from '@/lib/firebase/hero'
import { getSiteConfig } from '@/lib/firebase/siteConfig'

export const revalidate = 3600
export const metadata = generatePageMetadata({
  title: 'Lavora con Noi',
  description: 'Opportunità di lavoro al Centro Medico San Fedele. Entra a far parte del nostro team.',
  slug: 'lavora-con-noi',
})

export default async function LavoraConNoiPage() {
  const [hero, site] = await Promise.all([getHeroConfig('lavora-con-noi'), getSiteConfig()])
  const mailHref = `mailto:${site.email}?subject=${encodeURIComponent('Candidatura spontanea')}`
  return (
    <>
      <PageHero config={hero} />

      <div className="section">
        <div className="container-main">
          <div className="max-w-2xl mx-auto">
            <div className="bg-white rounded-lg p-6 shadow-card border border-gray-100 text-center">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
                <Mail size={32} className="text-primary" />
              </div>
              <h2 className="heading-3 mb-4">Candidatura spontanea</h2>
              <p className="text-gray-600 leading-relaxed mb-6">
                Se sei un medico specialista, un fisioterapista, un infermiere o un professionista
                sanitario e desideri entrare a far parte del nostro team, inviaci il tuo curriculum
                vitae all'indirizzo email seguente:
              </p>
              <a
                href={mailHref}
                className="btn-primary inline-flex items-center gap-2"
              >
                <Mail size={18} />
                {site.email}
              </a>
              <p className="text-gray-400 text-sm mt-6">
                Valuteremo la tua candidatura e ti contatteremo per un eventuale colloquio.
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
