import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim()
}

export function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('it-IT', {
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
