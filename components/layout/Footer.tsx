import Link from 'next/link'
import Image from 'next/image'
import { Phone, Mail, MapPin, Clock, Instagram, Facebook, Linkedin } from 'lucide-react'
import { getSiteConfig } from '@/lib/firebase/siteConfig'
import { ANNO_FONDAZIONE } from '@/lib/siteConfig'

// Accetta solo indirizzi web veri: un campo lasciato a metà o un `javascript:`
// non diventano un link nel footer.
function linkSocial(url?: string): string | null {
  const pulito = url?.trim()
  return pulito && /^https:\/\/[^\s]+$/i.test(pulito) ? pulito : null
}

export async function Footer() {
  const site = await getSiteConfig()
  const telHref = `tel:${site.telefonoE164.replace(/[^\d+]/g, '')}`
  const mailHref = `mailto:${site.email}`
  const social = [
    { href: linkSocial(site.instagramUrl), label: 'Instagram', Icona: Instagram },
    { href: linkSocial(site.facebookUrl), label: 'Facebook', Icona: Facebook },
    { href: linkSocial(site.linkedinUrl), label: 'LinkedIn', Icona: Linkedin },
  ].flatMap(({ href, ...resto }) => (href ? [{ href, ...resto }] : []))

  return (
    <footer className="bg-gradient-to-br from-gray-900 to-gray-800 text-white">
      <div className="container-main pt-10 sm:pt-12 pb-8">
        <div className="flex flex-col md:flex-row items-center md:items-start justify-between gap-6 mb-8 sm:mb-10">
          <div className="flex items-center gap-4">
            <Image
              src="/logo-san-fedele.png"
              alt="Centro Medico San Fedele"
              width={48}
              height={48}
              className="rounded-full object-cover"
            />
            <div>
              <div className="font-semibold text-lg leading-tight">Centro Medico</div>
              <div className="text-sm text-gray-400 leading-tight">San Fedele</div>
            </div>
          </div>
          <p className="text-gray-400 text-sm leading-relaxed max-w-md text-center md:text-left">
            Centro medico d&apos;eccellenza a {site.citta}. Cura, competenza e attenzione alla persona dal {ANNO_FONDAZIONE}.
          </p>
          {social.length > 0 && (
            <div className="flex items-center gap-3">
              {social.map(({ href, label, Icona }) => (
                <a key={label} href={href} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full glass-dark flex items-center justify-center hover:bg-primary/20 transition-colors" aria-label={label}>
                  <Icona size={18} />
                </a>
              ))}
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 sm:gap-8 border-t border-white/10 pt-8">
          <div>
            <h4 className="font-semibold mb-4 text-sm uppercase tracking-wider text-gray-300">Servizi</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><Link href="/ambulatori" className="hover:text-white transition-colors">Specialistiche</Link></li>
              <li><Link href="/medici" className="hover:text-white transition-colors">I Nostri Medici</Link></li>
              <li><Link href="/dsa" className="hover:text-white transition-colors">Area DSA</Link></li>
              <li><Link href="/sport" className="hover:text-white transition-colors">Medicina Sportiva</Link></li>
              <li><Link href="/news" className="hover:text-white transition-colors">News &amp; Articoli</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4 text-sm uppercase tracking-wider text-gray-300">Informazioni</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><Link href="/convenzioni" className="hover:text-white transition-colors">Convenzioni</Link></li>
              <li><Link href="/lavora-con-noi" className="hover:text-white transition-colors">Lavora con Noi</Link></li>
              <li><Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link></li>
              <li><Link href="/cookie-policy" className="hover:text-white transition-colors">Cookie Policy</Link></li>
              <li><Link href="/contatti" className="hover:text-white transition-colors">Contatti</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4 text-sm uppercase tracking-wider text-gray-300">Contatti</h4>
            <ul className="space-y-3 text-sm text-gray-400">
              <li className="flex items-start gap-2">
                <MapPin size={16} className="mt-0.5 flex-shrink-0 text-primary" />
                <span>
                  {site.indirizzo}
                  <br />
                  {site.cap} {site.citta} ({site.provincia})
                </span>
              </li>
              <li className="flex items-center gap-2">
                <Phone size={16} className="flex-shrink-0 text-primary" />
                <a href={telHref} className="hover:text-white transition-colors font-medium">
                  {site.telefono}
                </a>
              </li>
              <li className="flex items-center gap-2">
                <Mail size={16} className="flex-shrink-0 text-primary" />
                <a href={mailHref} className="hover:text-white transition-colors">
                  {site.email}
                </a>
              </li>
              <li className="flex items-start gap-2">
                <Clock size={16} className="flex-shrink-0 text-primary mt-0.5" />
                <div>
                  {site.orari.map((o, i) => (
                    <p key={i}>
                      {o.giorno}: {o.ore}
                    </p>
                  ))}
                </div>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="container-main py-6 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-gray-500">
          <p>&copy; {new Date().getFullYear()} Centro Medico San Fedele. Tutti i diritti riservati.</p>
          {social.length > 0 && (
            <div className="flex items-center gap-4">
              {social.map(({ href, label, Icona }) => (
                <a key={label} href={href} target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors" aria-label={label}><Icona size={16} /></a>
              ))}
            </div>
          )}
        </div>
      </div>
    </footer>
  )
}
