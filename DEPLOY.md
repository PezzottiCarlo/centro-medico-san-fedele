# Deploy Firebase App Hosting — Stato attuale e prossimi passi

> Documento di riferimento per il deploy del Centro Medico San Fedele su Firebase App Hosting.
> Tenuto aggiornato durante il processo di migrazione dal server PM2 a Firebase.

**Ultima modifica:** 2026-05-12

---

## ✅ FATTO

### Repository / codice
- [x] `main` allineato a `prod` (fast-forward, recuperati 7 commit di lavoro: dsa, prenota, email, MelaButton, contatti)
- [x] `dev` allineato a `main`
- [x] Disabilitato `core.filemode` per evitare phantom modifications su drive Z:
- [x] Commit `022e583` — setup Firebase iniziale (apphosting, rules, upload route, script migrazione, docs)
- [x] Commit `7d35931` — aggiornato bucket name a `.firebasestorage.app` (nuovo naming Firebase)
- [x] Commit successivo — regione aggiornata a `europe-west4`
- [x] Tutto pushato su `origin/dev` e `origin/main`

### File creati nel repo
- [`apphosting.yaml`](apphosting.yaml) — runtime + env vars + 10 secret per backend App Hosting
- [`firebase.json`](firebase.json) — collega rules Firestore + Storage
- [`.firebaserc`](.firebaserc) — punta al progetto `san-fedele-dev`
- [`firestore.rules`](firestore.rules) — lettura pubblica contenuti, scrittura solo via Admin SDK
- [`firestore.indexes.json`](firestore.indexes.json) — vuoto, da aggiornare se servono indici compositi
- [`storage.rules`](storage.rules) — lettura pubblica, scrittura solo via Admin SDK
- [`scripts/migrate-uploads-to-storage.ts`](scripts/migrate-uploads-to-storage.ts) — script migrazione locale → Storage

### File modificati nel repo
- [`app/api/upload/route.ts`](app/api/upload/route.ts) — rimossa logica filesystem locale, sempre Firebase Storage
- [`next.config.mjs`](next.config.mjs) — aggiunto `output: 'standalone'`
- [`.env.example`](.env.example) — aggiunte `FIREBASE_STORAGE_BUCKET` + variabili SMTP
- [`.gitignore`](.gitignore) — esclude `public/uploads/` + cache Firebase
- [`package.json`](package.json) — aggiunto script `migrate-uploads`
- [`README.md`](README.md), [`docs/ARCHITETTURA.md`](docs/ARCHITETTURA.md) — sezione Deploy documentata

### Firebase Console
- [x] Storage bucket creato (web console, "Get started")
- [x] Backend App Hosting creato (`san-fedele-app`)
- [x] GitHub connection autorizzata, repo collegato a `main`

---

## ⏳ DA FARE

### 1. Configurare i 10 secret su Google Secret Manager
Esegui **uno alla volta** (sono interattivi). Per ognuno:
- Firebase chiede il valore → incolla da `.env.local`
- Firebase chiede a quali backend dare accesso → seleziona `san-fedele-app`

```bash
firebase apphosting:secrets:set NEXT_PUBLIC_FIREBASE_API_KEY
firebase apphosting:secrets:set NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
firebase apphosting:secrets:set NEXT_PUBLIC_FIREBASE_APP_ID
firebase apphosting:secrets:set FIREBASE_ADMIN_CLIENT_EMAIL
firebase apphosting:secrets:set FIREBASE_ADMIN_PRIVATE_KEY    # ⚠️ usa --data-file (vedi sotto)
firebase apphosting:secrets:set EMAIL_HOST
firebase apphosting:secrets:set EMAIL_PORT
firebase apphosting:secrets:set EMAIL_USER
firebase apphosting:secrets:set EMAIL_PASS
firebase apphosting:secrets:set EMAIL_TO
```

> **Nota:** il codice ([lib/email.ts](lib/email.ts)) usa il prefisso `EMAIL_*` (non `SMTP_*`). Il "from" è derivato da `EMAIL_USER`, quindi non serve un secret separato. `EMAIL_TO` è il destinatario dei lead (form contatti + prenotazioni).

#### ⚠️ Attenzione `FIREBASE_ADMIN_PRIVATE_KEY`
La chiave in `.env.local` ha `\n` testuali. Vanno trasformati in newline reali. Procedura:

1. Crea un file temporaneo `key.pem` con la chiave **convertendo `\n` in vere a capo**
2. Esegui:
   ```bash
   firebase apphosting:secrets:set FIREBASE_ADMIN_PRIVATE_KEY --data-file key.pem
   ```
3. **Cancella `key.pem` subito**: `rm key.pem`

