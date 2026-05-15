# Centro Medico San Fedele — Documentazione Tecnica Completa

> Aggiornata al 27 aprile 2026 — refactor relazione medico↔sotto-specialistica + redesign pagina medico + nuovo hero scroll-reveal.

---

## 1. Stack Tecnologico

| Componente | Tecnologia |
|---|---|
| Framework | Next.js 14 (App Router) |
| Linguaggio | TypeScript |
| Stili | Tailwind CSS |
| Backend | Firebase (Firestore, Storage, Auth, Hosting) |
| Rich Editor | TipTap |
| Email | Nodemailer (SMTP Gmail) |
| Icone | Lucide React |
| Validazione | Zod (form prenotazione) |

---

## 2. Struttura del Progetto

```
san-fedele/
├── app/
│   ├── (public)/              # Pagine pubbliche
│   │   ├── page.tsx           # Home
│   │   ├── ambulatori/[slug]/ # Dettaglio specialistica
│   │   ├── medici/[slug]/     # Profilo medico
│   │   ├── patologie/[slug]/  # Dettaglio patologia
│   │   ├── news/[slug]/       # Articolo/news
│   │   ├── prenota/           # Form prenotazione 3 step
│   │   ├── sport/             # Medicina sportiva (tema scuro)
│   │   ├── dsa/               # Supporto DSA
│   │   ├── servizi/           # Panoramica servizi
│   │   ├── convenzioni/       # Convenzioni assicurative
│   │   ├── chi-siamo/         # Chi siamo
│   │   ├── storia/            # Timeline storia
│   │   ├── dove-siamo/        # Mappa e contatti
│   │   ├── contatti/          # Form contatti
│   │   ├── lavora-con-noi/    # Lavora con noi
│   │   ├── privacy/           # Privacy policy
│   │   └── cookie-policy/     # Cookie
│   ├── (admin)/admin/         # Area amministrativa
│   │   ├── login/             # Login Firebase Auth
│   │   └── dashboard/
│   │       ├── page.tsx        # Dashboard con statistiche
│   │       ├── medici/         # CRUD medici
│   │       ├── specialistiche/ # CRUD specialistiche
│   │       ├── patologie/      # CRUD patologie
│   │       ├── news/           # CRUD news/eventi/articoli
│   │       ├── convenzioni/    # CRUD convenzioni
│   │       ├── leads/          # Gestione prenotazioni
│   │       ├── recensioni/     # Moderazione recensioni
│   │       └── storia/         # Timeline storia
│   └── api/
│       ├── prenota/            # POST — salva lead + invia email
│       ├── auth/session/       # POST/DELETE — session cookies
│       ├── upload/             # POST — upload immagini Firebase Storage
│       ├── reviews/            # GET — Google Places + fallback statico
│       └── sitemap.xml/        # GET — sitemap dinamica
├── components/
│   ├── prenota/PrenotaForm.tsx # Form 3 step (click = avanza)
│   ├── admin/RichEditor.tsx    # Editor HTML TipTap
│   ├── admin/ImageUpload.tsx   # Upload Firebase Storage
│   ├── home/                   # Componenti homepage
│   └── accessibility/          # DSASwitch + Provider
├── lib/
│   ├── firebase/admin.ts       # Firebase Admin SDK
│   ├── firebase/client.ts      # Firebase Client SDK
│   ├── firebase/collections.ts # Query helper Firestore
│   ├── utils.ts                # slugify, formatDate, cn
│   ├── seo.ts                  # Metadata + JSON-LD
│   └── email.ts                # Template email notifica
├── hooks/
│   ├── useAccessibility.ts     # DSA mode + high contrast
│   └── useSearch.ts            # Ricerca client-side
├── types/index.ts              # Tutti i modelli TypeScript
├── scripts/seed-firestore.ts   # Script seeding database
└── docs/ARCHITETTURA.md        # Questa documentazione
```

---

## 3. Modello Dati Firestore

