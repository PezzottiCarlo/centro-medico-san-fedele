import { initializeApp, getApps, App } from 'firebase-admin/app'
import { getFirestore, Firestore } from 'firebase-admin/firestore'
import { getAuth, Auth } from 'firebase-admin/auth'
import { cert } from 'firebase-admin/app'

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

// Lazy proxies for convenience — throw only when actually called
export const adminDb = new Proxy({} as Firestore, {
  get(_target, prop) {
    const db = getAdminDb()
    const value = (db as unknown as Record<string | symbol, unknown>)[prop]
    return typeof value === 'function' ? value.bind(db) : value
  },
})

export const adminAuth = new Proxy({} as Auth, {
  get(_target, prop) {
    const auth = getAdminAuth()
    const value = (auth as unknown as Record<string | symbol, unknown>)[prop]
    return typeof value === 'function' ? value.bind(auth) : value
  },
})
