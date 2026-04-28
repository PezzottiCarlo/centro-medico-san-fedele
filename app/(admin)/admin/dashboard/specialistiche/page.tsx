import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { adminAuth, adminDb } from '@/lib/firebase/admin'
import type { Specialistica } from '@/types'
import Link from 'next/link'
import { ArrowLeft, Plus, Edit2 } from 'lucide-react'

export default async function AdminSpecialistichePage() {
  const cookieStore = cookies()
  const session = cookieStore.get('session')
  if (!session?.value) redirect('/admin/login')
  try { await adminAuth.verifySessionCookie(session.value, true) } catch { redirect('/admin/login') }

  const snap = await adminDb.collection('specialistiche').orderBy('order').get()
  const specialistiche: Specialistica[] = snap.docs.map((d) => ({
    id: d.id,
    ...(d.data() as Omit<Specialistica, 'id'>),
  }))

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
        <div className="bg-slate-800 rounded-lg border border-slate-700 overflow-hidden">
          <table className="w-full">
            <thead className="bg-slate-800/50 border-b border-slate-700">
              <tr>
                <th className="text-left px-6 py-3 text-xs font-medium text-slate-400 uppercase tracking-wider">Specialistica</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-slate-400 uppercase tracking-wider hidden md:table-cell">Ordine</th>
                <th className="text-right px-6 py-3 text-xs font-medium text-slate-400 uppercase tracking-wider">Azioni</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/50">
              {specialistiche.map((s) => (
                <tr key={s.id} className="hover:bg-slate-700/30 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{s.icona}</span>
                      <div>
                        <p className="font-medium text-white">{s.nome}</p>
                        <p className="text-xs text-slate-500">/ambulatori/{s.slug}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 hidden md:table-cell text-sm text-slate-400">{s.order}</td>
                  <td className="px-6 py-4 text-right">
                    <Link
                      href={`/admin/dashboard/specialistiche/${s.id}`}
                      className="inline-flex items-center gap-1 text-primary text-sm hover:text-primary/80 transition-colors"
                    >
                      <Edit2 size={14} /> Modifica
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {specialistiche.length === 0 && (
            <div className="text-center py-12 text-slate-500">
              <p>Nessuna specialistica.</p>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