### 3.1 `specialistiche`

Collezione principale delle macro-aree mediche del centro.

```typescript
interface Specialistica {
  id: string
  slug: string              // URL-friendly
  nome: string
  descrizione: string       // HTML
  descrizioneBreve: string  // per le card
  icona: string             // emoji
  metaTitle: string
  metaDescription: string
  order: number             // ordinamento display
  pubblicata?: boolean
  categoria?: 'fisioterapia' | 'specialistica_medica'
  sottoSpecialistiche?: SottoSpecialistica[]
}
```

**Specialistiche di default (6):**
1. Elettroterapia (`elettroterapia`)
2. Fisioterapia e Riabilitazione (`fisioterapia-riabilitazione`)
3. Specialistica Medica (`specialistica-medica`)
4. Esami Diagnostici (`esami-diagnostici`)
5. Medicina Sportiva (`medicina-sportiva`) — **NUOVA**
6. Altri Servizi (`altri-servizi`)

### 3.2 `sottoSpecialistiche` (array embedded in specialistica)

Le sotto-specialistiche sono **etichette pure**: la relazione N:N coi medici vive su `Medico.sottoSpecialisticheIds[]` (single source of truth).

```typescript
interface SottoSpecialistica {
  id: string
  nome: string
  descrizione?: string  // breve descrizione mostrata nel modale sulla pagina specialistica
}
```

Sulla pagina `/ambulatori/[slug]` le sotto-specialistiche sono renderizzate come card cliccabili (`SottoSpecialisticheSection`, client component): il click apre un modale con la `descrizione` e un bottone "Prenota" (`MelaButton`) che porta a `/prenota?specialistica=<slug>&sottoSpecialistica=<id>`.

**Per trovare i medici di una sotto-spec**:
```ts
medici.filter(m => m.sottoSpecialisticheIds.includes(sotto.id))
```

### 3.3 `medici`

```typescript
interface Medico {
  id: string
  slug: string
  nome: string
  foto: string
  bio: string
  curriculum: string              // HTML
  mansione?: string               // sottotitolo: es. "Cardiologo", "Fisioterapista"
  specialisticheIds: string[]     // N:N con specialistiche (aree)
  sottoSpecialisticheIds: string[] // N:N con sotto-spec (terapie specifiche)
  patologieIds: string[]
  orari: Orario[]                 // vuoto se suChiamata=true
  telefono?: string
  email?: string
  pubblicato?: boolean
  suChiamata?: boolean            // medico esterno, solo su appuntamento
}

interface Orario {
  giorno: string
  ore: string
  tipo: 'appuntamento' | 'fisso'
}
```

**Cambiamento chiave — `suChiamata`:**
- `true` = medico esterno che opera in sede **solo se necessario**, senza orario fisso. L'admin NON mostra la sezione orari.
- `false` = medico con orari settimanali regolari (fissi o su appuntamento).

**Medici di default (12):**

| Medico | Specialita | suChiamata |
|---|---|---|
| Dott. Marco Colombo | Medico Internista | No |
| Dott.ssa Laura Ferretti | Cardiologa | No |
| Dott. Alessio Brambilla | Fisioterapista | No |
| Dott.ssa Giulia Fontana | Neurologa | Si |
| Dott. Roberto Manzoni | Ortopedico | Si |
| Dott.ssa Chiara Valli | Ginecologa | Si |
| Dott. Federico Sala | Dermatologo | Si |
| Dott.ssa Anna Ricci | Psicologa | No |
| Dott. Luca Cattaneo | Fisioterapista | No |
| Dott.ssa Marta Negri | Endocrinologa | Si |
| Dott. Paolo Moretti | Medico dello Sport | No |
| Dott.ssa Elena Marchetti | Nutrizionista Sportiva | No |

### 3.4 `patologie`

