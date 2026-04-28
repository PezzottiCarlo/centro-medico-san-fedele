import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { adminAuth, adminDb } from '@/lib/firebase/admin'
import type { StoriaEvento, Riconoscimento } from '@/types'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowLeft, Plus, Edit2 } from 'lucide-react'

async function getStoria() {
  try {
    const [eventiSnap, riconoscimentiSnap] = await Promise.all([
      adminDb.collection('storia_eventi').orderBy('order', 'asc').get(),
      adminDb.collection('riconoscimenti').get(),
    ])
    const eventi = eventiSnap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<StoriaEvento, 'id'>) }))
    const riconoscimenti = riconoscimentiSnap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Riconoscimento, 'id'>) }))
    return { eventi, riconoscimenti }
  } catch {
    return { eventi: [], riconoscimenti: [] }
  }
}

export default async function AdminStoriaPage() {
  const cookieStore = cookies()
  const session = cookieStore.get('session')
  if (!session?.value) redirect('/admin/login')
  try { await adminAuth.verifySessionCookie(session.value, true) } catch { redirect('/admin/login') }

  const { eventi, riconoscimenti } = await getStoria()

  return (
    <div className="min-h-screen bg-slate-900">
      <header className="bg-slate-800 border-b border-slate-700">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/admin/dashboard" className="text-slate-400 hover:text-primary">
              <ArrowLeft size={20} />
            </Link>
            <h1 className="font-semibold text-white">Storia</h1>
            <span className="text-xs bg-primary/20 text-primary px-2 py-0.5 rounded-full">
              {eventi.length + riconoscimenti.length} elementi
            </span>
          </div>
          <Link href="/admin/dashboard/storia/nuovo" className="btn-primary flex items-center gap-2 text-sm">
            <Plus size={16} /> Nuovo elemento
          </Link>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8 space-y-8">
        {/* Timeline Events */}
        <div>
          <h2 className="text-lg font-semibold text-white mb-4">Timeline</h2>
          <div className="bg-slate-800 rounded-lg border border-slate-700 overflow-hidden">
            <table className="w-full">
              <thead className="bg-slate-800/50 border-b border-slate-700">
                <tr>
                  <th className="text-left px-6 py-3 text-xs font-medium text-slate-400 uppercase tracking-wider">Anno</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-slate-400 uppercase tracking-wider">Titolo</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-slate-400 uppercase tracking-wider hidden md:table-cell">Stato</th>
                  <th className="text-right px-6 py-3 text-xs font-medium text-slate-400 uppercase tracking-wider">Azioni</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/50">
                {eventi.map((e) => (
                  <tr key={e.id} className="hover:bg-slate-700/30 transition-colors">
                    <td className="px-6 py-4">
                      <span className="text-primary font-bold">{e.anno}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        {e.immagine && (
                          <Image src={e.immagine} alt="" width={48} height={36} className="rounded object-cover w-12 h-9" />
                        )}
                        <span className="font-medium text-white">{e.titolo}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 hidden md:table-cell">
                      <span className={`text-xs px-2 py-1 rounded-full ${e.pubblicato ? 'bg-green-500/10 text-green-400' : 'bg-slate-600 text-slate-400'}`}>
                        {e.pubblicato ? 'Pubblicato' : 'Bozza'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link
                        href={`/admin/dashboard/storia/${e.id}`}
                        className="inline-flex items-center gap-1 text-primary text-sm hover:text-primary/80 transition-colors"
                      >
                        <Edit2 size={14} /> Modifica
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {eventi.length === 0 && (
              <div className="text-center py-12 text-slate-500">
                <p>Nessun evento nella timeline. Creane uno!</p>
              </div>
            )}
          </div>
        </div>

        {/* Riconoscimenti */}
        <div>
          <h2 className="text-lg font-semibold text-white mb-4">Riconoscimenti e Premi</h2>
          <div className="bg-slate-800 rounded-lg border border-slate-700 overflow-hidden">
            <table className="w-full">
              <thead className="bg-slate-800/50 border-b border-slate-700">
                <tr>
                  <th className="text-left px-6 py-3 text-xs font-medium text-slate-400 uppercase tracking-wider">Anno</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-slate-400 uppercase tracking-wider">Titolo</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-slate-400 uppercase tracking-wider hidden md:table-cell">Stato</th>
                  <th className="text-right px-6 py-3 text-xs font-medium text-slate-400 uppercase tracking-wider">Azioni</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/50">
                {riconoscimenti.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-700/30 transition-colors">
                    <td className="px-6 py-4">
                      <span className="text-primary font-bold">{r.anno}</span>
                    </td>
                    <td className="px-6 py-4 font-medium text-white">{r.titolo}</td>
                    <td className="px-6 py-4 hidden md:table-cell">
                      <span className={`text-xs px-2 py-1 rounded-full ${r.pubblicato ? 'bg-green-500/10 text-green-400' : 'bg-slate-600 text-slate-400'}`}>
                        {r.pubblicato ? 'Pubblicato' : 'Bozza'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link
                        href={`/admin/dashboard/storia/${r.id}?tipo=riconoscimento`}
                        className="inline-flex items-center gap-1 text-primary text-sm hover:text-primary/80 transition-colors"
                      >
                        <Edit2 size={14} /> Modifica
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {riconoscimenti.length === 0 && (
              <div className="text-center py-12 text-slate-500">
                <p>Nessun riconoscimento. Creane uno!</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
