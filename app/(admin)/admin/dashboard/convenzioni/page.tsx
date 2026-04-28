import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { adminAuth, adminDb } from '@/lib/firebase/admin'
import type { Convenzione } from '@/types'
import Link from 'next/link'
import { ArrowLeft, Plus } from 'lucide-react'
import { ConvenzioniList } from '@/components/admin/ConvenzioniList'

export default async function AdminConvenzioniPage() {
  const cookieStore = cookies()
  const session = cookieStore.get('session')
  if (!session?.value) redirect('/admin/login')
  try { await adminAuth.verifySessionCookie(session.value, true) } catch { redirect('/admin/login') }

  const snap = await adminDb.collection('convenzioni').orderBy('nome').get()
  const convenzioni: Convenzione[] = snap.docs.map((d) => ({
    id: d.id,
    ...(d.data() as Omit<Convenzione, 'id'>),
  }))

  return (
    <div className="min-h-screen bg-slate-900">
      <header className="bg-slate-800 border-b border-slate-700">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/admin/dashboard" className="text-slate-400 hover:text-primary">
              <ArrowLeft size={20} />
            </Link>
            <h1 className="font-semibold text-white">Convenzioni</h1>
            <span className="text-xs bg-primary/20 text-primary px-2 py-0.5 rounded-full">
              {convenzioni.filter((c) => c.attiva).length} attive
            </span>
          </div>
          <Link href="/admin/dashboard/convenzioni/nuovo" className="btn-primary flex items-center gap-2 text-sm">
            <Plus size={16} /> Nuova convenzione
          </Link>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-slate-800 rounded-lg border border-slate-700 overflow-hidden">
          <ConvenzioniList initial={convenzioni} />
        </div>
      </main>
    </div>
  )
}