```typescript
interface Patologia {
  id: string
  slug: string
  nome: string
  descrizione: string        // HTML
  specialisticaId: string    // FK → specialistica
  mediciIds: string[]        // medici che trattano questa patologia
  metaTitle: string
  metaDescription: string
  immagine?: string
}
```

### 3.5 `news_eventi`

```typescript
interface NewsEvento {
  id: string
  slug: string
  titolo: string
  corpo: string              // HTML
  categoria: 'news' | 'evento' | 'articolo'
  dataPublicazione: string   // ISO string
  autore: string
  immagine?: string
  pubblicato: boolean
}
```

### 3.6 `leads`

Richieste di prenotazione dal form pubblico.

```typescript
interface Lead {
  id: string
  nome: string
  cognome?: string
  telefono: string
  email: string
  messaggio: string
  specialistica?: string
  sottoSpecialistica?: string
  medico?: string
  timestamp: string
  letto: boolean
  fonte: 'form'
}
```

### 3.7 `convenzioni`

```typescript
interface Convenzione {
  id: string
  nome: string
  logo?: string
  url?: string
  attiva: boolean
  descrizione?: string
}
```

### 3.8 `recensioni_statiche`

```typescript
interface RecensioneStatica {
  id: string
  autore: string
  testo: string
  stelle: number    // 1-5
  data: string
  fonte: 'google' | 'editoriale'
}
```

### 3.9 `storia_eventi` e `riconoscimenti`

Gestiti nell'admin, usati per la pagina "La nostra storia".

---

## 4. Relazioni tra Entita

```
specialistiche
  └── sottoSpecialistiche[] (embedded — solo {id, nome})

medici
  ├── specialisticheIds[] ──→ specialistiche (N:N — aree)
  ├── sottoSpecialisticheIds[] ──→ sottoSpecialistiche (N:N — terapie specifiche)
  └── patologieIds[] ──→ patologie (N:N)

patologie
  ├── specialisticaId ──→ specialistiche (N:1)
  └── mediciIds[] ──→ medici (N:N)

leads
  ├── specialistica (slug) ──→ specialistiche
  └── medico (slug) ──→ medici
```

---

## 5. Area Admin

### 5.1 Gestione Medici

**Form creazione/modifica medico:**
- Dati base: nome, slug, telefono, email, foto (upload)
- Biografia (textarea) e Curriculum (HTML textarea)
- Specialistiche: selezione multipla con checkbox e icone
- **Disponibilita:**
  - Toggle "Solo su appuntamento" (`suChiamata`)
  - Se attivo: nessuna sezione orari visibile (medico esterno)
  - Se disattivo: sezione "Orari settimanali" con giorno/ore/tipo
- Stato pubblicazione (toggle)

### 5.2 Gestione Specialistiche

**Form creazione/modifica specialistica:**
- Dati: nome, slug, icona (emoji), ordine, descrizione breve, descrizione HTML (TipTap)
- SEO: metaTitle, metaDescription
- **Sotto-specialistiche:**
  - Nome sotto-specialistica
  - **Medici abbinati**: selezione multipla con chip/tag cliccabili (non piu dropdown singolo)
  - Ogni sotto-specialistica puo avere 0, 1 o piu medici
- Stato pubblicazione (toggle)

### 5.3 Form Prenotazione (`/prenota`)

**Fino a 4 step — click diretto avanza:**
1. **Scegli specialistica** → click avanza
2. **Scegli sotto-specialistica** (solo se la specialistica ne ha) → click avanza, oppure "Salta"
3. **Scegli medico** (opzionale) → mostra solo i medici compatibili:
   - Se scelta sotto-specialistica: solo medici in `mediciIds` della sotto-spec E con `suChiamata === false`
   - Se nessuna sotto-specialistica: tutti i medici della specialistica con `suChiamata === false`
   - Se nessun medico disponibile: lo step viene saltato automaticamente con messaggio informativo
4. **Dati personali** → nome, cognome, telefono, email, messaggio → invio

