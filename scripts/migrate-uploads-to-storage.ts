/**
 * Migrazione immagini locali da public/uploads/ a Firebase Storage.
 *
 * 1. Cammina ricorsivamente public/uploads/<folder>/* e raccoglie tutti i file
 * 2. Carica ogni file su Firebase Storage al path <folder>/<filename> (mantenendo il nome)
 * 3. Costruisce mapping { "/uploads/folder/file.ext": "https://storage.googleapis.com/.../folder/file.ext" }
 * 4. Walka tutte le collezioni Firestore e sostituisce ogni occorrenza di "/uploads/..." nelle stringhe
 *    (campi singoli + HTML in descrizioni/biografie tramite regex)
 * 5. Stampa report dettagliato
 *
 * Uso:
 *   npm run migrate-uploads -- --dry-run      (default, nessuna scrittura)
 *   npm run migrate-uploads -- --execute      (esegue upload + update Firestore)
 *   npm run migrate-uploads -- --only-upload  (solo upload, non tocca Firestore)
 */

import * as path from 'path'
import * as fs from 'fs'
import { loadEnvConfig } from '@next/env'

loadEnvConfig(path.resolve(__dirname, '..'))

import { initializeApp, getApps, cert } from 'firebase-admin/app'
import { getFirestore } from 'firebase-admin/firestore'
import { getStorage } from 'firebase-admin/storage'

// ── Args ─────────────────────────────────────────────────────
const args = process.argv.slice(2)
const isDryRun = !args.includes('--execute')
const onlyUpload = args.includes('--only-upload')

// ── Init Firebase Admin ──────────────────────────────────────
const privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, '\n')
const bucketName = process.env.FIREBASE_STORAGE_BUCKET || process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET

if (!process.env.FIREBASE_ADMIN_PROJECT_ID || !privateKey) {
  console.error('❌  Credenziali Firebase Admin mancanti. Controlla .env.local')
  process.exit(1)
}

if (!bucketName) {
  console.error('❌  FIREBASE_STORAGE_BUCKET mancante in .env.local')
  process.exit(1)
}

const migrateApp =
  getApps().find((a) => a.name === 'migrate') ??
  initializeApp(
    {
      credential: cert({
        projectId: process.env.FIREBASE_ADMIN_PROJECT_ID,
        clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
        privateKey,
      }),
      storageBucket: bucketName,
    },
    'migrate'
  )

const db = getFirestore(migrateApp)
const bucket = getStorage(migrateApp).bucket()

// ── 1. Walk public/uploads/ ──────────────────────────────────
const UPLOADS_ROOT = path.resolve(__dirname, '..', 'public', 'uploads')

type FileEntry = { absPath: string; folder: string; filename: string; localUrl: string }

function walkUploads(): FileEntry[] {
  const result: FileEntry[] = []
  if (!fs.existsSync(UPLOADS_ROOT)) {
    console.warn(`⚠️   ${UPLOADS_ROOT} non esiste — nulla da migrare`)
    return result
  }
  const folders = fs.readdirSync(UPLOADS_ROOT, { withFileTypes: true })
  for (const fd of folders) {
    if (!fd.isDirectory()) continue
    const folderPath = path.join(UPLOADS_ROOT, fd.name)
    const files = fs.readdirSync(folderPath, { withFileTypes: true })
    for (const f of files) {
      if (!f.isFile()) continue
      result.push({
        absPath: path.join(folderPath, f.name),
        folder: fd.name,
        filename: f.name,
        localUrl: `/uploads/${fd.name}/${f.name}`,
      })
    }
  }
  return result
}

// ── Content-type detection ────────────────────────────────────
function contentTypeFor(filename: string): string {
  const ext = path.extname(filename).toLowerCase()
  switch (ext) {
    case '.jpg':
    case '.jpeg':
      return 'image/jpeg'
    case '.png':
      return 'image/png'
    case '.webp':
      return 'image/webp'
    case '.gif':
      return 'image/gif'
    case '.svg':
      return 'image/svg+xml'
    case '.pdf':
      return 'application/pdf'
    default:
      return 'application/octet-stream'
  }
}

// ── 2. Upload to Firebase Storage ────────────────────────────
async function uploadFile(entry: FileEntry): Promise<string> {
  const remotePath = `${entry.folder}/${entry.filename}`
  const remoteUrl = `https://storage.googleapis.com/${bucket.name}/${remotePath}`

  if (isDryRun) return remoteUrl

  const buffer = fs.readFileSync(entry.absPath)
  const fileRef = bucket.file(remotePath)
  await fileRef.save(buffer, { metadata: { contentType: contentTypeFor(entry.filename) } })
  await fileRef.makePublic()
  return remoteUrl
}

