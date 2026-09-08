import { initializeApp, getApps, App } from 'firebase-admin/app'
import {
  getFirestore,
  Firestore,
  type CollectionReference,
  type DocumentData,
  type Query,
  type QueryDocumentSnapshot,
  type QuerySnapshot,
} from 'firebase-admin/firestore'
import { getAuth, Auth } from 'firebase-admin/auth'
import { cert } from 'firebase-admin/app'
import { compareMedicoNames } from '@/lib/medici'

let adminApp: App | null = null

export function getAdminApp(): App {
  if (adminApp) return adminApp

  if (getApps().find((a) => a.name === 'admin')) {
    adminApp = getApps().find((a) => a.name === 'admin')!
    return adminApp
  }

  const projectId = process.env.FIREBASE_ADMIN_PROJECT_ID
  if (!projectId) {
    throw new Error('FIREBASE_ADMIN_PROJECT_ID not configured.')
  }

  const storageBucket = process.env.FIREBASE_STORAGE_BUCKET
  const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL
  const rawKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY
  const hasExplicitKey = !!rawKey && !!clientEmail

  if (hasExplicitKey) {
    // Local development: explicit service account credentials from .env.local
    const privateKey = rawKey!.replace(/\\n/g, '\n')
    adminApp = initializeApp(
      {
        credential: cert({ projectId, clientEmail, privateKey }),
        ...(storageBucket && { storageBucket }),
      },
      'admin'
    )
  } else {
    // Production (Firebase App Hosting / Cloud Run): Application Default Credentials
    // from the runtime service account (firebase-app-hosting-compute@...).
    adminApp = initializeApp(
      {
        projectId,
        ...(storageBucket && { storageBucket }),
      },
      'admin'
    )
  }

  return adminApp
}

export function getAdminDb(): Firestore {
  return getFirestore(getAdminApp())
}

export function getAdminAuth(): Auth {
  return getAuth(getAdminApp())
}

// ── Ordinamento alfabetico dei medici ─────────────────────────
//
// Le pagine leggono la collection `medici` direttamente da `adminDb`, ognuna con
// la propria query. Invece di aggiungere un ordinamento in ciascuna, lo si applica
// una volta sola qui: `adminDb.collection('medici')` restituisce una Query avvolta
// che riordina lo snapshot al momento della `.get()`. Serve un ordinamento in
// memoria perché il cognome non è un campo a sé (vedi lib/medici.ts).

const MEDICI_COLLECTION = 'medici'

function isQuery(value: unknown): value is Query<DocumentData> {
  return !!value && typeof (value as Query<DocumentData>).where === 'function'
}

/** Snapshot con i `docs` riordinati per cognome, per il resto identico. */
function sortedMediciSnapshot(snap: QuerySnapshot<DocumentData>): QuerySnapshot<DocumentData> {
  const docs = [...snap.docs].sort((a, b) =>
    compareMedicoNames(a.get('nome') as string | undefined, b.get('nome') as string | undefined)
  )
  return new Proxy(snap, {
    get(target, prop) {
      if (prop === 'docs') return docs
      if (prop === 'forEach') {
        return (cb: (doc: QueryDocumentSnapshot<DocumentData>) => void, thisArg?: unknown) =>
          docs.forEach((d) => cb.call(thisArg, d))
      }
      const value = (target as unknown as Record<string | symbol, unknown>)[prop]
      return typeof value === 'function' ? (value as (...a: unknown[]) => unknown).bind(target) : value
    },
  })
}

/**
 * Avvolge una query su `medici` propagando il wrapping ai metodi che restituiscono
 * una nuova Query (`where`, `limit`, ...), così l'ordinamento sopravvive alle
 * catene. Un `orderBy` esplicito del chiamante ha la precedenza e disattiva
 * l'ordinamento alfabetico di default.
 */
function withMediciOrder<T extends Query<DocumentData>>(q: T, explicitOrder = false): T {
  return new Proxy(q, {
    get(target, prop) {
      const value = (target as unknown as Record<string | symbol, unknown>)[prop]
      if (typeof value !== 'function') return value
      const fn = (value as (...a: unknown[]) => unknown).bind(target)

      if (prop === 'get') {
        return async (...args: unknown[]) => {
          const snap = (await fn(...args)) as QuerySnapshot<DocumentData>
          return explicitOrder ? snap : sortedMediciSnapshot(snap)
        }
      }

      return (...args: unknown[]) => {
        const result = fn(...args)
        // `doc()`, `add()`, `count()`... non sono Query: passano inalterati.
        return isQuery(result)
          ? withMediciOrder(result, explicitOrder || prop === 'orderBy')
          : result
      }
    },
  }) as T
}

// Lazy proxies for convenience — throw only when actually called
export const adminDb = new Proxy({} as Firestore, {
  get(_target, prop) {
    const db = getAdminDb()
    const value = (db as unknown as Record<string | symbol, unknown>)[prop]
    if (typeof value !== 'function') return value
    const fn = (value as (...a: unknown[]) => unknown).bind(db)

    if (prop === 'collection') {
      return (path: string, ...rest: unknown[]) => {
        const ref = fn(path, ...rest) as CollectionReference<DocumentData>
        return path === MEDICI_COLLECTION ? withMediciOrder(ref) : ref
      }
    }

    return fn
  },
})

export const adminAuth = new Proxy({} as Auth, {
  get(_target, prop) {
    const auth = getAdminAuth()
    const value = (auth as unknown as Record<string | symbol, unknown>)[prop]
    return typeof value === 'function' ? value.bind(auth) : value
  },
})
