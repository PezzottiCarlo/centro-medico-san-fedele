import Link from 'next/link'
import { generatePageMetadata } from '@/lib/seo'
import { getSiteConfig } from '@/lib/firebase/siteConfig'

export const revalidate = 60
export const metadata = generatePageMetadata({
  title: 'Cookie Policy',
  description:
    'Quali cookie e strumenti di memorizzazione usa il sito del Centro Medico San Fedele, perché e come disattivarli.',
  slug: 'cookie-policy',
})

// Data dell'ultima revisione del TESTO di questa informativa. Va aggiornata a
// mano quando si modifica il contenuto della pagina o l'elenco degli strumenti.
const ULTIMO_AGGIORNAMENTO = '8 settembre 2026'

interface Voce {
  nome: string
  tipo: string
  finalita: string
  durata: string
}

// Inventario reale degli strumenti installati dal sito. Se si aggiunge una
// libreria, un embed o uno strumento di misurazione, va aggiornato anche qui.
const STRUMENTI_PROPRI: Voce[] = [
  {
    nome: 'session',
    tipo: 'Cookie tecnico',
    finalita:
      'Mantiene autenticato il personale del centro nell’area di amministrazione. Non viene mai installato durante la normale navigazione del sito pubblico.',
    durata: '5 giorni',
  },
  {
    nome: 'accessibility',
    tipo: 'Memoria locale (localStorage)',
    finalita:
      'Ricorda le preferenze di accessibilità che hai scelto — carattere ad alta leggibilità, alto contrasto, dimensione del testo — così non devi reimpostarle a ogni visita.',
    durata: 'Finché non svuoti i dati del browser',
  },
  {
    nome: 'sanfedele:chat-teaser-visto',
    tipo: 'Memoria di sessione (sessionStorage)',
    finalita:
      'Ricorda che hai già chiuso il messaggio di invito dell’assistente virtuale, per non riproportelo a ogni pagina.',
    durata: 'Fino alla chiusura della scheda del browser',
  },
]

