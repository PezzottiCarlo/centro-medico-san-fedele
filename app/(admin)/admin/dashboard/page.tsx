import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { adminAuth, adminDb } from '@/lib/firebase/admin'
import Link from 'next/link'
import Image from 'next/image'
import { Users, FileText, Stethoscope, MessageSquare, Star, Building2, History, HeartPulse } from 'lucide-react'
import { LogoutButton } from '@/components/admin/LogoutButton'

async function getStats() {
  try {
    const [mediciSnap, newsSnap, leadsSnap, specSnap, convSnap, recSnap, storiaSnap, ricSnap, patSnap] = await Promise.all([
      adminDb.collection('medici').get(),
      adminDb.collection('news_eventi').get(),
      adminDb.collection('leads').get(),
      adminDb.collection('specialistiche').get(),
      adminDb.collection('convenzioni').where('attiva', '==', true).get(),
      adminDb.collection('recensioni_statiche').get(),
      adminDb.collection('storia_eventi').get(),
      adminDb.collection('riconoscimenti').get(),
      adminDb.collection('patologie').get(),
    ])
    const unreadLeads = leadsSnap.docs.filter((d) => !d.data().letto).length
    return {
      medici: mediciSnap.size,
      news: newsSnap.size,
      leads: leadsSnap.size,
      unreadLeads,
      spec: specSnap.size,
      convenzioni: convSnap.size,
      recensioni: recSnap.size,
      storia: storiaSnap.size + ricSnap.size,
      patologie: patSnap.size,
    }
  } catch {
    return { medici: 0, news: 0, leads: 0, unreadLeads: 0, spec: 0, convenzioni: 0, recensioni: 0, storia: 0, patologie: 0 }
  }
}

export default async function DashboardPage() {
  const cookieStore = cookies()
  const session = cookieStore.get('session')

  if (!session?.value) redirect('/admin/login')

  try {
    await adminAuth.verifySessionCookie(session.value, true)
  } catch {
    redirect('/admin/login')
  }

  const stats = await getStats()

  const cards = [
    { label: 'Medici', value: stats.medici, icon: Users, href: '/admin/dashboard/medici', color: 'bg-blue-500/10 text-blue-400' },
    { label: 'Specialistiche', value: stats.spec, icon: Stethoscope, href: '/admin/dashboard/specialistiche', color: 'bg-emerald-500/10 text-emerald-400' },
    { label: 'Patologie', value: stats.patologie, icon: HeartPulse, href: '/admin/dashboard/patologie', color: 'bg-pink-500/10 text-pink-400' },
    { label: 'News & Articoli', value: stats.news, icon: FileText, href: '/admin/dashboard/news', color: 'bg-violet-500/10 text-violet-400' },
    { label: 'Leads', value: stats.leads, icon: MessageSquare, href: '/admin/dashboard/leads', color: 'bg-amber-500/10 text-amber-400', badge: stats.unreadLeads },
    { label: 'Convenzioni', value: stats.convenzioni, icon: Building2, href: '/admin/dashboard/convenzioni', color: 'bg-cyan-500/10 text-cyan-400' },
    { label: 'Recensioni', value: stats.recensioni, icon: Star, href: '/admin/dashboard/recensioni', color: 'bg-rose-500/10 text-rose-400' },
    { label: 'Storia', value: stats.storia, icon: History, href: '/admin/dashboard/storia', color: 'bg-orange-500/10 text-orange-400' },
  ]

  return (
    <div className="min-h-screen bg-slate-900">
      {/* Admin header */}
      <header className="bg-slate-800 border-b border-slate-700">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Image
              src="/logo-san-fedele.png"
              alt="Centro Medico San Fedele"
              width={32}
              height={32}
              className="rounded-full object-cover"
            />
            <div>
              <span className="font-semibold text-white text-sm">Centro Medico San Fedele</span>
              <span className="text-slate-500 text-xs ml-2">Admin</span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/" className="text-sm text-slate-400 hover:text-primary transition-colors" target="_blank">
              Vedi sito →
            </Link>
            <LogoutButton />
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-white">Dashboard</h1>
          <p className="text-slate-400 text-sm mt-1">Panoramica del centro medico</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {cards.map((c) => (
            <Link
              key={c.label}
              href={c.href}
              className="bg-slate-800 rounded-lg border border-slate-700 hover:border-slate-600 transition-all p-5 flex items-center gap-4 group"
            >
              <div className={`p-3 rounded-lg ${c.color}`}>
                <c.icon size={22} />
              </div>
              <div className="flex-1">
                <div className="text-2xl font-bold text-white">
                  {c.value}
                  {c.badge ? (
                    <span className="ml-2 text-xs bg-red-500/20 text-red-400 px-2 py-0.5 rounded-full">
                      {c.badge} nuovi
                    </span>
                  ) : null}
                </div>
                <div className="text-slate-400 text-sm">{c.label}</div>
              </div>
              <span className="text-slate-600 group-hover:text-slate-400 transition-colors">→</span>
            </Link>
          ))}
        </div>
      </main>
    </div>
  )
}
