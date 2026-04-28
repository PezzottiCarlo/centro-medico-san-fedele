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

  const privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, '\n')

  if (!process.env.FIREBASE_ADMIN_PROJECT_ID || !privateKey) {
    throw new Error('Firebase Admin credentials not configured. Set FIREBASE_ADMIN_PROJECT_ID, FIREBASE_ADMIN_CLIENT_EMAIL, and FIREBASE_ADMIN_PRIVATE_KEY in .env.local')
  }

  adminApp = initializeApp(
    {
      credential: cert({
        projectId: process.env.FIREBASE_ADMIN_PROJECT_ID,
        clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
        privateKey,
      }),
      ...(process.env.FIREBASE_STORAGE_BUCKET && {
        storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
      }),
    },
    'admin'
  )
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
