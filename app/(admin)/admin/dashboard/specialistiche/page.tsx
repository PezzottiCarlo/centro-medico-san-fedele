import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { adminAuth, adminDb } from '@/lib/firebase/admin'
import type { Specialistica } from '@/types'
import Link from 'next/link'
import { ArrowLeft, Plus } from 'lucide-react'
import {
  SpecialisticheOrdinabili,
  type SpecialisticaRiga,
} from '@/components/admin/SpecialisticheOrdinabili'

export const dynamic = 'force-dynamic'

export default async function AdminSpecialistichePage() {
  const cookieStore = cookies()
  const session = cookieStore.get('session')
  if (!session?.value) redirect('/admin/login')
  try { await adminAuth.verifySessionCookie(session.value, true) } catch { redirect('/admin/login') }

  // Ordinate da adminDb per `order` e poi nome (vedi lib/firebase/admin.ts). Non
  // con `orderBy('order')`: escluderebbe le specialistiche senza quel campo.
  const snap = await adminDb.collection('specialistiche').get()
  const specialistiche: SpecialisticaRiga[] = snap.docs.map((d) => {
    const data = d.data() as Omit<Specialistica, 'id'>
    return {
      id: d.id,
      nome: data.nome,
      slug: data.slug,
      icona: data.icona,
      pubblicata: data.pubblicata,
    }
  })

  return (
    <div className="min-h-screen bg-slate-900">
      <header className="bg-slate-800 border-b border-slate-700">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/admin/dashboard" className="text-slate-400 hover:text-primary">
              <ArrowLeft size={20} />
            </Link>
            <h1 className="font-semibold text-white">Specialistiche</h1>
          </div>
          <Link href="/admin/dashboard/specialistiche/nuovo" className="btn-primary flex items-center gap-2 text-sm">
            <Plus size={16} /> Nuova specialistica
          </Link>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8">
        <SpecialisticheOrdinabili iniziali={specialistiche} />
      </main>
    </div>
  )
}
