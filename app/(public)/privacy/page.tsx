import { generatePageMetadata } from '@/lib/seo'
import { getSiteConfig } from '@/lib/firebase/siteConfig'

export const revalidate = 60
export const metadata = generatePageMetadata({
  title: 'Privacy Policy',
  description: 'Informativa sulla privacy del Centro Medico San Fedele.',
  slug: 'privacy',
})

export default async function PrivacyPage() {
  const site = await getSiteConfig()
  return (
    <div className="section">
      <div className="container-main">
        <div className="max-w-3xl mx-auto">
          <h1 className="heading-1 mb-8">Privacy Policy</h1>
          <div className="prose-content text-gray-600 leading-relaxed">
            <p>
              La presente informativa sulla privacy descrive le modalità di raccolta, utilizzo e
              protezione dei dati personali degli utenti del sito web del Centro Medico San Fedele.
            </p>

            <h2>Titolare del trattamento</h2>
            <p>
              Centro Medico San Fedele<br />
              {site.indirizzoCompleto}<br />
              Email: {site.email}<br />
              Telefono: {site.telefono}
            </p>

            <h2>Dati raccolti</h2>
            <p>
              Attraverso il modulo di contatto e prenotazione, raccogliamo: nome, cognome, email,
              numero di telefono e messaggio. Questi dati sono utilizzati esclusivamente per
              rispondere alle richieste degli utenti e gestire le prenotazioni.
            </p>

            <h2>Base giuridica</h2>
            <p>
              Il trattamento dei dati personali si basa sul consenso dell'interessato e
              sull'esecuzione di misure precontrattuali adottate su richiesta dello stesso.
            </p>

            <h2>Diritti dell'interessato</h2>
            <p>
              L'utente ha diritto di accedere ai propri dati, richiederne la rettifica o la
              cancellazione, e opporsi al trattamento. Per esercitare tali diritti, contattare
              il titolare del trattamento all'indirizzo email indicato sopra.
            </p>

            <p className="text-sm text-gray-400 mt-8">
              Questa pagina è un placeholder e sarà aggiornata con l'informativa completa.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