Nessuna selezione di default. Se arriva con query params (`?specialistica=xxx&medico=yyy`), salta agli step successivi. La navigazione indietro tiene traccia degli step saltati.

---

## 6. Pagina Medicina Sportiva (`/sport`)

Design completamente diverso dal resto del sito:
- **Tema scuro** (bg-slate-950, testi bianchi)
- **Colore accent**: emerald/teal (verde energizzante)
- **Hero grande** con gradient, badge animato, CTA bold
- **Barra statistiche**: 500+ certificazioni, 98% soddisfazione, 15+ discipline, 48h referto
- **Cards servizi**: certificazioni, valutazione funzionale, nutrizione sportiva
- **Sezione "Perche noi"**: checklist con icone verdi
- **Grid medici sportivi**: avatar con ring emerald
- **CTA finale**: gradient emerald con pattern geometrico

---

## 7. Seeding Database

Eseguire con `npm run seed`. Popola:
- 6 specialistiche con 27 sotto-specialistiche
- 12 medici (5 su chiamata, 7 con orari fissi)
- 12 patologie con medici abbinati
- 10 news/eventi/articoli
- 8 convenzioni
- 7 recensioni

Le sotto-specialistiche vengono create con riferimenti reali agli ID medici (risolti dopo il seed dei medici).

---

## 8. Autenticazione

- Firebase Auth con session cookie HTTP-only (5 giorni)
- Login: `/admin/login`
- Middleware protegge `/admin/*`
- API: `POST /api/auth/session` (crea), `DELETE /api/auth/session` (logout)

---

## 9. Accessibilita (DSA)

- Toggle DSA Mode → font OpenDyslexic, spaziatura aumentata
- Toggle High Contrast → colori ad alto contrasto
- Stato persistito in localStorage
- Pagina dedicata `/dsa`
- Hook: `useAccessibility()`

---

## 10. Infrastruttura

- **Firebase project**: `san-fedele-dev`
- **Hosting**: Firebase **App Hosting** (Next.js 14 nativo — SSR + API routes + middleware)
- **Regione**: `europe-west4` (Belgio)
- **Storage**: Firebase Storage (`san-fedele-dev.firebasestorage.app`, regione `us-east1`) — immagini medici, patologie, specialistiche, convenzioni, storia, news
- **Email**: SMTP Gmail (env vars `EMAIL_HOST/PORT/USER/PASS/TO` come secret; mail definitiva da decidere col cliente)
- **Costi stimati**: 4-8 EUR/mese (mostly free tier)

### Deploy workflow

| Branch | Ruolo |
|---|---|
| `dev` | Sviluppo locale e push remoto. Nessun deploy automatico. |
| `main` | Produzione. **Push → deploy automatico** App Hosting. |
| `prod` | Backup storico pre-migrazione (verrà rimosso dopo stabilizzazione). |

**Flusso:** lavora su `dev` → `git checkout main && git merge dev && git push` → App Hosting builda e deploya.

### Configurazione App Hosting

- `apphosting.yaml` — runtime, env vars, lista secret
- `firebase.json` — punta a regole Firestore + Storage
- `.firebaserc` — collega il repo al progetto `san-fedele-dev`
- `firestore.rules` — lettura pubblica per contenuti pubblici, scrittura solo via Admin SDK
- `storage.rules` — lettura pubblica per asset immagine, scrittura solo via Admin SDK

### Secret richiesti su Google Secret Manager

`NEXT_PUBLIC_FIREBASE_API_KEY`, `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`, `NEXT_PUBLIC_FIREBASE_APP_ID`, `EMAIL_HOST`, `EMAIL_PORT`, `EMAIL_USER`, `EMAIL_PASS`, `EMAIL_TO`.

Le credenziali Admin SDK NON sono più secret in produzione: App Hosting usa Application Default Credentials tramite il SA `firebase-app-hosting-compute@san-fedele-dev` (ruoli `Cloud Datastore User` + `Firebase Admin SDK Administrator Service Agent`). In sviluppo locale si continua a usare `FIREBASE_ADMIN_CLIENT_EMAIL` + `FIREBASE_ADMIN_PRIVATE_KEY` da `.env.local` (vedi [lib/firebase/admin.ts](../lib/firebase/admin.ts)).

