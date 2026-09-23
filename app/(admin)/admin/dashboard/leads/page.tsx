import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { adminAuth, adminDb } from '@/lib/firebase/admin'
import type { Lead } from '@/types'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { LeadsList } from '@/components/admin/LeadsList'

export const dynamic = 'force-dynamic'

export default async function LeadsPage() {
  const cookieStore = cookies()
  const session = cookieStore.get('session')
  if (!session?.value) redirect('/admin/login')
  try {
    await adminAuth.verifySessionCookie(session.value, true)
  } catch {
    redirect('/admin/login')
  }

  let leads: Lead[] = []
  try {
    const snap = await adminDb.collection('leads').get()
    leads = snap.docs
      .map((d) => ({ id: d.id, ...(d.data() as Omit<Lead, 'id'>) }))
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
  } catch {
    /* empty */
  }

  // Il conteggio "da evadere" lo mostra LeadsList, che resta aggiornato in tempo reale
  return (
    <div className="min-h-screen bg-slate-900">
      <header className="bg-slate-800 border-b border-slate-700">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center gap-3">
          <Link href="/admin/dashboard" className="text-slate-400 hover:text-primary">
            <ArrowLeft size={20} />
          </Link>
          <h1 className="font-semibold text-white">Leads &amp; Prenotazioni</h1>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-6 sm:py-8">
        <LeadsList initial={leads} />
      </main>
    </div>
  )
}
