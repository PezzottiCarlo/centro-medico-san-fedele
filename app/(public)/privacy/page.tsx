import Link from 'next/link'
import { generatePageMetadata } from '@/lib/seo'
import { getSiteConfig } from '@/lib/firebase/siteConfig'

export const revalidate = 60
export const metadata = generatePageMetadata({
  title: 'Privacy Policy',
  description:
    'Informativa sul trattamento dei dati personali del Centro Medico San Fedele ai sensi degli artt. 13 e 14 del Regolamento UE 2016/679 (GDPR).',
  slug: 'privacy',
})

// Data dell'ultima revisione del TESTO dell'informativa. Va aggiornata a mano
// quando si modifica il contenuto di questa pagina, non quando cambiano i
// recapiti in Site Config.
const ULTIMO_AGGIORNAMENTO = '8 settembre 2026'

/** Segnaposto per i dati che vanno compilati in /admin/dashboard/site-config. */
function DaCompilare({ campo }: { campo: string }) {
  return (
    <em className="text-red-600 not-italic font-medium">[da compilare in Site Config: {campo}]</em>
  )
}

export default async function PrivacyPage() {
  const site = await getSiteConfig()
  const titolare = site.ragioneSociale?.trim() || 'Centro Medico San Fedele'
  const hasDpo = !!(site.dpoNome?.trim() || site.dpoEmail?.trim())

  // Numerazione progressiva dei paragrafi: la sezione sul DPO compare solo se
  // il DPO è stato nominato, quindi i numeri non possono essere scritti a mano.
  let contatore = 0
  const n = () => ++contatore

  return (
    <div className="section">
      <div className="container-main">
        <div className="max-w-3xl mx-auto">
          <h1 className="heading-1 mb-2">Privacy Policy</h1>
          <p className="text-sm text-gray-400 mb-8">
            Informativa ai sensi degli artt. 13 e 14 del Regolamento UE 2016/679 (GDPR) · Ultimo
            aggiornamento: {ULTIMO_AGGIORNAMENTO}
          </p>

          <div className="prose-content text-gray-600 leading-relaxed">
            <p>
              Questa informativa spiega come il Centro Medico San Fedele raccoglie e utilizza i
              dati personali di chi visita questo sito, invia una richiesta tramite i moduli
              online o dialoga con l&apos;assistente virtuale. La leggi perché vogliamo che tu
              sappia, prima di lasciarci un dato, dove finisce, per quanto tempo resta e come
              puoi farlo cancellare.
            </p>
            <p>
              L&apos;informativa riguarda solo il sito web. Il trattamento dei dati sanitari
              legato alle prestazioni erogate in ambulatorio è disciplinato dall&apos;informativa
              che ti viene consegnata al momento della presa in carico.
            </p>

            <h2>{n()}. Titolare del trattamento</h2>
            <p>
              Il titolare del trattamento è {titolare}
              {site.ragioneSociale?.trim() ? '' : ' '}
              {!site.ragioneSociale?.trim() && <DaCompilare campo="Ragione sociale" />}, con sede
              in {site.indirizzoCompleto}.
            </p>
            <ul>
              <li>
                Partita IVA:{' '}
                {site.partitaIva?.trim() || <DaCompilare campo="Partita IVA" />}
              </li>
              {site.codiceFiscale?.trim() && <li>Codice fiscale: {site.codiceFiscale}</li>}
              <li>
                Email: <a href={`mailto:${site.email}`}>{site.email}</a>
              </li>
              {site.pec?.trim() && (
                <li>
                  PEC: <a href={`mailto:${site.pec}`}>{site.pec}</a>
                </li>
              )}
              <li>
                Telefono: <a href={`tel:${site.telefonoE164}`}>{site.telefono}</a>
              </li>
            </ul>

            {hasDpo && (
              <>
                <h2>{n()}. Responsabile della Protezione dei Dati (DPO)</h2>
                <p>
                  Il titolare ha nominato un Responsabile della Protezione dei Dati, che puoi
                  contattare per qualsiasi questione relativa al trattamento dei tuoi dati o
                  all&apos;esercizio dei tuoi diritti:
                </p>
                <ul>
                  {site.dpoNome?.trim() && <li>{site.dpoNome}</li>}
                  {site.dpoEmail?.trim() && (
                    <li>
                      Email: <a href={`mailto:${site.dpoEmail}`}>{site.dpoEmail}</a>
                    </li>
                  )}
                </ul>
              </>
            )}

            <h2>{n()}. Quali dati raccogliamo</h2>

            <h3>a) Dati di navigazione</h3>
            <p>
              I sistemi informatici che fanno funzionare il sito registrano automaticamente
              alcuni dati la cui trasmissione è implicita nell&apos;uso di internet: indirizzo IP,
              tipo di browser e sistema operativo, data e ora della richiesta, pagine visitate.
              Questi dati non sono usati per identificarti e servono a far funzionare il sito, a
              tenerlo al sicuro e a diagnosticare i malfunzionamenti.
            </p>

            <h3>b) Dati che ci fornisci con i moduli</h3>
            <p>
              Quando compili il modulo di prenotazione o quello di contatto raccogliamo nome,
              cognome, numero di telefono, indirizzo email, il testo del messaggio e — se li
              selezioni — la specialistica, la sotto-specialistica e il medico a cui è rivolta la
              richiesta. Salviamo anche le tue scelte sui consensi, come prova di averli raccolti.
            </p>
            <p>
              <strong>
                Alcune di queste informazioni sono dati relativi alla salute (art. 9 GDPR):
              </strong>{' '}
              la specialistica che scegli, il nome del medico e ciò che scrivi nel campo
              messaggio possono rivelare il tuo stato di salute. Li trattiamo con la stessa
              riservatezza dei dati clinici e li rendiamo accessibili solo al personale
              autorizzato, tenuto al segreto professionale. Ti chiediamo comunque di limitare il
              messaggio a quanto serve per fissare l&apos;appuntamento, senza inserire dettagli
              clinici non necessari.
            </p>

            <h3>c) Conversazioni con l&apos;assistente virtuale MelaBot</h3>
            <p>
              Il sito offre un assistente virtuale che risponde a domande su orari, servizi,
              medici e convenzioni. Il testo che scrivi viene inviato al servizio di
              intelligenza artificiale che genera la risposta (Google Vertex AI) e, insieme al
              tuo indirizzo IP, viene usato per limitare gli abusi. Il Centro Medico San Fedele{' '}
              <strong>non conserva le conversazioni</strong>: una volta chiusa la finestra, il
              contenuto non è più disponibile né a noi né a te.
            </p>
            <p>
              L&apos;assistente fornisce solo informazioni organizzative:{' '}
              <strong>non ti chiediamo dati sanitari e ti invitiamo a non inserirli</strong> in
              chat. Per qualsiasi questione clinica, e per prenotare, usa il modulo di
              prenotazione o il telefono.
            </p>

            <h3>d) Candidature spontanee</h3>
            <p>
              Se ci invii un curriculum all&apos;indirizzo email indicato nella pagina{' '}
              <Link href="/lavora-con-noi">Lavora con noi</Link>, trattiamo i dati contenuti nella
              candidatura per valutare un&apos;eventuale collaborazione. Ti chiediamo di non
              inserire nel curriculum dati particolari (stato di salute, convinzioni religiose,
              appartenenza sindacale) non pertinenti alla posizione.
            </p>

            <h2>{n()}. Perché trattiamo i dati e su quale base giuridica</h2>
            <ul>
              <li>
                <strong>Gestire la tua richiesta di prenotazione o di informazioni.</strong> Base
                giuridica: esecuzione di misure precontrattuali adottate su tua richiesta (art. 6
                §1 lett. b GDPR). Per i dati relativi alla salute, il trattamento è necessario
                per finalità di medicina preventiva, diagnosi e assistenza sanitaria da parte di
                professionisti soggetti al segreto professionale (art. 9 §2 lett. h GDPR), e si
                fonda inoltre sul consenso esplicito che presti spuntando la casella obbligatoria
                del modulo (art. 9 §2 lett. a GDPR).
              </li>
              <li>
                <strong>
                  Inviarti comunicazioni sui servizi e le iniziative del centro.
                </strong>{' '}
                Base giuridica: il tuo consenso libero e facoltativo (art. 6 §1 lett. a GDPR),
                che presti spuntando la seconda casella del modulo. Non spuntarla non ti impedisce
                di inviare la richiesta e puoi revocarlo in qualsiasi momento.
              </li>
              <li>
                <strong>Rispondere alle domande poste all&apos;assistente virtuale.</strong> Base
                giuridica: nostro legittimo interesse a offrire un canale informativo immediato e
                a prevenirne l&apos;abuso (art. 6 §1 lett. f GDPR).
              </li>
              <li>
                <strong>Far funzionare il sito in sicurezza.</strong> Base giuridica: nostro
                legittimo interesse alla continuità e alla sicurezza del servizio (art. 6 §1 lett.
                f GDPR).
              </li>
              <li>
                <strong>Valutare le candidature ricevute.</strong> Base giuridica: esecuzione di
                misure precontrattuali (art. 6 §1 lett. b GDPR).
              </li>
              <li>
                <strong>Adempiere agli obblighi di legge</strong> e difendere un diritto in sede
                giudiziaria. Base giuridica: obbligo legale e legittimo interesse (art. 6 §1 lett.
                c ed f GDPR).
              </li>
            </ul>

            <h2>{n()}. Il conferimento è obbligatorio?</h2>
            <p>
              No. Nessun dato ti è richiesto per il solo fatto di navigare sul sito. I campi
              contrassegnati con l&apos;asterisco nei moduli, insieme al consenso obbligatorio,
              sono però indispensabili per prendere in carico la richiesta: senza di essi non
              possiamo ricontattarti. Il consenso alle comunicazioni informative è invece
              facoltativo e non condiziona nulla.
            </p>

            <h2>{n()}. Chi accede ai dati</h2>
            <p>I dati sono accessibili:</p>
            <ul>
              <li>
                al personale amministrativo e sanitario del centro, autorizzato al trattamento e
                istruito sulla riservatezza;
              </li>
              <li>
                ai fornitori che gestiscono l&apos;infrastruttura tecnica, nominati responsabili
                del trattamento ai sensi dell&apos;art. 28 GDPR:
                <ul>
                  <li>
                    <strong>Google Ireland Ltd / Google LLC</strong> — hosting del sito, database
                    e archiviazione dei file (Firebase, Google Cloud) e servizio di intelligenza
                    artificiale che alimenta l&apos;assistente virtuale (Vertex AI);
                  </li>
                  <li>
                    il <strong>fornitore del servizio di posta elettronica</strong> attraverso cui
                    ricevi e ricevi risposta alle comunicazioni;
                  </li>
                  <li>
                    i professionisti che ci assistono in ambito contabile, legale e informatico.
                  </li>
                </ul>
              </li>
            </ul>
            <p>
              I tuoi dati <strong>non vengono diffusi</strong> e non sono ceduti a terzi per
              finalità commerciali proprie di questi ultimi.
            </p>

            <h2>{n()}. Trasferimenti fuori dallo Spazio Economico Europeo</h2>
            <p>
              I fornitori indicati sopra possono trattare i dati anche su server situati fuori
              dallo Spazio Economico Europeo, in particolare negli Stati Uniti. In questi casi il
              trasferimento avviene sulla base di una decisione di adeguatezza della Commissione
              Europea (EU-US Data Privacy Framework) oppure delle Clausole Contrattuali Standard
              adottate dalla Commissione, accompagnate da misure di sicurezza supplementari. Puoi
              chiederci copia delle garanzie adottate scrivendo ai recapiti indicati in apertura.
            </p>

            <h2>{n()}. Per quanto tempo conserviamo i dati</h2>
            <ul>
              <li>
                <strong>Richieste inviate dai moduli:</strong> 24 mesi dall&apos;invio, termine
                entro il quale la richiesta viene evasa ed eventualmente ripresa in caso di
                contatto successivo. Se la richiesta dà origine a una prestazione sanitaria, la
                relativa documentazione clinica segue i tempi di conservazione previsti dalla
                normativa sanitaria e indicati nell&apos;informativa consegnata in ambulatorio.
              </li>
              <li>
                <strong>Consenso alle comunicazioni informative:</strong> fino alla revoca e,
                comunque, non oltre 24 mesi dall&apos;ultimo contatto.
              </li>
              <li>
                <strong>Conversazioni con l&apos;assistente virtuale:</strong> non conservate.
              </li>
              <li>
                <strong>Dati di navigazione e log tecnici:</strong> non oltre 12 mesi, salvo
                conservazione più lunga necessaria ad accertare reati informatici.
              </li>
              <li>
                <strong>Candidature spontanee:</strong> 12 mesi dalla ricezione, salvo tua diversa
                indicazione.
              </li>
            </ul>
            <p>
              Al termine di questi periodi i dati sono cancellati o resi anonimi in modo
              irreversibile.
            </p>

            <h2>{n()}. Come proteggiamo i dati</h2>
            <p>
              Il sito usa una connessione cifrata (HTTPS). I dati sono conservati su
              infrastruttura cloud con accesso limitato al personale autorizzato tramite
              credenziali individuali, e l&apos;area di amministrazione è protetta da
              autenticazione. Adottiamo misure tecniche e organizzative adeguate al rischio, ai
              sensi dell&apos;art. 32 GDPR, e le riesaminiamo periodicamente.
            </p>

            <h2>{n()}. I tuoi diritti</h2>
            <p>In qualsiasi momento hai il diritto di:</p>
            <ul>
              <li>
                <strong>accedere</strong> ai tuoi dati e ottenerne copia (art. 15);
              </li>
              <li>
                chiederne la <strong>rettifica</strong> se inesatti o incompleti (art. 16);
              </li>
              <li>
                chiederne la <strong>cancellazione</strong>, quando non abbiamo più motivo di
                conservarli (art. 17);
              </li>
              <li>
                chiedere la <strong>limitazione</strong> del trattamento (art. 18);
              </li>
              <li>
                ricevere i dati in formato leggibile da dispositivo automatico e trasmetterli ad
                altro titolare (<strong>portabilità</strong>, art. 20);
              </li>
              <li>
                <strong>opporti</strong> al trattamento fondato sul legittimo interesse (art. 21);
              </li>
              <li>
                <strong>revocare il consenso</strong> in qualsiasi momento, senza che ciò
                pregiudichi la liceità del trattamento effettuato prima della revoca (art. 7 §3).
              </li>
            </ul>
            <p>
              Per esercitare questi diritti scrivi a{' '}
              <a href={`mailto:${hasDpo && site.dpoEmail?.trim() ? site.dpoEmail : site.email}`}>
                {hasDpo && site.dpoEmail?.trim() ? site.dpoEmail : site.email}
              </a>{' '}
              indicando il diritto che intendi esercitare. Ti rispondiamo entro un mese dalla
              richiesta, prorogabile di due mesi in casi complessi. L&apos;esercizio dei diritti è
              gratuito.
            </p>

            <h2>{n()}. Reclamo all&apos;autorità di controllo</h2>
            <p>
              Se ritieni che il trattamento dei tuoi dati violi il GDPR, hai diritto di proporre
              reclamo al Garante per la protezione dei dati personali (Piazza Venezia 11, 00187
              Roma —{' '}
              <a href="https://www.garanteprivacy.it" target="_blank" rel="noopener noreferrer">
                garanteprivacy.it
              </a>
              ) o di ricorrere all&apos;autorità giudiziaria.
            </p>

            <h2>{n()}. Decisioni automatizzate e profilazione</h2>
            <p>
              Non effettuiamo profilazione né adottiamo decisioni basate unicamente su un
              trattamento automatizzato che producano effetti giuridici o incidano in modo
              analogamente significativo sulla tua persona. L&apos;assistente virtuale fornisce
              informazioni ma non prende decisioni sulla tua presa in carico: ogni richiesta di
              appuntamento è valutata da una persona.
            </p>

            <h2>{n()}. Minori</h2>
            <p>
              Il sito non è rivolto direttamente ai minori di quattordici anni. Le richieste che
              riguardano un minore devono essere inviate da chi esercita la responsabilità
              genitoriale, che risponde della veridicità dei dati comunicati.
            </p>

            <h2>{n()}. Cookie e strumenti di tracciamento</h2>
            <p>
              Il sito non usa strumenti di profilazione né di statistica: solo cookie e memoria
              locale di natura tecnica. Fanno eccezione due servizi di Google richiamati dalle
              pagine — la mappa incorporata nella pagina Contatti, che può installare propri
              cookie, e i caratteri tipografici serviti da Google Fonts, che comportano la
              trasmissione dell&apos;indirizzo IP. L&apos;elenco completo, con finalità e durata di
              ciascuno strumento, è nella <Link href="/cookie-policy">Cookie Policy</Link>.
            </p>

            <h2>{n()}. Link ad altri siti</h2>
            <p>
              Il sito contiene collegamenti a siti di terzi (ad esempio Google Maps o i profili
              social del centro). Questa informativa non si applica a quei siti: ti invitiamo a
              consultare le rispettive informative prima di comunicare loro i tuoi dati.
            </p>

            <h2>{n()}. Modifiche a questa informativa</h2>
            <p>
              Possiamo aggiornare questa informativa per adeguarla a modifiche normative o a
              cambiamenti nei servizi offerti dal sito. La versione pubblicata su questa pagina è
              sempre quella vigente e riporta in alto la data dell&apos;ultimo aggiornamento. Ti
              invitiamo a consultarla periodicamente.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