Comandi:
```bash
firebase apphosting:secrets:set <NAME>
firebase apphosting:secrets:grantaccess <NAME> --backend <BACKEND_ID>
```

### Migrazione immagini locali → Firebase Storage

```bash
# Anteprima
npm run migrate-uploads -- --dry-run

# Esecuzione (upload + update Firestore)
npm run migrate-uploads -- --execute
```

Script in `scripts/migrate-uploads-to-storage.ts`. Mapping salvato in `scripts/uploads-mapping.json`.

---

## 11ter. Chatbot contestuale "MelaBot" (14-15 maggio 2026)

Chatbot AI che risponde **solo** dai contenuti del sito e resta sempre aggiornato senza pipeline di sincronizzazione.

**Architettura:**
- `POST /api/chat` (`runtime = 'nodejs'`, `dynamic = 'force-dynamic'`): valida con Zod `{ messages: {role,content}[] }`, rate limit best-effort per-IP (15/min), compone knowledge base + system prompt, chiama l'LLM, ritorna `{ success, reply }`.
- `lib/chatbot/knowledgeBase.ts`: legge `specialistiche/medici/patologie/news_eventi/convenzioni` via `adminDb`, le compila in testo semplice (HTML stripped, campi lunghi troncati), cache in memoria TTL 5 min. Freschezza automatica: nessun vector DB.
- `lib/chatbot/systemPrompt.ts`: persona "MelaBot", grounding rule, guardrail medico, gestione fuori-tema. Obbliga il modello a usare markdown leggero con link interni cliccabili (`[testo](/percorso)`).
- `lib/chatbot/llm.ts`: wrapper isolato — Google Gemini via **Vertex AI**, SDK `@google/genai` (il vecchio `@google-cloud/vertexai` è deprecato). Modello e regione configurabili via env `VERTEX_MODEL` (default `gemini-flash-latest`) e `VERTEX_LOCATION` (default `global`). Auth dual-mode come `lib/firebase/admin.ts`: ADC in produzione, `FIREBASE_ADMIN_*` in locale. Cambiare provider = riscrivere solo questo file.
- `components/ChatbotButton.tsx`: bot rinominato in MelaBot; le risposte sono renderizzate via `react-markdown` (link rosso brand, target=_blank su esterni, niente HTML grezzo, protocolli `javascript:`/`vbscript:` filtrati di default).
- `lib/siteConfig.ts`: aggiunto `CENTER_INFO` (nome, telefono, indirizzo, orari) — fonte unica.

