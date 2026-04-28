import { generatePageMetadata } from '@/lib/seo'

export const metadata = generatePageMetadata({
  title: 'Cookie Policy',
  description: 'Informativa sui cookie del Centro Medico San Fedele.',
  slug: 'cookie-policy',
})

export default function CookiePolicyPage() {
  return (
    <div className="section">
      <div className="container-main">
        <div className="max-w-3xl mx-auto">
          <h1 className="heading-1 mb-8">Cookie Policy</h1>
          <div className="prose-content text-gray-600 leading-relaxed">
            <p>
              Il sito web del Centro Medico San Fedele utilizza cookie per migliorare
              l'esperienza di navigazione e fornire funzionalità aggiuntive.
            </p>

            <h2>Cosa sono i cookie</h2>
            <p>
              I cookie sono piccoli file di testo che vengono memorizzati sul dispositivo
              dell'utente durante la navigazione. Possono essere temporanei (cookie di sessione)
              o permanenti (cookie persistenti).
            </p>

            <h2>Cookie tecnici</h2>
            <p>
              Utilizziamo cookie tecnici necessari per il funzionamento del sito, come la
              gestione delle preferenze di accessibilità (modalità DSA, alto contrasto).
            </p>

            <h2>Cookie di terze parti</h2>
            <p>
              Il sito potrebbe includere contenuti di terze parti (es. Google Maps) che
              utilizzano propri cookie. Per maggiori informazioni, consultare le rispettive
              informative sulla privacy.
            </p>

            <h2>Gestione dei cookie</h2>
            <p>
              L'utente può gestire le preferenze sui cookie attraverso le impostazioni del
              proprio browser. La disattivazione dei cookie potrebbe compromettere alcune
              funzionalità del sito.
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