// ── 3. Firestore deep-replace ────────────────────────────────
type Mapping = Map<string, string>

function replaceInValue(value: unknown, mapping: Mapping): { changed: boolean; value: unknown } {
  if (typeof value === 'string') {
    let changed = false
    let next = value
    const pairs = Array.from(mapping.entries())
    for (let i = 0; i < pairs.length; i++) {
      const [local, remote] = pairs[i]
      if (next.includes(local)) {
        next = next.split(local).join(remote)
        changed = true
      }
    }
    return { changed, value: next }
  }
  if (Array.isArray(value)) {
    let changed = false
    const next = value.map((v) => {
      const r = replaceInValue(v, mapping)
      if (r.changed) changed = true
      return r.value
    })
    return { changed, value: next }
  }
  if (value && typeof value === 'object') {
    let changed = false
    const next: Record<string, unknown> = {}
    for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
      const r = replaceInValue(v, mapping)
      if (r.changed) changed = true
      next[k] = r.value
    }
    return { changed, value: next }
  }
  return { changed: false, value }
}

const COLLECTIONS = [
  'specialistiche',
  'medici',
  'patologie',
  'news_eventi',
  'convenzioni',
  'recensioni_statiche',
  'storia_eventi',
  'riconoscimenti',
]

async function updateFirestore(mapping: Mapping): Promise<{ scanned: number; updated: number }> {
  let scanned = 0
  let updated = 0

  for (const coll of COLLECTIONS) {
    const snap = await db.collection(coll).get()
    for (const doc of snap.docs) {
      scanned++
      const data = doc.data()
      const r = replaceInValue(data, mapping)
      if (!r.changed) continue
      updated++
      console.log(`  📝  ${coll}/${doc.id} — aggiornati riferimenti /uploads/`)
      if (!isDryRun) {
        await doc.ref.set(r.value as Record<string, unknown>, { merge: false })
      }
    }
  }
  return { scanned, updated }
}

// ── Main ─────────────────────────────────────────────────────
async function main() {
  console.log(`\n🚀 Migrazione upload — modalità: ${isDryRun ? 'DRY-RUN' : 'EXECUTE'}${onlyUpload ? ' (solo upload)' : ''}`)
  console.log(`   Bucket: ${bucket.name}\n`)

  const entries = walkUploads()
  console.log(`📂 Trovati ${entries.length} file in public/uploads/`)

  const mapping: Mapping = new Map()
  let uploaded = 0
  let uploadFailed = 0
  const mappingForFile: Record<string, string> = {}

  for (const e of entries) {
    try {
      const remoteUrl = await uploadFile(e)
      mapping.set(e.localUrl, remoteUrl)
      mappingForFile[e.localUrl] = remoteUrl
      uploaded++
      if (uploaded % 10 === 0 || uploaded === entries.length) {
        console.log(`  ⬆️   upload ${uploaded}/${entries.length}`)
      }
    } catch (err) {
      uploadFailed++
      console.error(`  ❌  ${e.localUrl}:`, (err as Error).message)
    }
  }

  console.log(`\n✅ Upload completati: ${uploaded}/${entries.length}${uploadFailed ? ` (${uploadFailed} falliti)` : ''}`)

  // Salva mapping su disco per riferimento manuale
  const mappingPath = path.join(__dirname, 'uploads-mapping.json')
  fs.writeFileSync(mappingPath, JSON.stringify(mappingForFile, null, 2))
  console.log(`📄 Mapping salvato in scripts/uploads-mapping.json`)

  if (onlyUpload) {
    console.log(`\n🛑 --only-upload: salto aggiornamento Firestore`)
    return
  }

  console.log(`\n🔍 Scansione Firestore per riferimenti /uploads/...`)
  const { scanned, updated } = await updateFirestore(mapping)
  console.log(`\n📊 Firestore: scansionati ${scanned} doc, aggiornati ${updated}`)

  if (isDryRun) {
    console.log(`\n💡 DRY-RUN: niente è stato realmente scritto. Esegui con --execute per applicare.`)
  } else {
    console.log(`\n🎉 Migrazione completata. Verifica le immagini sul sito poi puoi cancellare public/uploads/`)
  }
}

main().catch((err) => {
  console.error('❌  Errore fatale:', err)
  process.exit(1)
})
