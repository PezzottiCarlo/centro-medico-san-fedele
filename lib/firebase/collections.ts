import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  DocumentData,
  QueryConstraint,
  Timestamp,
} from 'firebase/firestore'
import { db } from './client'
import { sortMedici } from '@/lib/medici'
import type {
  Specialistica,
  Medico,
  Patologia,
  NewsEvento,
  Lead,
  Convenzione,
  RecensioneStatica,
} from '@/types'

// ── Generic helpers ──────────────────────────────────────────

function fromDoc<T>(doc: DocumentData & { id: string }): T {
  return { id: doc.id, ...doc.data() } as T
}

// ── Specialistiche ────────────────────────────────────────────

export async function getSpecialistiche(): Promise<Specialistica[]> {
  const q = query(collection(db, 'specialistiche'), orderBy('order', 'asc'))
  const snap = await getDocs(q)
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Specialistica))
}

export async function getSpecialisticaBySlug(slug: string): Promise<Specialistica | null> {
  const q = query(collection(db, 'specialistiche'), where('slug', '==', slug), limit(1))
  const snap = await getDocs(q)
  if (snap.empty) return null
  const d = snap.docs[0]
  return { id: d.id, ...d.data() } as Specialistica
}

// ── Medici ────────────────────────────────────────────────────

export async function getMedici(filters?: QueryConstraint[]): Promise<Medico[]> {
  const constraints = [where('pubblicato', '==', true), ...(filters ?? [])]
  const q = query(collection(db, 'medici'), ...constraints)
  const snap = await getDocs(q)
  return sortMedici(snap.docs.map((d) => ({ id: d.id, ...d.data() } as Medico)))
}

export async function getMedicoBySlug(slug: string): Promise<Medico | null> {
  const q = query(collection(db, 'medici'), where('slug', '==', slug), limit(1))
  const snap = await getDocs(q)
  if (snap.empty) return null
  const d = snap.docs[0]
  return { id: d.id, ...d.data() } as Medico
}

export async function getMediciBySpecialistica(specialisticaId: string): Promise<Medico[]> {
  const q = query(
    collection(db, 'medici'),
    where('specialisticheIds', 'array-contains', specialisticaId),
    where('pubblicato', '==', true)
  )
  const snap = await getDocs(q)
  return sortMedici(snap.docs.map((d) => ({ id: d.id, ...d.data() } as Medico)))
}

// ── Patologie ─────────────────────────────────────────────────

export async function getPatologie(): Promise<Patologia[]> {
  const q = query(collection(db, 'patologie'))
  const snap = await getDocs(q)
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Patologia))
}

export async function getPatologiaBySlug(slug: string): Promise<Patologia | null> {
  const q = query(collection(db, 'patologie'), where('slug', '==', slug), limit(1))
  const snap = await getDocs(q)
  if (snap.empty) return null
  const d = snap.docs[0]
  return { id: d.id, ...d.data() } as Patologia
}

// ── News & Eventi ─────────────────────────────────────────────

export async function getNews(cat?: NewsEvento['categoria']): Promise<NewsEvento[]> {
  const constraints: QueryConstraint[] = [
    where('pubblicato', '==', true),
    orderBy('dataPublicazione', 'desc'),
  ]
  if (cat) constraints.push(where('categoria', '==', cat))
  const q = query(collection(db, 'news_eventi'), ...constraints)
  const snap = await getDocs(q)
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as NewsEvento))
}

export async function getNewsBySlug(slug: string): Promise<NewsEvento | null> {
  const q = query(collection(db, 'news_eventi'), where('slug', '==', slug), limit(1))
  const snap = await getDocs(q)
  if (snap.empty) return null
  const d = snap.docs[0]
  return { id: d.id, ...d.data() } as NewsEvento
}

// ── Leads ─────────────────────────────────────────────────────

export async function saveLead(
  data: Omit<Lead, 'id' | 'timestamp' | 'letto' | 'fonte'>
): Promise<string> {
  const ref = await addDoc(collection(db, 'leads'), {
    ...data,
    timestamp: new Date().toISOString(),
    letto: false,
    fonte: 'form',
  })
  return ref.id
}

// ── Convenzioni ───────────────────────────────────────────────

export async function getConvenzioni(): Promise<Convenzione[]> {
  const q = query(collection(db, 'convenzioni'), where('attiva', '==', true))
  const snap = await getDocs(q)
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Convenzione))
}

// ── Recensioni statiche ───────────────────────────────────────

export async function getRecensioniStatiche(): Promise<RecensioneStatica[]> {
  const q = query(collection(db, 'recensioni_statiche'), orderBy('data', 'desc'))
  const snap = await getDocs(q)
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as RecensioneStatica))
}
