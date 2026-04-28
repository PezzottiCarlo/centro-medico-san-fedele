import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { adminAuth, adminDb } from '@/lib/firebase/admin'
import type { RecensioneStatica } from '@/types'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { RecensioniAdmin } from '@/components/admin/RecensioniAdmin'

export default async function AdminRecensioniPage() {
  const cookieStore = cookies()
  const session = cookieStore.get('session')
  if (!session?.value) redirect('/admin/login')
  try { await adminAuth.verifySessionCookie(session.value, true) } catch { redirect('/admin/login') }

  let editoriali: RecensioneStatica[] = []
  try {
    const snap = await adminDb.collection('recensioni_statiche').get()
    editoriali = snap.docs
      .map((d) => ({ id: d.id, ...(d.data() as Omit<RecensioneStatica, 'id'>) }))
      .filter((r) => r.fonte === 'editoriale')
      .sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime())
  } catch { /* empty */ }

  return (
    <div className="min-h-screen bg-slate-900">
      <header className="bg-slate-800 border-b border-slate-700">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center gap-3">
          <Link href="/admin/dashboard" className="text-slate-400 hover:text-primary">
            <ArrowLeft size={20} />
          </Link>
          <h1 className="font-semibold text-white">Recensioni</h1>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        <RecensioniAdmin editoriali={editoriali} />
      </main>
    </div>
  )
}
