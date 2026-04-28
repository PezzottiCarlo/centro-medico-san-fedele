import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { adminAuth, adminDb } from '@/lib/firebase/admin'
import type { NewsEvento } from '@/types'
import { formatDate } from '@/lib/utils'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowLeft, Plus, Edit2 } from 'lucide-react'

async function getNews(): Promise<NewsEvento[]> {
  try {
    const snap = await adminDb.collection('news_eventi').get()
    const news = snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<NewsEvento, 'id'>) }))
    return news.sort((a, b) => new Date(b.dataPublicazione).getTime() - new Date(a.dataPublicazione).getTime())
  } catch {
    return []
  }
}

export default async function AdminNewsPage() {
  const cookieStore = cookies()
  const session = cookieStore.get('session')
  if (!session?.value) redirect('/admin/login')
  try { await adminAuth.verifySessionCookie(session.value, true) } catch { redirect('/admin/login') }

  const news = await getNews()

  return (
    <div className="min-h-screen bg-slate-900">
      <header className="bg-slate-800 border-b border-slate-700">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/admin/dashboard" className="text-slate-400 hover:text-primary">
              <ArrowLeft size={20} />
            </Link>
            <h1 className="font-semibold text-white">News & Articoli</h1>
            <span className="text-xs bg-primary/20 text-primary px-2 py-0.5 rounded-full">
              {news.length} totali
            </span>
          </div>
          <Link href="/admin/dashboard/news/nuovo" className="btn-primary flex items-center gap-2 text-sm">
            <Plus size={16} /> Nuovo articolo
          </Link>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-slate-800 rounded-lg border border-slate-700 overflow-hidden">
          <table className="w-full">
            <thead className="bg-slate-800/50 border-b border-slate-700">
              <tr>
                <th className="text-left px-6 py-3 text-xs font-medium text-slate-400 uppercase tracking-wider">Titolo</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-slate-400 uppercase tracking-wider hidden md:table-cell">Data</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-slate-400 uppercase tracking-wider hidden md:table-cell">Stato</th>
                <th className="text-right px-6 py-3 text-xs font-medium text-slate-400 uppercase tracking-wider">Azioni</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/50">
              {news.map((n) => (
                <tr key={n.id} className="hover:bg-slate-700/30 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      {n.immagine && (
                        <Image src={n.immagine} alt="" width={48} height={36} className="rounded object-cover w-12 h-9" />
                      )}
                      <div>
                        <p className="font-medium text-white">{n.titolo}</p>
                        <span className="text-xs text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                          {n.categoria}
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 hidden md:table-cell text-sm text-slate-400">
                    {formatDate(n.dataPublicazione)}
                  </td>
                  <td className="px-6 py-4 hidden md:table-cell">
                    <span className={`text-xs px-2 py-1 rounded-full ${n.pubblicato ? 'bg-green-500/10 text-green-400' : 'bg-slate-600 text-slate-400'}`}>
                      {n.pubblicato ? 'Pubblicato' : 'Bozza'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <Link
                      href={`/admin/dashboard/news/${n.id}`}
                      className="inline-flex items-center gap-1 text-primary text-sm hover:text-primary/80 transition-colors"
                    >
                      <Edit2 size={14} /> Modifica
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {news.length === 0 && (
            <div className="text-center py-12 text-slate-500">
              <p>Nessun articolo. Creane uno!</p>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
