import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { adminAuth } from '@/lib/firebase/admin'
import { getAllHeroConfigs } from '@/lib/firebase/hero'
import { HERO_PAGE_LABELS, HERO_PAGE_SLUGS } from '@/lib/heroDefaults'
import Link from 'next/link'
import { ArrowLeft, ArrowRight, Image as ImageIcon } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function AdminHeroPage() {
  const cookieStore = cookies()
  const session = cookieStore.get('session')
  if (!session?.value) redirect('/admin/login')
  try {
    await adminAuth.verifySessionCookie(session.value, true)
  } catch {
    redirect('/admin/login')
  }

  const heroes = await getAllHeroConfigs()

  return (
    <div className="min-h-screen bg-slate-900">
      <header className="bg-slate-800 border-b border-slate-700">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center gap-3">
          <Link href="/admin/dashboard" className="text-slate-400 hover:text-primary">
            <ArrowLeft size={20} />
          </Link>
          <h1 className="font-semibold text-white">Hero pagine</h1>
          <span className="text-xs bg-primary/20 text-primary px-2 py-0.5 rounded-full">
            {HERO_PAGE_SLUGS.length} pagine
          </span>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6 sm:py-8">
        <p className="text-slate-400 text-sm mb-5 sm:mb-6">
          Modifica titolo, sottotitolo, immagine e bottoni delle intestazioni delle pagine pubbliche.
          Le modifiche compaiono entro pochi secondi dopo il salvataggio.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          {HERO_PAGE_SLUGS.map((slug) => {
            const cfg = heroes[slug]
            return (
              <Link
                key={slug}
                href={`/admin/dashboard/hero/${slug}`}
                className="group bg-slate-800 border border-slate-700 hover:border-primary/50 rounded-lg p-4 sm:p-5 transition-colors flex items-center gap-4"
              >
                <div className="relative w-16 h-12 sm:w-20 sm:h-14 flex-shrink-0 bg-slate-700 rounded overflow-hidden">
                  {cfg.immagine ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={cfg.immagine} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-500">
                      <ImageIcon size={20} />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h2 className="text-white font-semibold truncate">
                      {HERO_PAGE_LABELS[slug]}
                    </h2>
                    {cfg.pubblicato === false && (
                      <span className="text-[10px] bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded uppercase tracking-wide">
                        Disattivato
                      </span>
                    )}
                  </div>
                  <p className="text-slate-400 text-xs sm:text-sm truncate">{cfg.titolo}</p>
                  <p className="text-slate-500 text-[10px] uppercase tracking-wide mt-1">
                    Stile: {cfg.variant}
                  </p>
                </div>
                <ArrowRight
                  size={18}
                  className="text-slate-500 group-hover:text-primary transition-colors flex-shrink-0"
                />
              </Link>
            )
          })}
        </div>
      </main>
    </div>
  )
}
