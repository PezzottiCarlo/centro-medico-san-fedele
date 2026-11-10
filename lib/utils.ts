import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * "Dell'Apprendimento " → "dell-apprendimento". Ogni carattere che non è una
 * lettera o una cifra diventa un trattino, mai ai bordi: prima uno spazio
 * finale lasciava "cardiologia-".
 */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

// Ora italiana anche sul server (che gira in UTC): altrimenti una data vicina
// alla mezzanotte usciva di un giorno diverso tra server e browser
export function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('it-IT', {
    timeZone: 'Europe/Rome',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

// Specialistiche con una pagina dedicata: /ambulatori/<slug> le reindirizza qui
export function specialisticaHref(slug: string): string {
  if (slug === 'medicina-sportiva') return '/sport'
  if (slug === 'equipe-dsa') return '/dsa'
  return `/ambulatori/${slug}`
}