export default async function CookiePolicyPage() {
  const site = await getSiteConfig()
  const titolare = site.ragioneSociale?.trim() || 'Centro Medico San Fedele'

  return (
    <div className="section">
      <div className="container-main">
        <div className="max-w-3xl mx-auto">
          <h1 className="heading-1 mb-2">Cookie Policy</h1>
          <p className="text-sm text-gray-400 mb-8">
            Informativa sull&apos;uso dei cookie e degli strumenti di memorizzazione, ai sensi
            dell&apos;art. 122 del Codice Privacy e delle Linee guida del Garante del 10 giugno
            2021 · Ultimo aggiornamento: {ULTIMO_AGGIORNAMENTO}
          </p>

          <div className="prose-content text-gray-600 leading-relaxed">
            <p>
              Questa pagina elenca, uno per uno, gli strumenti che il sito del Centro Medico San
              Fedele salva sul tuo dispositivo o che coinvolgono servizi di terzi. È un elenco
              breve, perché il sito ne usa pochi: <strong>nessuno serve a profilarti</strong>.
            </p>

            <h2>1. Cosa sono i cookie e gli strumenti equivalenti</h2>
            <p>
              I cookie sono piccoli file di testo che un sito salva nel browser per essere
              ricordato alla visita successiva. Accanto ai cookie esistono altri strumenti che
              funzionano allo stesso modo — <em>localStorage</em> e <em>sessionStorage</em> — e
              che la normativa tratta con le stesse regole. In questa pagina li chiamiamo tutti
              &laquo;strumenti di memorizzazione&raquo; e li elenchiamo senza distinzioni.
            </p>
            <p>
              Ciò che conta è <em>a cosa servono</em>. Gli strumenti <strong>tecnici</strong>,
              necessari a far funzionare il sito o a erogare un servizio che hai richiesto, non
              richiedono il tuo consenso. Quelli di <strong>profilazione</strong>, usati per
              ricostruire le tue abitudini e mostrarti pubblicità mirata, lo richiederebbero:{' '}
              <strong>su questo sito non ce ne sono</strong>.
            </p>

            <h2>2. Cosa questo sito non fa</h2>
            <p>
              Per essere espliciti su ciò che spesso viene dato per scontato, il sito{' '}
              <strong>non utilizza</strong>:
            </p>
            <ul>
              <li>cookie o strumenti di profilazione e di pubblicità comportamentale;</li>
              <li>
                strumenti di statistica e analisi del traffico (nessun Google Analytics, Matomo o
                equivalente);
              </li>
              <li>pixel di tracciamento di social network o piattaforme pubblicitarie;</li>
              <li>
                cessione di dati di navigazione a terzi per finalità commerciali proprie di questi
                ultimi.
              </li>
            </ul>
            <p>
              È per questo che non vedi un banner di consenso all&apos;ingresso: gli strumenti
              elencati qui sotto sono tecnici, oppure vengono attivati soltanto quando apri la
              pagina che li contiene.
            </p>

            <h2>3. Strumenti installati dal sito</h2>
            {/* Sotto sm la tabella costringerebbe a scorrere in orizzontale per
                leggere una riga intera: stessi dati, impaginati come schede. */}
            <div className="sm:hidden space-y-3 my-4">
              {STRUMENTI_PROPRI.map((v) => (
                <div
                  key={v.nome}
                  className="rounded-lg border border-gray-100 bg-bg-soft/40 p-4 text-sm"
                >
                  <p className="font-mono text-xs text-text-main break-all">{v.nome}</p>
                  <dl className="mt-2 space-y-1.5">
                    <div>
                      <dt className="text-xs uppercase tracking-wide text-gray-400">Tipo</dt>
                      <dd>{v.tipo}</dd>
                    </div>
                    <div>
                      <dt className="text-xs uppercase tracking-wide text-gray-400">Finalità</dt>
                      <dd>{v.finalita}</dd>
                    </div>
                    <div>
                      <dt className="text-xs uppercase tracking-wide text-gray-400">Durata</dt>
                      <dd>{v.durata}</dd>
                    </div>
                  </dl>
                </div>
              ))}
            </div>

            <div className="hidden sm:block overflow-x-auto my-4">
              <table className="w-full min-w-[540px] text-sm border-collapse">
                <thead>
                  <tr className="border-b-2 border-bg-deep text-left">
                    <th className="py-2 px-3 font-semibold text-text-main">Nome</th>
                    <th className="py-2 px-3 font-semibold text-text-main">Tipo</th>
                    <th className="py-2 px-3 font-semibold text-text-main">Finalità</th>
                    <th className="py-2 px-3 font-semibold text-text-main whitespace-nowrap">
                      Durata
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {STRUMENTI_PROPRI.map((v) => (
                    <tr key={v.nome} className="border-b border-gray-100 align-top">
                      <td className="py-3 px-3 font-mono text-xs text-text-main">{v.nome}</td>
                      <td className="py-3 px-3">{v.tipo}</td>
                      <td className="py-3 px-3">{v.finalita}</td>
                      <td className="py-3 px-3">{v.durata}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p>
              Sono tutti strumenti tecnici: senza di essi il sito funziona comunque, ma perde le
              tue preferenze di accessibilità e il personale non può accedere all&apos;area
              riservata. I dati che contengono restano sul tuo dispositivo e non vengono
              trasmessi a nessuno.
            </p>

            <h2>4. Servizi di terze parti</h2>
            <p>
              Tre servizi esterni vengono richiamati dalle pagine del sito. In tutti i casi il
              fornitore è Google Ireland Ltd, che riceve il tuo indirizzo IP perché è tecnicamente
              necessario a consegnarti il contenuto, e che agisce come titolare autonomo del
              trattamento per quanto riguarda i propri strumenti.
            </p>

            <h3>Google Maps — solo sulla pagina Contatti</h3>
            <p>
              La mappa che mostra dove siamo è incorporata da Google Maps. Quando apri la pagina{' '}
              <Link href="/contatti">Contatti</Link> la mappa si carica e Google può installare
              propri cookie sul tuo dispositivo, anche di profilazione se hai una sessione attiva
              con un account Google. <strong>Sulle altre pagine del sito non accade.</strong>{' '}
              Se preferisci evitarlo, puoi consultare i nostri riferimenti senza aprire quella
              pagina, oppure bloccare i cookie di terze parti come spiegato al punto 5. Le regole
              applicate da Google sono descritte nella{' '}
              <a
                href="https://policies.google.com/privacy"
                target="_blank"
                rel="noopener noreferrer"
              >
                Privacy Policy di Google
              </a>
              .
            </p>

            <h3>Google reCAPTCHA — solo all'invio di un modulo</h3>
            <p>
              I moduli di prenotazione e contatto sono protetti da reCAPTCHA, che distingue le
              persone dagli invii automatici ed evita che la casella della segreteria venga
              sommersa. Lo script <strong>non viene caricato mentre navighi</strong>: parte solo
              nel momento in cui premi invio su un modulo. Da quel momento Google può installare
              propri cookie e analizza il modo in cui hai interagito con la pagina per assegnare
              un punteggio di affidabilità. Non usiamo reCAPTCHA per altri scopi e non riceviamo
              da Google alcun profilo su di te.
            </p>

            <h3>Google Fonts — su tutte le pagine</h3>
            <p>
              I caratteri tipografici del sito sono serviti dal servizio Google Fonts. Il caricamento
              non installa cookie, ma comporta una richiesta ai server di Google che ne registra
              l&apos;indirizzo IP. Il carattere ad alta leggibilità usato dalla modalità DSA è
              invece ospitato sui nostri server e non coinvolge terzi.
            </p>

            <h2>5. Come gestire o eliminare gli strumenti di memorizzazione</h2>
            <p>
              Puoi cancellare in qualsiasi momento i cookie e i dati salvati da questo sito, e
              impostare il browser perché li rifiuti — compresi quelli di terze parti. Ricorda che
              bloccando tutto perderai le preferenze di accessibilità a ogni visita. Le istruzioni
              del tuo browser:
            </p>
            <ul>
              <li>
                <a
                  href="https://support.google.com/chrome/answer/95647"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Google Chrome
                </a>
              </li>
              <li>
                <a
                  href="https://support.mozilla.org/it/kb/protezione-antitracciamento-avanzata-firefox-desktop"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Mozilla Firefox
                </a>
              </li>
              <li>
                <a
                  href="https://support.apple.com/it-it/guide/safari/sfri11471/mac"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Apple Safari
                </a>
              </li>
              <li>
                <a
                  href="https://support.microsoft.com/it-it/microsoft-edge/eliminare-i-cookie-in-microsoft-edge-63947406-40ac-c3b8-57b9-2a946a29ae09"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Microsoft Edge
                </a>
              </li>
            </ul>
            <p>
              Le preferenze di accessibilità e il messaggio dell&apos;assistente virtuale si
              cancellano svuotando i dati del sito dalle impostazioni del browser, alla voce
              &laquo;dati dei siti web&raquo; o &laquo;archiviazione locale&raquo;.
            </p>

            <h2>6. Titolare e contatti</h2>
            <p>
              Il titolare del trattamento è {titolare}, con sede in {site.indirizzoCompleto}. Per
              qualsiasi domanda su questa informativa puoi scrivere a{' '}
              <a href={`mailto:${site.email}`}>{site.email}</a> o telefonare al{' '}
              <a href={`tel:${site.telefonoE164}`}>{site.telefono}</a>.
            </p>
            <p>
              Come trattiamo i dati che ci lasci tramite i moduli, l&apos;assistente virtuale e la
              navigazione è spiegato nella{' '}
              <Link href="/privacy">Privacy Policy</Link>, che riporta anche i diritti che puoi
              esercitare e come proporre reclamo al Garante.
            </p>

            <h2>7. Modifiche a questa informativa</h2>
            <p>
              Se aggiungeremo o rimuoveremo strumenti, aggiorneremo questo elenco e la data in
              cima alla pagina. Ti invitiamo a consultarla periodicamente.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