**Setup IAM richiesto** (l'API Vertex deve essere abilitata + il SA deve avere `roles/aiplatform.user`):
- Abilitare `aiplatform.googleapis.com` (Firebase Console > Build > AI Logic, o `gcloud services enable`).
- Ruolo **"Vertex AI User"** (`roles/aiplatform.user`) a **due** service account: `firebase-app-hosting-compute@san-fedele-dev` (produzione) **e** il SA di `FIREBASE_ADMIN_CLIENT_EMAIL` usato in locale. NB: "Vertex AI Service Agent" NON basta — è un ruolo per SA Google-managed.
- Env in `apphosting.yaml`: `GCLOUD_PROJECT`, `VERTEX_LOCATION`, `VERTEX_MODEL` (solo `value:`, nessun secret).

---

## 11bis. Changelog Modifiche (14 maggio 2026)

### Modifiche al modello dati
- `SottoSpecialistica.descrizione?: string` **aggiunto** — breve descrizione per terapia/sotto-specialistica

### Modifiche UI Admin
- **Form specialistiche** (`nuovo` e `[id]`): ogni sotto-specialistica ora ha una textarea "Breve descrizione" oltre al nome

### Modifiche UI Pubblica
- **Pagina /ambulatori/[slug]**: nuova sezione "Prestazioni e terapie" che mostra le sotto-specialistiche come card cliccabili (`components/specialistiche/SottoSpecialisticheSection.tsx`, client component). Click → modale con la descrizione + `MelaButton` "Prenota una visita"
- **PrenotaForm**: gestisce il query param `sottoSpecialistica` (id). Se presente, salta direttamente allo step "medico" (o "dati" se nessun medico con orario fisso), preselezionando la sotto-specialistica
- Keyframes `modalFade` / `modalPop` aggiunti in `globals.css`

---

## 11. Changelog Modifiche (27 aprile 2026)

### Modifiche al modello dati
- `SottoSpecialistica.mediciIds[]` **rimosso** (non più necessario)
- `Medico.sottoSpecialisticheIds: string[]` **aggiunto** (single source of truth N:N medico↔terapia)
- `Medico.mansione?: string` **aggiunto** (sottotitolo medico — es. "Cardiologo")

### Modifiche UI Admin
- **Form medici**: campo "Mansione" sotto telefono/email; nuovo blocco "Terapie / Sotto-specialistiche" mostra le sotto-spec raggruppate per specialistica selezionata
- **Form specialistiche**: rimosso il picker medici da ogni sotto-spec; in modifica appaiono come chip read-only cliccabili che linkano alla scheda medico
- **Header sticky** in tutte le pagine di add/edit (medici, specialistiche, patologie, news, convenzioni, storia, recensioni) — il bottone Salva resta sempre visibile

### Modifiche UI Pubblica
- **Pagina /medici/[slug]**: nuovo layout — foto sx, nome+mansione+aree+contatti in alto a destra (top allineato), box orari in basso a destra (bottom allineato col bordo inferiore della foto). Sotto, sezione "Terapie e prestazioni" con cards stile home (icona spec + categoria + nome terapia)
- **Home Hero**: rimosso il popup zoom. Sticky 200vh con scroll-reveal pulito: bg pulito → sale dal basso "La tua salute, la nostra missione" (testo solo) → appaiono i due bottoni minimal "Chiamaci ora" e "Chatta ora" (WhatsApp)
- **PrenotaForm** e **/sport**: query medici-per-sotto-spec invertita su `medico.sottoSpecialisticheIds`

### Modifiche Seeding
- Seed mantiene gli stessi 6 specialistiche / 27 sotto-spec / 12 medici / 12 patologie / 10 news / 8 convenzioni / 7 recensioni
- I medici ora ricevono `mansione` (= specialità) e `sottoSpecialisticheIds` risolti dai nomi sotto-spec
- Le sotto-spec embedded perdono `mediciIds`

---

## 12. Changelog Storico (27 marzo 2026)

### Modifiche al modello dati
- `SottoSpecialistica.medicoId` (singolo, opzionale) → `SottoSpecialistica.mediciIds` (array, multipli)
- `Medico.suChiamata` ora usato attivamente nell'admin per nascondere la sezione orari

### Modifiche UI Admin
- **Form medici**: nuovo toggle "Solo su appuntamento" che nasconde orari quando attivo
- **Form specialistiche**: sotto-specialistiche ora hanno selettore multi-medico con chip tag

### Modifiche UI Pubblica
- **PrenotaForm**: click su opzione avanza direttamente allo step successivo, nessuna selezione di default
- **Pagina Sport**: redesign completo con tema scuro sportivo (emerald/teal)

### Modifiche Seeding
- Aggiunta specialistica "Medicina Sportiva" con sotto-specialistiche
- Aggiunti 2 medici: Dott. Paolo Moretti (Medico dello Sport), Dott.ssa Elena Marchetti (Nutrizionista Sportiva)
- 27 sotto-specialistiche con mediciIds risolti
- 12 patologie con mediciIds
- Medici esterni correttamente marcati come `suChiamata: true`
