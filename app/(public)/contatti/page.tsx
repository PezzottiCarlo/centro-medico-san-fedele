import { generatePageMetadata, localitaCentro } from '@/lib/seo'
import { MapPin, Phone, Mail, Clock, Car, Train } from 'lucide-react'
import { ContactForm } from '@/components/home/ContactForm'
import { PageHero } from '@/components/layout/PageHero'
import { getHeroConfig } from '@/lib/firebase/hero'
import { getSiteConfig } from '@/lib/firebase/siteConfig'

export const revalidate = 60
export async function generateMetadata() {
  const site = await getSiteConfig()
  return generatePageMetadata({
    title: 'Contatti — Dove siamo',
    description:
      `Contatta il Centro Medico San Fedele. Indirizzo, telefono, email, orari e come raggiungerci a ${localitaCentro(site)}.`,
    slug: 'contatti',
  })
}

export default async function ContattiPage() {
  const [hero, site] = await Promise.all([getHeroConfig('contatti'), getSiteConfig()])
  const telHref = `tel:${site.telefonoE164}`
  const mailHref = `mailto:${site.email}`
  const mapsEmbed = `https://www.google.com/maps?q=${encodeURIComponent(
    `${site.indirizzo}, ${site.cap} ${site.citta}`
  )}&output=embed`

  return (
    <>
      <PageHero config={hero} />

      <div className="section">
        <div className="container-main space-y-12 sm:space-y-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-stretch">
            <div className="bg-white rounded-lg shadow-card border border-gray-100 overflow-hidden min-h-[320px] sm:min-h-[400px]">
              <iframe
                src={mapsEmbed}
                width="100%"
                height="100%"
                style={{ border: 0, display: 'block', minHeight: '320px' }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Mappa Centro Medico San Fedele"
              />
            </div>

            <div className="space-y-4 sm:space-y-6">
              <InfoCard icon={<MapPin size={20} className="text-primary" />} title="Indirizzo">
                <p className="text-gray-600">{site.indirizzo}</p>
                <p className="text-gray-600">
                  {site.cap} {site.citta} ({site.provincia})
                </p>
                {site.mapsUrl && (
                  <a
                    href={site.mapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary text-sm hover:underline mt-2 inline-block"
                  >
                    Apri in Google Maps →
                  </a>
                )}
              </InfoCard>

              <InfoCard icon={<Phone size={20} className="text-primary" />} title="Telefono">
                <a href={telHref} className="text-primary font-medium hover:underline">
                  {site.telefono}
                </a>
              </InfoCard>

              <InfoCard icon={<Mail size={20} className="text-primary" />} title="Email">
                <a href={mailHref} className="text-primary font-medium hover:underline break-all">
                  {site.email}
                </a>
              </InfoCard>

              <InfoCard icon={<Clock size={20} className="text-primary" />} title="Orari">
                <div className="space-y-1 text-sm text-gray-600">
                  {site.orari.map((o, i) => (
                    <div key={i} className="flex flex-wrap justify-between gap-4">
                      <span>{o.giorno}</span>
                      <span className="font-medium text-text-main">{o.ore}</span>
                    </div>
                  ))}
                </div>
              </InfoCard>
            </div>
          </div>

          <div>
            <h2 className="heading-2 text-center mb-6 sm:mb-8">Come raggiungerci</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
              <InfoCard
                icon={<Car size={20} className="text-secondary" />}
                title="In auto"
                color="secondary"
              >
                <p className="text-gray-600 text-sm leading-relaxed">
                  Da Como: seguire la SP41 in direzione Erba/Lecco, uscita Longone al Segrino. Da
                  Milano: autostrada A9 direzione Como, poi SP41 verso Erba. Parcheggio gratuito
                  disponibile presso la struttura.
                </p>
              </InfoCard>
              <InfoCard
                icon={<Train size={20} className="text-secondary" />}
                title="Con i mezzi pubblici"
                color="secondary"
              >
                <p className="text-gray-600 text-sm leading-relaxed">
                  Stazione ferroviaria di Erba (linea Milano-Asso), poi autobus C47 direzione
                  Longone al Segrino. Il centro medico si trova a pochi minuti a piedi dalla
                  fermata.
                </p>
              </InfoCard>
            </div>
          </div>

          <div>
            <h2 className="heading-2 mb-2">Scrivici</h2>
            <p className="text-gray-500 mb-6 sm:mb-8">
              Per qualsiasi informazione — orari, servizi, convenzioni o altro — compila il modulo
              e ti risponderemo nel più breve tempo possibile.
            </p>
            <div className="bg-white rounded-lg p-5 sm:p-6 shadow-card border border-gray-100">
              <ContactForm />
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

function InfoCard({
  icon,
  title,
  color = 'primary',
  children,
}: {
  icon: React.ReactNode
  title: string
  color?: 'primary' | 'secondary'
  children: React.ReactNode
}) {
  const bg = color === 'secondary' ? 'bg-secondary/10' : 'bg-primary/10'
  return (
    <div className="bg-white rounded-lg p-5 sm:p-6 shadow-card border border-gray-100">
      <div className="flex items-start gap-4">
        <div className={`w-10 h-10 rounded-full ${bg} flex items-center justify-center flex-shrink-0`}>
          {icon}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-text-main mb-1">{title}</h3>
          {children}
        </div>
      </div>
    </div>
  )
}
