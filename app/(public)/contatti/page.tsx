import { generatePageMetadata } from '@/lib/seo'
import { MapPin, Phone, Mail, Clock, Car, Train } from 'lucide-react'
import { ContactForm } from '@/components/home/ContactForm'
import { PageHero } from '@/components/layout/PageHero'

export const metadata = generatePageMetadata({
  title: 'Contatti — Dove siamo',
  description: 'Contatta il Centro Medico San Fedele. Indirizzo, telefono, email, orari e come raggiungerci a Longone al Segrino (CO).',
  slug: 'contatti',
})

export default function ContattiPage() {
  return (
    <>
      <PageHero
        title="Scrivici, chiamaci o vieni a trovarci"
        label="Contatti & Dove siamo"
        subtitle="Siamo a tua disposizione per qualsiasi informazione o richiesta. Nel cuore della Provincia di Como."
        imageSrc="/contatti.jpg"
      />

      <div className="section">
        <div className="container-main space-y-16">

          {/* Mappa + Info */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-stretch">
            {/* Mappa */}
            <div className="bg-white rounded-lg shadow-card border border-gray-100 overflow-hidden min-h-[400px]">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2782.5!2d9.2433!3d45.8167!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2sVia+Risorgimento+1%2C+22030+Longone+al+Segrino+CO!5e0!3m2!1sit!2sit!4v1"
                width="100%"
                height="100%"
                style={{ border: 0, display: 'block', minHeight: '400px' }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Mappa Centro Medico San Fedele"
              />
            </div>

            {/* Info */}
            <div className="space-y-6">
              <div className="bg-white rounded-lg p-6 shadow-card border border-gray-100">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <MapPin size={20} className="text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-text-main mb-1">Indirizzo</h3>
                    <p className="text-gray-600">Via Risorgimento, 1</p>
                    <p className="text-gray-600">22030 Longone al Segrino (CO)</p>
                    <a
                      href="https://maps.google.com/?q=Via+Risorgimento+1+Longone+al+Segrino"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary text-sm hover:underline mt-2 inline-block"
                    >
                      Apri in Google Maps →
                    </a>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg p-6 shadow-card border border-gray-100">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Phone size={20} className="text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-text-main mb-1">Telefono</h3>
                    <a href="tel:+390313333585" className="text-primary font-medium hover:underline">
                      031 333 3585
                    </a>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg p-6 shadow-card border border-gray-100">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Mail size={20} className="text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-text-main mb-1">Email</h3>
                    <a href="mailto:info@sanfedele.it" className="text-primary font-medium hover:underline">
                      info@sanfedele.it
                    </a>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg p-6 shadow-card border border-gray-100">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Clock size={20} className="text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-text-main mb-2">Orari</h3>
                    <div className="space-y-1 text-sm text-gray-600">
                      <div className="flex justify-between gap-8">
                        <span>Lunedì – Venerdì</span>
                        <span className="font-medium text-text-main">09:00 – 19:30</span>
                      </div>
                      <div className="flex justify-between gap-8">
                        <span>Sabato – Domenica</span>
                        <span className="font-medium text-text-main">Chiuso</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Come raggiungerci */}
          <div>
            <h2 className="heading-2 text-center mb-8">Come raggiungerci</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white rounded-lg p-6 shadow-card border border-gray-100">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-secondary/10 flex items-center justify-center flex-shrink-0">
                    <Car size={20} className="text-secondary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-text-main mb-2">In auto</h3>
                    <p className="text-gray-600 text-sm leading-relaxed">
                      Da Como: seguire la SP41 in direzione Erba/Lecco, uscita Longone al Segrino.
                      Da Milano: autostrada A9 direzione Como, poi SP41 verso Erba.
                      Parcheggio gratuito disponibile presso la struttura.
                    </p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-lg p-6 shadow-card border border-gray-100">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-secondary/10 flex items-center justify-center flex-shrink-0">
                    <Train size={20} className="text-secondary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-text-main mb-2">Con i mezzi pubblici</h3>
                    <p className="text-gray-600 text-sm leading-relaxed">
                      Stazione ferroviaria di Erba (linea Milano-Asso), poi autobus C47 direzione
                      Longone al Segrino. Il centro medico si trova a pochi minuti a piedi dalla fermata.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Form contatto generico */}
          <div>
            <h2 className="heading-2 mb-2">Scrivici</h2>
            <p className="text-gray-500 mb-8">
              Per qualsiasi informazione — orari, servizi, convenzioni o altro —
              compila il modulo e ti risponderemo nel più breve tempo possibile.
            </p>
            <div className="bg-white rounded-lg p-6 shadow-card border border-gray-100">
              <ContactForm />
            </div>
          </div>

        </div>
      </div>
    </>
  )
}
