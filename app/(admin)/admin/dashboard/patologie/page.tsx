import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { adminAuth, adminDb } from '@/lib/firebase/admin'
import type { Patologia, Specialistica } from '@/types'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowLeft, Plus, Edit2 } from 'lucide-react'

async function getData(): Promise<{ patologie: Patologia[]; specMap: Map<string, Specialistica> }> {
  try {
    const [patSnap, specSnap] = await Promise.all([
      adminDb.collection('patologie').get(),
      adminDb.collection('specialistiche').get(),
    ])
    const patologie: Patologia[] = patSnap.docs.map((d) => ({
      id: d.id,
      ...(d.data() as Omit<Patologia, 'id'>),
    }))
    patologie.sort((a, b) => a.nome.localeCompare(b.nome))
    const specMap = new Map<string, Specialistica>(
      specSnap.docs.map((d) => [d.id, { id: d.id, ...(d.data() as Omit<Specialistica, 'id'>) }]),
    )
    return { patologie, specMap }
  } catch {
    return { patologie: [], specMap: new Map() }
  }
}

export default async function AdminPatologiePage() {
  const cookieStore = cookies()
  const session = cookieStore.get('session')
  if (!session?.value) redirect('/admin/login')
  try {
    await adminAuth.verifySessionCookie(session.value, true)
  } catch {
    redirect('/admin/login')
  }

  const { patologie, specMap } = await getData()

  return (
    <div className="min-h-screen bg-slate-900">
      <header className="bg-slate-800 border-b border-slate-700">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/admin/dashboard" className="text-slate-400 hover:text-primary">
              <ArrowLeft size={20} />
            </Link>
            <h1 className="font-semibold text-white">Patologie</h1>
            <span className="text-xs bg-primary/20 text-primary px-2 py-0.5 rounded-full">
              {patologie.length} totali
            </span>
          </div>
          <Link href="/admin/dashboard/patologie/nuovo" className="btn-primary flex items-center gap-2 text-sm">
            <Plus size={16} /> Nuova patologia
          </Link>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-slate-800 rounded-lg border border-slate-700 overflow-hidden">
          <table className="w-full">
            <thead className="bg-slate-800/50 border-b border-slate-700">
              <tr>
                <th className="text-left px-6 py-3 text-xs font-medium text-slate-400 uppercase tracking-wider">Patologia</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-slate-400 uppercase tracking-wider hidden md:table-cell">Specialistica</th>
                <th className="text-right px-6 py-3 text-xs font-medium text-slate-400 uppercase tracking-wider">Azioni</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/50">
              {patologie.map((p) => {
                const spec = specMap.get(p.specialisticaId)
                return (
                  <tr key={p.id} className="hover:bg-slate-700/30 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        {p.immagine ? (
                          <Image src={p.immagine} alt="" width={48} height={36} className="rounded object-cover w-12 h-9" />
                        ) : (
                          <div className="w-12 h-9 rounded bg-slate-700 flex items-center justify-center text-slate-500 text-xs">—</div>
                        )}
                        <div>
                          <p className="font-medium text-white">{p.nome}</p>
                          <p className="text-xs text-slate-500">/patologie/{p.slug}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 hidden md:table-cell text-sm text-slate-400">
                      {spec ? (
                        <span className="inline-flex items-center gap-1">
                          {spec.icona} {spec.nome}
                        </span>
                      ) : (
                        <span className="text-red-400 text-xs">Non assegnata</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link
                        href={`/admin/dashboard/patologie/${p.id}`}
                        className="inline-flex items-center gap-1 text-primary text-sm hover:text-primary/80 transition-colors"
                      >
                        <Edit2 size={14} /> Modifica
                      </Link>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
          {patologie.length === 0 && (
            <div className="text-center py-12 text-slate-500">
              <p>Nessuna patologia. Creane una!</p>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