### 2. Deploy regole Firestore + Storage
```bash
firebase deploy --only firestore:rules,storage
```
(Nota: `storage`, NON `storage:rules` — quest'ultimo dà errore "Could not find rules for the following storage targets: rules").

### 3. Migrare immagini locali a Firebase Storage
Prima aggiorna `.env.local` con il nuovo bucket name:
```
FIREBASE_STORAGE_BUCKET=san-fedele-dev.firebasestorage.app
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=san-fedele-dev.firebasestorage.app
```

Poi:
```bash
npm run migrate-uploads -- --dry-run    # anteprima
npm run migrate-uploads -- --execute    # esegue upload + update Firestore
```

Verifica nella console Storage che le cartelle `convenzioni/`, `medici/`, `patologie/`, `specialistiche/`, `storia/`, `content/` siano popolate.

### 4. Primo deploy
```bash
firebase apphosting:rollouts:create san-fedele-app
```
oppure pusha qualunque commit su `main` per triggerare il deploy automatico.

### 5. Smoke test in produzione
URL emesso da Firebase (visibile in console App Hosting → Domains). Verifica:
- [ ] Homepage carica con immagini Firebase
- [ ] `/admin/login` → accesso → dashboard
- [ ] `/admin/dashboard/medici/nuovo` → upload immagine → file in Storage
- [ ] `/prenota` → form → email arriva
- [ ] `/contatti` → form → lead in Firestore
- [ ] Tutte le pagine ambulatori/medici/patologie/sport/convenzioni mostrano le immagini

### 6. Custom domain
Console Firebase → App Hosting → Domains → aggiungi `centromedicosanfedele.it` (o quello che è). Firebase emette i record DNS da inserire nel provider DNS.

### 7. Spegnimento server PM2
Quando tutto funziona da almeno 2-3 giorni:
```bash
pm2 stop san-fedele && pm2 delete san-fedele
```
E cancella branch `prod` (era backup pre-migrazione):
```bash
git branch -D prod && git push origin --delete prod
```

---

## 📋 Valori di configurazione

| Voce | Valore |
|---|---|
| Firebase Project ID | `san-fedele-dev` |
| Storage Bucket | `san-fedele-dev.firebasestorage.app` |
| Storage Region | `us-east1` (Standard, Regional) |
| App Hosting Region | `europe-west4` (Paesi Bassi) |
| App Hosting Backend Name | `san-fedele-app` |
| Branch produzione | `main` (auto-deploy on push) |
| Branch sviluppo | `dev` |
| Repo GitHub | `PezzottiCarlo/centro-medico-san-fedele` |

### Secret richiesti (8)

Valori da `.env.local`. **Admin SDK NON serve in prod** — App Hosting usa Application Default Credentials tramite il SA `firebase-app-hosting-compute@san-fedele-dev` (ruoli `Cloud Datastore User` + `Firebase Admin SDK Administrator Service Agent` + `Storage Object Viewer` già configurati). Quindi solo per la build/runtime client + email:

| Secret name | Note |
|---|---|
| `NEXT_PUBLIC_FIREBASE_API_KEY` | da console Firebase → Project Settings → Web app |
| `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | idem |
| `NEXT_PUBLIC_FIREBASE_APP_ID` | idem |
| `EMAIL_HOST`, `EMAIL_PORT`, `EMAIL_USER`, `EMAIL_PASS` | credenziali Gmail SMTP (per ora `carlo.pezzotti01@gmail.com`, cliente deciderà la mail definitiva) |
| `EMAIL_TO` | destinatario dei lead (form contatti + prenotazioni) |

I secret `FIREBASE_ADMIN_CLIENT_EMAIL` e `FIREBASE_ADMIN_PRIVATE_KEY` possono restare in Secret Manager (costano zero) ma non sono più referenziati in `apphosting.yaml`.

Le seguenti sono già impostate come `value:` (non secret) in `apphosting.yaml`:
- `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=san-fedele-dev.firebaseapp.com`
- `NEXT_PUBLIC_FIREBASE_PROJECT_ID=san-fedele-dev`
- `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=san-fedele-dev.firebasestorage.app`
- `FIREBASE_ADMIN_PROJECT_ID=san-fedele-dev`
- `FIREBASE_STORAGE_BUCKET=san-fedele-dev.firebasestorage.app`

---

## 🔧 Troubleshooting noto

### Phantom "65 file modified" su drive Z:
È solo cambio di filemode (`100755 → 100644`) tipico di Windows con drive di rete. Già sistemato con `git config core.filemode false`. Se ricapita: `git diff --raw` per confermare che siano solo cambi mode.

### Build Next.js molto lento su drive Z:
Il drive Z: (mount di rete) rende `npm run build` molto lento. Per validare modifiche TypeScript basta `node node_modules/typescript/bin/tsc --noEmit`. Eseguire build completo solo se serve verificare specificamente bundling/standalone output.

### `firebase apphosting:backends:create` → "internal error"
Quasi sempre è il warning iniziale "compute service account is still being provisioned". Aspetta 2-3 minuti e ritenta lo stesso comando.

### `firebase deploy --only storage:rules` → "Could not find rules for the following storage targets: rules"
Sintassi sbagliata. Per Firestore va `firestore:rules`, ma per Storage va solo `storage` (senza `:rules`).

---

## 🔄 Workflow normale post-deploy

```bash
# 1. lavoro su dev
git checkout dev
# ... modifiche ...
git add . && git commit -m "..."
git push origin dev

# 2. quando pronto per produzione
git checkout main
git merge dev
git push origin main
# → Firebase App Hosting builda e deploya automaticamente
# → monitora su console.firebase.google.com → App Hosting
```
