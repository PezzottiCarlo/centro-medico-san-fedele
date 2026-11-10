/**
 * Helper lato client per aggiornare le pagine pubbliche dopo un salvataggio da
 * admin. Best-effort: se la chiamata fallisce, la cache si allinea comunque
 * entro la finestra `revalidate` (60 s) delle pagine.
 *
 * Invalida sempre tutto il sito pubblico: medici, specialistiche, patologie e
 * contatti compaiono in decine di pagine (home, prenotazione, schede, footer)
 * ed elencarle a mano lasciava sempre fuori qualcosa. Le pagine si rigenerano
 * alla prima visita successiva, quindi il costo è trascurabile.
 */
export async function revalidatePublic(paths: string[] = []): Promise<void> {
  try {
    await fetch('/api/admin/revalidate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tutto: true, paths: paths.filter(Boolean) }),
    })
  } catch {
    // ignora: la rete di sicurezza ISR a 60s copre il caso di errore
  }
}
