'use client'

export function LogoutButton() {
  async function handleLogout() {
    await fetch('/api/auth/session', { method: 'DELETE' })
    window.location.href = '/admin/login'
  }

  return (
    <button
      type="button"
      onClick={handleLogout}
      className="text-sm text-red-400 hover:text-red-300 transition-colors"
    >
      Esci
    </button>
  )
}
