/**
 * Seed script — popola Firestore con dati di debug.
 * Richiede le variabili d'ambiente Firebase Admin in .env.local
 *
 * Uso:
 *   npm run seed
 */

import * as path from 'path'
import { loadEnvConfig } from '@next/env'

loadEnvConfig(path.resolve(__dirname, '..'))

import { initializeApp, getApps, cert } from 'firebase-admin/app'
import { getFirestore } from 'firebase-admin/firestore'

// ── Init ─────────────────────────────────────────────────────
const privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, '\n')

if (!process.env.FIREBASE_ADMIN_PROJECT_ID || !privateKey) {
  console.error('❌  Credenziali Firebase Admin mancanti. Controlla .env.local')
  process.exit(1)
}

const seedApp =
  getApps().find((a) => a.name === 'seed') ??
  initializeApp(
    {
      credential: cert({
        projectId: process.env.FIREBASE_ADMIN_PROJECT_ID,
        clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
        privateKey,
      }),
    },
    'seed'
  )

const db = getFirestore(seedApp)

// ── Helpers ───────────────────────────────────────────────────

function slugify(str: string): string {
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

function uuid(): string {
  return Math.random().toString(36).substring(2, 10) + Date.now().toString(36)
}

async function clearCollection(name: string) {
  const snap = await db.collection(name).get()
  const batch = db.batch()
  snap.docs.forEach((d) => batch.delete(d.ref))
  if (snap.docs.length > 0) await batch.commit()
  console.log(`  🗑  ${name}: rimossi ${snap.docs.length} documenti`)
}

// ── Specialistiche ───────────────────────────────────────────

const SPECIALISTICHE = [
  {
    nome: 'Elettroterapia',
    slug: 'elettroterapia',
    icona: '⚡',
    descrizioneBreve: 'Trattamenti elettrofisici per il recupero funzionale e il controllo del dolore.',
    descrizione: '<ul><li>TENS (Transcutaneous Electrical Nerve Stimulation)</li><li>Correnti interferenziali</li><li>Elettrostimolazione muscolare (EMS)</li><li>Ionoforesi</li><li>Magnetoterapia</li><li>Laserterapia</li><li>Ultrasuoni terapeutici</li></ul>',
    metaTitle: 'Elettroterapia | Centro Medico San Fedele',
    metaDescription: 'Trattamenti di elettroterapia per il dolore e la riabilitazione a Longone al Segrino.',
    order: 1,
    pubblicata: true,
    sottoSpecialistiche: [] as { id: string; nome: string }[],
  },
  {
    nome: 'Fisioterapia e Riabilitazione',
    slug: 'fisioterapia-riabilitazione',
    icona: '🦴',
    descrizioneBreve: 'Percorsi riabilitativi personalizzati per recuperare la funzionalità motoria.',
    descrizione: '<ul><li>Fisioterapia ortopedica e traumatologica</li><li>Riabilitazione post-chirurgica</li><li>Massoterapia e massaggio terapeutico</li><li>Linfodrenaggio manuale</li><li>Terapia manuale e manipolazioni</li><li>Rieducazione posturale globale (RPG)</li><li>Pilates riabilitativo</li><li>Idrokinesiterapia</li></ul>',
    metaTitle: 'Fisioterapia e Riabilitazione | Centro Medico San Fedele',
    metaDescription: 'Fisioterapia e riabilitazione personalizzata a Longone al Segrino, Como.',
    order: 2,
    pubblicata: true,
    sottoSpecialistiche: [] as { id: string; nome: string }[],
  },
  {
    nome: 'Specialistica Medica',
    slug: 'specialistica-medica',
    icona: '🩺',
    descrizioneBreve: 'Visite specialistiche con medici esperti in diverse discipline cliniche.',
    descrizione: '<ul><li>Medicina interna</li><li>Cardiologia</li><li>Neurologia</li><li>Ortopedia e traumatologia</li><li>Reumatologia</li><li>Endocrinologia e diabetologia</li><li>Dermatologia</li><li>Ginecologia</li><li>Urologia</li><li>Psicologia e psicoterapia</li><li>Psichiatria</li></ul>',
    metaTitle: 'Specialistica Medica | Centro Medico San Fedele',
    metaDescription: 'Visite specialistiche di alto livello a Longone al Segrino, Provincia di Como.',
    order: 3,
    pubblicata: true,
    sottoSpecialistiche: [] as { id: string; nome: string }[],
  },
  {
    nome: 'Esami Diagnostici',
    slug: 'esami-diagnostici',
    icona: '🔬',
    descrizioneBreve: 'Diagnostica strumentale e di laboratorio per diagnosi rapide e precise.',
    descrizione: '<ul><li>Ecografia internistica, muscolo-tendinea, vascolare</li><li>Ecocardiografia</li><li>Elettrocardiogramma (ECG) a riposo e da sforzo</li><li>Holter ECG e pressorio</li><li>Spirometria</li><li>Audiometria e esame vestibolare</li><li>Esami di laboratorio (prelievi)</li><li>Test allergie</li><li>Densitometria ossea (MOC/DEXA)</li></ul>',
    metaTitle: 'Esami Diagnostici | Centro Medico San Fedele',
    metaDescription: 'Esami diagnostici strumentali e di laboratorio a Longone al Segrino.',
    order: 4,
    pubblicata: true,
    sottoSpecialistiche: [] as { id: string; nome: string }[],
  },
  {
    nome: 'Medicina Sportiva',
    slug: 'medicina-sportiva',
    icona: '🏅',
    descrizioneBreve: 'Certificazioni medico-sportive, valutazioni funzionali e nutrizione per atleti.',
    descrizione: '<ul><li>Certificazioni medico-sportive agonistiche e non agonistiche</li><li>Visita di idoneità con ECG a riposo e sotto sforzo</li><li>Valutazione funzionale dell\'atleta</li><li>Test da sforzo e spirometria</li><li>Nutrizione sportiva personalizzata</li><li>Prevenzione infortuni sportivi</li></ul>',
    metaTitle: 'Medicina Sportiva | Centro Medico San Fedele',
    metaDescription: 'Certificazioni medico-sportive e valutazioni funzionali a Longone al Segrino.',
    order: 5,
    pubblicata: true,
    sottoSpecialistiche: [] as { id: string; nome: string }[],
  },
  {
    nome: 'Altri Servizi',
    slug: 'altri-servizi',
    icona: '➕',
    descrizioneBreve: 'Servizi integrativi per la salute e il benessere della persona.',
    descrizione: '<ul><li>Medicina estetica</li><li>Agopuntura</li><li>Osteopatia</li><li>Logopedia</li><li>Neuropsichiatria infantile</li><li>Area DSA (Disturbi Specifici dell\'Apprendimento)</li><li>Medicina del lavoro</li></ul>',
    metaTitle: 'Altri Servizi | Centro Medico San Fedele',
    metaDescription: 'Servizi integrativi per salute e benessere al Centro Medico San Fedele.',
    order: 6,
    pubblicata: true,
    sottoSpecialistiche: [] as { id: string; nome: string }[],
  },
]

// ── Medici ───────────────────────────────────────────────────
// spec = slug della specialistica principale
// suChiamata = true → medico esterno che viene solo su appuntamento (no orario fisso)

interface MedicoSeed {
  nome: string
  specialita: string
  specs: string[]
  suChiamata: boolean
  orari: { giorno: string; ore: string; tipo: 'appuntamento' | 'fisso' }[]
}

const MEDICI: MedicoSeed[] = [
  {
    nome: 'Dott. Marco Colombo',
    specialita: 'Medico Internista',
    specs: ['specialistica-medica'],
    suChiamata: false,
    orari: [
      { giorno: 'Lunedì', ore: '09:00 – 13:00', tipo: 'fisso' },
      { giorno: 'Mercoledì', ore: '14:00 – 18:00', tipo: 'fisso' },
      { giorno: 'Venerdì', ore: '09:00 – 13:00', tipo: 'fisso' },
    ],
  },
  {
    nome: 'Dott.ssa Laura Ferretti',
    specialita: 'Cardiologa',
    specs: ['specialistica-medica', 'esami-diagnostici'],
    suChiamata: false,
    orari: [
      { giorno: 'Martedì', ore: '08:30 – 13:00', tipo: 'fisso' },
      { giorno: 'Giovedì', ore: '14:00 – 18:30', tipo: 'fisso' },
    ],
  },
  {
    nome: 'Dott. Alessio Brambilla',
    specialita: 'Fisioterapista',
    specs: ['fisioterapia-riabilitazione', 'elettroterapia', 'medicina-sportiva'],
    suChiamata: false,
    orari: [
      { giorno: 'Lunedì', ore: '08:00 – 13:00', tipo: 'fisso' },
      { giorno: 'Martedì', ore: '14:00 – 19:00', tipo: 'fisso' },
      { giorno: 'Mercoledì', ore: '08:00 – 13:00', tipo: 'fisso' },
      { giorno: 'Giovedì', ore: '14:00 – 19:00', tipo: 'fisso' },
      { giorno: 'Venerdì', ore: '08:00 – 13:00', tipo: 'fisso' },
    ],
  },
  {
    nome: 'Dott.ssa Giulia Fontana',
    specialita: 'Neurologa',
    specs: ['specialistica-medica'],
    suChiamata: true,
    orari: [],
  },
  {
    nome: 'Dott. Roberto Manzoni',
    specialita: 'Ortopedico',
    specs: ['specialistica-medica', 'medicina-sportiva'],
    suChiamata: true,
    orari: [],
  },
  {
    nome: 'Dott.ssa Chiara Valli',
    specialita: 'Ginecologa',
    specs: ['specialistica-medica'],
    suChiamata: true,
    orari: [],
  },
  {
    nome: 'Dott. Federico Sala',
    specialita: 'Dermatologo',
    specs: ['specialistica-medica'],
    suChiamata: true,
    orari: [],
  },
  {
    nome: 'Dott.ssa Anna Ricci',
    specialita: 'Psicologa',
    specs: ['specialistica-medica', 'altri-servizi'],
    suChiamata: false,
    orari: [
      { giorno: 'Lunedì', ore: '10:00 – 18:00', tipo: 'appuntamento' },
      { giorno: 'Mercoledì', ore: '10:00 – 18:00', tipo: 'appuntamento' },
      { giorno: 'Venerdì', ore: '10:00 – 14:00', tipo: 'appuntamento' },
    ],
  },
  {
    nome: 'Dott. Luca Cattaneo',
    specialita: 'Fisioterapista',
    specs: ['fisioterapia-riabilitazione', 'elettroterapia'],
    suChiamata: false,
    orari: [
      { giorno: 'Martedì', ore: '08:00 – 13:00', tipo: 'fisso' },
      { giorno: 'Mercoledì', ore: '14:00 – 19:00', tipo: 'fisso' },
      { giorno: 'Giovedì', ore: '08:00 – 13:00', tipo: 'fisso' },
      { giorno: 'Sabato', ore: '08:00 – 12:00', tipo: 'fisso' },
    ],
  },
  {
    nome: 'Dott.ssa Marta Negri',
    specialita: 'Endocrinologa',
    specs: ['specialistica-medica'],
    suChiamata: true,
    orari: [],
  },
  {
    nome: 'Dott. Paolo Moretti',
    specialita: 'Medico dello Sport',
    specs: ['medicina-sportiva', 'esami-diagnostici'],
    suChiamata: false,
    orari: [
      { giorno: 'Lunedì', ore: '14:00 – 18:00', tipo: 'fisso' },
      { giorno: 'Mercoledì', ore: '09:00 – 13:00', tipo: 'fisso' },
      { giorno: 'Venerdì', ore: '14:00 – 18:00', tipo: 'fisso' },
    ],
  },
  {
    nome: 'Dott.ssa Elena Marchetti',
    specialita: 'Nutrizionista Sportiva',
    specs: ['medicina-sportiva', 'altri-servizi'],
    suChiamata: false,
    orari: [
      { giorno: 'Martedì', ore: '09:00 – 13:00', tipo: 'appuntamento' },
      { giorno: 'Giovedì', ore: '09:00 – 13:00', tipo: 'appuntamento' },
    ],
  },
]

// ── Sotto-specialistiche (con i nomi dei medici che verranno poi risolti in ID) ──

interface SottoSpecSeed {
  specSlug: string
  nome: string
  mediciNomi: string[] // verranno risolti in ID dopo il seed dei medici
}

const SOTTO_SPECIALISTICHE: SottoSpecSeed[] = [
  // Specialistica Medica
  { specSlug: 'specialistica-medica', nome: 'Cardiologia', mediciNomi: ['Dott.ssa Laura Ferretti'] },
  { specSlug: 'specialistica-medica', nome: 'Neurologia', mediciNomi: ['Dott.ssa Giulia Fontana'] },
  { specSlug: 'specialistica-medica', nome: 'Ortopedia e Traumatologia', mediciNomi: ['Dott. Roberto Manzoni'] },
  { specSlug: 'specialistica-medica', nome: 'Medicina Interna', mediciNomi: ['Dott. Marco Colombo'] },
  { specSlug: 'specialistica-medica', nome: 'Ginecologia', mediciNomi: ['Dott.ssa Chiara Valli'] },
  { specSlug: 'specialistica-medica', nome: 'Dermatologia', mediciNomi: ['Dott. Federico Sala'] },
  { specSlug: 'specialistica-medica', nome: 'Endocrinologia e Diabetologia', mediciNomi: ['Dott.ssa Marta Negri'] },
  { specSlug: 'specialistica-medica', nome: 'Psicologia e Psicoterapia', mediciNomi: ['Dott.ssa Anna Ricci'] },

  // Fisioterapia
  { specSlug: 'fisioterapia-riabilitazione', nome: 'Fisioterapia Ortopedica', mediciNomi: ['Dott. Alessio Brambilla', 'Dott. Luca Cattaneo'] },
  { specSlug: 'fisioterapia-riabilitazione', nome: 'Riabilitazione Post-chirurgica', mediciNomi: ['Dott. Alessio Brambilla', 'Dott. Luca Cattaneo'] },
  { specSlug: 'fisioterapia-riabilitazione', nome: 'Rieducazione Posturale', mediciNomi: ['Dott. Luca Cattaneo'] },
  { specSlug: 'fisioterapia-riabilitazione', nome: 'Fisioterapia Sportiva', mediciNomi: ['Dott. Alessio Brambilla'] },

  // Esami Diagnostici
  { specSlug: 'esami-diagnostici', nome: 'Ecografia', mediciNomi: ['Dott. Marco Colombo', 'Dott.ssa Laura Ferretti'] },
  { specSlug: 'esami-diagnostici', nome: 'Ecocardiografia e ECG', mediciNomi: ['Dott.ssa Laura Ferretti'] },
  { specSlug: 'esami-diagnostici', nome: 'Holter e Monitoraggio Pressorio', mediciNomi: ['Dott.ssa Laura Ferretti'] },
  { specSlug: 'esami-diagnostici', nome: 'Test da Sforzo', mediciNomi: ['Dott.ssa Laura Ferretti', 'Dott. Paolo Moretti'] },

  // Medicina Sportiva
  { specSlug: 'medicina-sportiva', nome: 'Certificazioni Agonistiche', mediciNomi: ['Dott. Paolo Moretti'] },
  { specSlug: 'medicina-sportiva', nome: 'Certificazioni Non Agonistiche', mediciNomi: ['Dott. Paolo Moretti'] },
  { specSlug: 'medicina-sportiva', nome: 'Valutazione Funzionale Atleta', mediciNomi: ['Dott. Paolo Moretti', 'Dott. Roberto Manzoni'] },
  { specSlug: 'medicina-sportiva', nome: 'Nutrizione Sportiva', mediciNomi: ['Dott.ssa Elena Marchetti'] },
  { specSlug: 'medicina-sportiva', nome: 'Fisioterapia Sportiva', mediciNomi: ['Dott. Alessio Brambilla'] },

  // Elettroterapia
  { specSlug: 'elettroterapia', nome: 'TENS e Correnti', mediciNomi: ['Dott. Alessio Brambilla', 'Dott. Luca Cattaneo'] },
  { specSlug: 'elettroterapia', nome: 'Laserterapia', mediciNomi: ['Dott. Luca Cattaneo'] },
  { specSlug: 'elettroterapia', nome: 'Magnetoterapia', mediciNomi: ['Dott. Alessio Brambilla'] },

  // Altri Servizi
  { specSlug: 'altri-servizi', nome: 'Area DSA', mediciNomi: ['Dott.ssa Anna Ricci'] },
  { specSlug: 'altri-servizi', nome: 'Logopedia', mediciNomi: [] },
  { specSlug: 'altri-servizi', nome: 'Osteopatia', mediciNomi: [] },
]

// ── Patologie ────────────────────────────────────────────────

const PATOLOGIE = [
  { nome: 'Ernia del disco', spec: 'fisioterapia-riabilitazione', mediciNomi: ['Dott. Alessio Brambilla', 'Dott. Luca Cattaneo'] },
  { nome: 'Lombalgia', spec: 'fisioterapia-riabilitazione', mediciNomi: ['Dott. Alessio Brambilla', 'Dott. Luca Cattaneo'] },
  { nome: 'Cervicalgia', spec: 'fisioterapia-riabilitazione', mediciNomi: ['Dott. Alessio Brambilla', 'Dott. Luca Cattaneo'] },
  { nome: 'Tendinite', spec: 'fisioterapia-riabilitazione', mediciNomi: ['Dott. Alessio Brambilla'] },
  { nome: 'Artrite reumatoide', spec: 'specialistica-medica', mediciNomi: ['Dott. Roberto Manzoni'] },
  { nome: 'DSA (Disturbi Specifici dell\'Apprendimento)', spec: 'altri-servizi', mediciNomi: ['Dott.ssa Anna Ricci'] },
  { nome: 'Depressione', spec: 'specialistica-medica', mediciNomi: ['Dott.ssa Anna Ricci'] },
  { nome: 'Ipertensione arteriosa', spec: 'specialistica-medica', mediciNomi: ['Dott.ssa Laura Ferretti', 'Dott. Marco Colombo'] },
  { nome: 'Diabete mellito', spec: 'specialistica-medica', mediciNomi: ['Dott.ssa Marta Negri'] },
  { nome: 'Osteoporosi', spec: 'esami-diagnostici', mediciNomi: ['Dott.ssa Marta Negri'] },
  { nome: 'Lesioni sportive', spec: 'medicina-sportiva', mediciNomi: ['Dott. Paolo Moretti', 'Dott. Alessio Brambilla', 'Dott. Roberto Manzoni'] },
  { nome: 'Sindrome del tunnel carpale', spec: 'specialistica-medica', mediciNomi: ['Dott.ssa Giulia Fontana', 'Dott. Roberto Manzoni'] },
]

// ── News ─────────────────────────────────────────────────────

const NEWS = [
  {
    titolo: 'Apertura nuovo ambulatorio di cardiologia',
    categoria: 'news',
    corpo: '<p>Siamo lieti di annunciare l\'apertura del nuovo ambulatorio di cardiologia, dotato delle più moderne apparecchiature per la diagnosi e il monitoraggio cardiaco. Il reparto è guidato dalla Dott.ssa Laura Ferretti, specialista con oltre 15 anni di esperienza.</p>',
  },
  {
    titolo: 'Giornata della prevenzione cardiovascolare',
    categoria: 'evento',
    corpo: '<p>Il 15 aprile organizziamo una giornata di prevenzione cardiovascolare gratuita. Sarà possibile effettuare un ECG di screening e consultare uno specialista. La prenotazione è consigliata.</p>',
  },
  {
    titolo: 'Nuove terapie per la riabilitazione post-chirurgica',
    categoria: 'articolo',
    corpo: '<p>Il nostro team di fisioterapisti presenta le più recenti evidenze scientifiche per la riabilitazione post-chirurgica ortopedica. Scopri come il nostro approccio multidisciplinare riduce i tempi di recupero.</p>',
  },
  {
    titolo: 'Screening gratuito per l\'osteoporosi',
    categoria: 'evento',
    corpo: '<p>In occasione della Giornata Mondiale dell\'Osteoporosi, offriamo screening gratuiti con densitometria ossea per le donne over 50. Prenota il tuo appuntamento entro il 30 marzo.</p>',
  },
  {
    titolo: 'L\'importanza della vitamina D: tutto quello che devi sapere',
    categoria: 'articolo',
    corpo: '<p>La carenza di vitamina D è uno dei deficit nutrizionali più diffusi in Italia, spesso sottovalutato. La nostra endocrinologa Dott.ssa Marta Negri spiega i rischi e come prevenirli con semplici esami del sangue.</p>',
  },
  {
    titolo: 'Nuovo servizio di medicina sportiva',
    categoria: 'news',
    corpo: '<p>Da oggi è attivo il nostro ambulatorio di Medicina Sportiva con il Dott. Paolo Moretti. Certificazioni agonistiche e non agonistiche, valutazioni funzionali e piani nutrizionali per atleti di ogni livello.</p>',
  },
  {
    titolo: 'Corso di ginnastica posturale – iscrizioni aperte',
    categoria: 'evento',
    corpo: '<p>Aperte le iscrizioni al nuovo corso di ginnastica posturale in piccoli gruppi (max 8 persone), tenuto dal Dott. Luca Cattaneo. Il corso è ideale per chi soffre di mal di schiena cronico o postura scorretta.</p>',
  },
  {
    titolo: 'DSA: diagnosi precoce per un futuro migliore',
    categoria: 'articolo',
    corpo: '<p>La diagnosi precoce dei Disturbi Specifici dell\'Apprendimento è fondamentale per il successo scolastico e personale del bambino. La nostra équipe multidisciplinare offre percorsi diagnostici e riabilitativi completi.</p>',
  },
  {
    titolo: 'Nutrizione e sport: il connubio vincente',
    categoria: 'articolo',
    corpo: '<p>Una corretta alimentazione è alla base della performance sportiva e del recupero muscolare. La nostra nutrizionista Dott.ssa Elena Marchetti illustra i principi fondamentali della nutrizione sportiva, adatta sia agli atleti agonisti che agli amatori.</p>',
  },
  {
    titolo: 'Aggiornamento orari estivi',
    categoria: 'news',
    corpo: '<p>Si comunica che durante il periodo estivo (luglio – agosto) gli orari di apertura subiranno alcune variazioni. Il centro rimarrà operativo dal lunedì al venerdì con orario 09:00–13:00 e 15:00–18:00.</p>',
  },
]

// ── Convenzioni ──────────────────────────────────────────────

const CONVENZIONI = [
  { nome: 'Unisalute', logo: '', url: 'https://www.unisalute.it', attiva: true },
  { nome: 'Generali Welion', logo: '', url: 'https://www.welion.it', attiva: true },
  { nome: 'Fasi', logo: '', url: 'https://www.fasi.it', attiva: true },
  { nome: 'Metasalute', logo: '', url: 'https://www.metasalute.it', attiva: true },
  { nome: 'Previmedical', logo: '', url: 'https://www.previmedical.it', attiva: true },
  { nome: 'Generali', logo: '', url: 'https://www.generali.it', attiva: true },
  { nome: 'Allianz', logo: '', url: 'https://www.allianz.it', attiva: true },
  { nome: 'Blue Assistance', logo: '', url: '', attiva: false },
]

// ── Recensioni ───────────────────────────────────────────────

const RECENSIONI = [
  {
    autore: 'Francesca T.',
    testo: 'Ho fatto la riabilitazione dopo un intervento al ginocchio. Il team di fisioterapisti è preparatissimo e mi ha aiutata a recuperare in tempi rapidi.',
    stelle: 5,
    data: '2024-11-02',
    fonte: 'editoriale',
  },
  {
    autore: 'Simona R.',
    testo: "Ho portato mia figlia per una valutazione DSA. L'équipe è molto competente e umana. Ci hanno spiegato tutto con grande chiarezza.",
    stelle: 5,
    data: '2024-12-01',
    fonte: 'editoriale',
  },
  {
    autore: 'Roberto P.',
    testo: 'Struttura accogliente e medici davvero competenti. Ho trovato risposta a problemi che portavo avanti da anni. Consiglio a tutti.',
    stelle: 5,
    data: '2024-10-20',
    fonte: 'editoriale',
  },
  {
    autore: 'Laura C.',
    testo: 'Ottimo centro, convenzioni attive con la mia mutua sanitaria. Prenotazioni rapide e refertazione puntuale.',
    stelle: 4,
    data: '2024-09-15',
    fonte: 'editoriale',
  },
  {
    autore: 'Andrea M.',
    testo: "Seguo qui tutta la mia famiglia da anni. Non cambierei mai. Professionalità e umanità al centro dell'esperienza.",
    stelle: 5,
    data: '2025-01-10',
    fonte: 'editoriale',
  },
  {
    autore: 'Elena B.',
    testo: 'Percorso di fisioterapia eccellente. In sei settimane ho risolto una lombalgia cronica che mi affliggeva da mesi.',
    stelle: 5,
    data: '2025-02-05',
    fonte: 'editoriale',
  },
  {
    autore: 'Marco L.',
    testo: 'Certificazione sportiva fatta in un\'ora, tutto perfetto. Il Dott. Moretti è molto professionale e disponibile.',
    stelle: 5,
    data: '2025-03-01',
    fonte: 'editoriale',
  },
]

// ── Main ──────────────────────────────────────────────────────

async function main() {
  console.log('\n🌱  Seed Firestore — Centro Medico San Fedele\n')

  // Clear existing data
  console.log('📦  Pulizia collezioni...')
  await Promise.all([
    clearCollection('specialistiche'),
    clearCollection('medici'),
    clearCollection('patologie'),
    clearCollection('news_eventi'),
    clearCollection('convenzioni'),
    clearCollection('recensioni_statiche'),
  ])

  // 1. Seed specialistiche con sotto-specialistiche (ora prive di mediciIds — la relazione sta sui medici)
  console.log('\n📝  Inserimento specialistiche e sotto-specialistiche...')
  const specIds: Record<string, string> = {}
  // Mappa: "specSlug::sottoNome" → sottoId
  const sottoIdByKey: Record<string, string> = {}

  // Raggruppa sotto-spec per spec slug
  const sottoBySpec: Record<string, { id: string; nome: string }[]> = {}
  for (const sotto of SOTTO_SPECIALISTICHE) {
    if (!sottoBySpec[sotto.specSlug]) sottoBySpec[sotto.specSlug] = []
    const sottoId = uuid()
    sottoBySpec[sotto.specSlug].push({ id: sottoId, nome: sotto.nome })
    sottoIdByKey[`${sotto.specSlug}::${sotto.nome}`] = sottoId
  }

  for (const s of SPECIALISTICHE) {
    const { sottoSpecialistiche: _, ...data } = s
    const ref = await db.collection('specialistiche').add({
      ...data,
      sottoSpecialistiche: sottoBySpec[s.slug] || [],
    })
    specIds[s.slug] = ref.id
    console.log(`  ✅  specialistiche/${ref.id}: ${s.nome} (${(sottoBySpec[s.slug] || []).length} sotto-spec)`)
  }

  // 2. Costruisci la mappa inversa: medicoNome → set di sottoSpecIds
  const sottoSpecsByMedicoNome: Record<string, string[]> = {}
  for (const sotto of SOTTO_SPECIALISTICHE) {
    const sottoId = sottoIdByKey[`${sotto.specSlug}::${sotto.nome}`]
    if (!sottoId) continue
    for (const medicoNome of sotto.mediciNomi) {
      if (!sottoSpecsByMedicoNome[medicoNome]) sottoSpecsByMedicoNome[medicoNome] = []
      if (!sottoSpecsByMedicoNome[medicoNome].includes(sottoId)) {
        sottoSpecsByMedicoNome[medicoNome].push(sottoId)
      }
    }
  }

  // 3. Seed medici (ora con sottoSpecialisticheIds risolti + mansione)
  console.log('\n📝  Inserimento medici...')
  const medicoIds: Record<string, string> = {}
  for (const m of MEDICI) {
    const specIdsList = m.specs.map((slug) => specIds[slug]).filter(Boolean)
    const sottoSpecsIds = sottoSpecsByMedicoNome[m.nome] || []

    const data = {
      nome: m.nome,
      slug: slugify(m.nome.replace('Dott. ', '').replace('Dott.ssa ', '')),
      mansione: m.specialita,
      bio: `${m.nome} è specialista in ${m.specialita} con esperienza pluriennale. Opera presso il Centro Medico San Fedele con dedizione e professionalità.`,
      curriculum: `<ul><li>Laurea in Medicina e Chirurgia</li><li>Specializzazione in ${m.specialita}</li><li>Membro di società scientifiche nazionali</li></ul>`,
      foto: '',
      telefono: '',
      email: '',
      pubblicato: true,
      suChiamata: m.suChiamata,
      specialisticheIds: specIdsList,
      sottoSpecialisticheIds: sottoSpecsIds,
      patologieIds: [],
      orari: m.orari,
    }

    const ref = await db.collection('medici').add(data)
    medicoIds[m.nome] = ref.id
    const label = m.suChiamata ? ' (su chiamata)' : ''
    console.log(`  ✅  medici/${ref.id}: ${m.nome} — ${m.specialita}${label} (${sottoSpecsIds.length} sotto-spec)`)
  }

  // 4. Seed patologie (con ID medici risolti)
  console.log('\n📝  Inserimento patologie...')
  const patBatch = db.batch()
  for (const p of PATOLOGIE) {
    const ref = db.collection('patologie').doc()
    const resolvedMediciIds = p.mediciNomi
      .map((nome) => medicoIds[nome])
      .filter(Boolean)
    patBatch.set(ref, {
      nome: p.nome,
      slug: slugify(p.nome),
      descrizione: `<p>La ${p.nome} è una condizione che richiede un approccio diagnostico e terapeutico accurato. Il Centro Medico San Fedele offre percorsi specializzati per la diagnosi, il trattamento e la gestione di questa patologia.</p>`,
      specialisticaId: specIds[p.spec] ?? '',
      mediciIds: resolvedMediciIds,
      metaTitle: `${p.nome} | Centro Medico San Fedele`,
      metaDescription: `Diagnosi e trattamento della ${p.nome} a Longone al Segrino, Provincia di Como.`,
    })
  }
  await patBatch.commit()
  console.log(`  ✅  patologie: ${PATOLOGIE.length} documenti`)

  // 5. Seed news
  console.log('\n📝  Inserimento news...')
  const newsBatch = db.batch()
  NEWS.forEach((n, i) => {
    const ref = db.collection('news_eventi').doc()
    newsBatch.set(ref, {
      titolo: n.titolo,
      slug: slugify(n.titolo),
      corpo: n.corpo,
      categoria: n.categoria,
      autore: 'Redazione San Fedele',
      immagine: '',
      pubblicato: true,
      dataPublicazione: new Date(Date.now() - i * 7 * 24 * 60 * 60 * 1000).toISOString(),
    })
  })
  await newsBatch.commit()
  console.log(`  ✅  news_eventi: ${NEWS.length} documenti`)

  // 6. Seed convenzioni
  console.log('\n📝  Inserimento convenzioni...')
  const convBatch = db.batch()
  CONVENZIONI.forEach((c) => {
    convBatch.set(db.collection('convenzioni').doc(), c)
  })
  await convBatch.commit()
  console.log(`  ✅  convenzioni: ${CONVENZIONI.length} documenti`)

  // 7. Seed recensioni
  console.log('\n📝  Inserimento recensioni...')
  const recBatch = db.batch()
  RECENSIONI.forEach((r) => {
    recBatch.set(db.collection('recensioni_statiche').doc(), r)
  })
  await recBatch.commit()
  console.log(`  ✅  recensioni_statiche: ${RECENSIONI.length} documenti`)

  console.log('\n🎉  Seed completato con successo!\n')
  console.log('📊  Riepilogo:')
  console.log(`    • ${SPECIALISTICHE.length} specialistiche (con ${SOTTO_SPECIALISTICHE.length} sotto-specialistiche)`)
  console.log(`    • ${MEDICI.length} medici (${MEDICI.filter(m => m.suChiamata).length} su chiamata)`)
  console.log(`    • ${PATOLOGIE.length} patologie`)
  console.log(`    • ${NEWS.length} news/eventi/articoli`)
  console.log(`    • ${CONVENZIONI.length} convenzioni`)
  console.log(`    • ${RECENSIONI.length} recensioni\n`)

  process.exit(0)
}

main().catch((err) => {
  console.error('❌  Errore durante il seed:', err)
  process.exit(1)
})
