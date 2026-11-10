import type { ReactNode } from 'react'
import { richiediSessione } from '@/lib/firebase/sessione'
import { GuardiaAdmin } from '@/components/admin/GuardiaAdmin'

export const dynamic = 'force-dynamic'

/**
 * Tutte le pagine del pannello passano da qui: il cookie di sessione viene
 * verificato sul server (anche quelle "use client", che prima si aprivano con
 * qualunque cookie) e nel browser si controlla l'utente Firebase.
 */
export default async function DashboardLayout({ children }: { children: ReactNode }) {
  await richiediSessione()
  return <GuardiaAdmin>{children}</GuardiaAdmin>
}
