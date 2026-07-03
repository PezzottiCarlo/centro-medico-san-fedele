/**
 * Helper lato client per invalidare la cache ISR delle pagine pubbliche dopo
 * un salvataggio da admin. Best-effort: se la chiamata fallisce, la cache si
 * allinea comunque entro la finestra `revalidate` (60s) delle pagine.
 */
export async function revalidatePublic(paths: string[]): Promise<void> {
  const clean = paths.filter(Boolean)
  if (clean.length === 0) return
  try {
    await fetch('/api/admin/revalidate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ paths: clean }),
    })
  } catch {
    // ignora: la rete di sicurezza ISR a 60s copre il caso di errore
  }
}
