import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { adminAuth, adminDb } from '@/lib/firebase/admin'
import type { Medico } from '@/types'
import Link from 'next/link'
import { ArrowLeft, Plus, Edit2 } from 'lucide-react'
import Image from 'next/image'

export default async function AdminMediciPage() {
  const cookieStore = cookies()
  const session = cookieStore.get('session')
  if (!session?.value) redirect('/admin/login')
  try { await adminAuth.verifySessionCookie(session.value, true) } catch { redirect('/admin/login') }

  const snap = await adminDb.collection('medici').get()
  const medici: Medico[] = snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Medico, 'id'>) }))

  return (
    <div className="min-h-screen bg-slate-900">
      <header className="bg-slate-800 border-b border-slate-700">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/admin/dashboard" className="text-slate-400 hover:text-primary">
              <ArrowLeft size={20} />
            </Link>
            <h1 className="font-semibold text-white">Gestione Medici</h1>
            <span className="text-xs bg-primary/20 text-primary px-2 py-0.5 rounded-full">
              {medici.length} totali
            </span>
          </div>
          <Link href="/admin/dashboard/medici/nuovo" className="btn-primary flex items-center gap-2 text-sm">
            <Plus size={16} /> Aggiungi medico
          </Link>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-slate-800 rounded-lg border border-slate-700 overflow-hidden">
          <table className="w-full">
            <thead className="bg-slate-800/50 border-b border-slate-700">
              <tr>
                <th className="text-left px-6 py-3 text-xs font-medium text-slate-400 uppercase tracking-wider">Medico</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-slate-400 uppercase tracking-wider hidden md:table-cell">Stato</th>
                <th className="text-right px-6 py-3 text-xs font-medium text-slate-400 uppercase tracking-wider">Azioni</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/50">
              {medici.map((m) => (
                <tr key={m.id} className="hover:bg-slate-700/30 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      {m.foto ? (
                        <Image src={m.foto} alt={m.nome} width={40} height={40} className="rounded-full object-cover" />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                          {m.nome.charAt(0)}
                        </div>
                      )}
                      <div>
                        <p className="font-medium text-white">{m.nome}</p>
                        <p className="text-xs text-slate-500">/medici/{m.slug}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 hidden md:table-cell">
                    <span className={`text-xs px-2 py-1 rounded-full ${m.pubblicato ? 'bg-green-500/10 text-green-400' : 'bg-slate-600 text-slate-400'}`}>
                      {m.pubblicato ? 'Pubblicato' : 'Bozza'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <Link
                      href={`/admin/dashboard/medici/${m.id}`}
                      className="inline-flex items-center gap-1 text-primary text-sm hover:text-primary/80 transition-colors"
                    >
                      <Edit2 size={14} /> Modifica
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {medici.length === 0 && (
            <div className="text-center py-12 text-slate-500">
              <p>Nessun medico aggiunto.</p>
              <Link href="/admin/dashboard/medici/nuovo" className="text-primary text-sm hover:underline mt-2 inline-block">
                Aggiungi il primo medico →
              </Link>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
