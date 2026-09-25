# Centro Medico San Fedele — Sito web


Sito istituzionale del Centro Medico San Fedele (Longone al Segrino, CO).
Stack: **Next.js 14** (App Router) · **TypeScript** · **Tailwind CSS** · **Firebase** (Firestore + Auth + Admin SDK).

## Setup locale

```bash
# 1. dipendenze
npm install

# 2. variabili d'ambiente (copia il template e compila)
cp .env.example .env.local

# 3. dev server
npm run dev
```

Il sito gira su [http://localhost:3000](http://localhost:3000)

## Struttura

- `app/(public)` — pagine pubbliche del sito
- `app/(admin)` — area amministrativa (CMS Firebase)
- `app/api` — API routes
- `components/` — componenti React condivisi
  - `ui/` — primitive (Button, Card, MelaButton, Badge…)
  - `layout/` — Header, Footer, PageHero
  - `home/` — sezioni della homepage
  - `admin/` — UI dell'area admin
- `lib/` — utility, config Firebase, SEO
- `types/` — tipi TypeScript condivisi
- `scripts/` — script di seed e manutenzione
- `public/` — asset statici

## Comandi utili

| Comando | Descrizione |
|---|---|
| `npm run dev` | Dev server |
| `npm run build` | Build di produzione |
| `npm start` | Avvia il build |
| `npm run lint` | Lint del codice |
| `npx tsc --noEmit` | Type-check |

## Deploy

L'applicazione è hostata su **Firebase App Hosting** (progetto `san-fedele-dev`, regione `europe-west4`).

**Branch strategy:**
- `dev` — sviluppo locale (`npm run dev`)
- `main` — produzione: ogni push su `main` triggera un build & deploy automatici di Firebase App Hosting

**Flusso tipico:**
1. Lavora su `dev`, commit & push
2. Quando pronto: `git checkout main && git merge dev && git push`
3. Monitora il build su [console.firebase.google.com](https://console.firebase.google.com) → App Hosting

**Variabili d'ambiente di produzione** — gestite come Secret su Google Secret Manager:
```bash
firebase apphosting:secrets:set NOME_SECRET
firebase apphosting:secrets:grantaccess NOME_SECRET --backend <BACKEND_ID>
```

Vedi `apphosting.yaml` per la lista completa di env vars e secret richiesti.

**Storage immagini** — Firebase Storage (`san-fedele-dev.appspot.com`), uploads via API `/api/upload` con Firebase Admin SDK. Niente filesystem locale in produzione.
