import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { adminAuth, adminDb } from '@/lib/firebase/admin'
import type { Lead } from '@/types'
import { formatDate } from '@/lib/utils'
import Link from 'next/link'
import { ArrowLeft, Mail, Phone, MessageSquare } from 'lucide-react'

export default async function LeadsPage() {
  const cookieStore = cookies()
  const session = cookieStore.get('session')
  if (!session?.value) redirect('/admin/login')
  try { await adminAuth.verifySessionCookie(session.value, true) } catch { redirect('/admin/login') }

  let leads: Lead[] = []
  try {
    const snap = await adminDb.collection('leads').get()
    leads = snap.docs
      .map((d) => ({ id: d.id, ...(d.data() as Omit<Lead, 'id'>) }))
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
  } catch { /* empty */ }

  return (
    <div className="min-h-screen bg-slate-900">
      <header className="bg-slate-800 border-b border-slate-700">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center gap-3">
          <Link href="/admin/dashboard" className="text-slate-400 hover:text-primary">
            <ArrowLeft size={20} />
          </Link>
          <h1 className="font-semibold text-white">Leads & Prenotazioni</h1>
          <span className="text-xs bg-primary/20 text-primary px-2 py-0.5 rounded-full">
            {leads.filter((l) => !l.letto).length} non letti
          </span>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {leads.length === 0 ? (
          <div className="bg-slate-800 rounded-lg border border-slate-700 p-12 text-center text-slate-500">
            <MessageSquare size={40} className="mx-auto mb-3 opacity-30" />
            <p>Nessuna richiesta ricevuta ancora.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {leads.map((lead) => (
              <div
                key={lead.id}
                className={`bg-slate-800 rounded-lg border border-slate-700 p-5 ${!lead.letto ? 'border-l-4 border-l-primary' : ''}`}
              >
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-white">{lead.nome}</h3>
                      {!lead.letto && (
                        <span className="text-xs bg-primary/20 text-primary px-2 py-0.5 rounded-full">Nuovo</span>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-4 text-sm text-slate-400">
                      <span className="flex items-center gap-1"><Phone size={14} /> {lead.telefono}</span>
                      <span className="flex items-center gap-1"><Mail size={14} /> {lead.email}</span>
                    </div>
                    {lead.specialistica && (
                      <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full mt-2 inline-block">
                        {lead.specialistica}
                      </span>
                    )}
                    {lead.medico && (
                      <span className="text-xs bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded-full mt-2 ml-1 inline-block">
                        Medico: {lead.medico}
                      </span>
                    )}
                  </div>
                  <div className="text-right text-sm text-slate-500">
                    <p>{formatDate(lead.timestamp)}</p>
                  </div>
                </div>
                {lead.messaggio && (
                  <p className="mt-3 text-slate-300 text-sm bg-slate-700/50 rounded p-3">{lead.messaggio}</p>
                )}
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
