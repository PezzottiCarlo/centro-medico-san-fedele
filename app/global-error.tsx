'use client'

/**
 * Ultima rete di sicurezza: un errore nel layout principale. Deve avere il suo
 * <html>, perché sostituisce anche quello del layout.
 */
export default function ErroreGlobale({ reset }: { error: Error; reset: () => void }) {
  return (
    <html lang="it">
      <body style={{ fontFamily: 'system-ui, sans-serif', padding: '4rem 1rem', textAlign: 'center', color: '#2A3642' }}>
        <h1 style={{ fontSize: '1.75rem', marginBottom: '1rem' }}>Qualcosa non ha funzionato</h1>
        <p style={{ marginBottom: '2rem' }}>
          Il sito non è riuscito a caricarsi. Riprova tra qualche istante.
        </p>
        <button
          type="button"
          onClick={reset}
          style={{ background: '#406EA0', color: '#fff', border: 0, borderRadius: 999, padding: '0.75rem 1.5rem', fontSize: '1rem', cursor: 'pointer' }}
        >
          Riprova
        </button>
      </body>
    </html>
  )
}
