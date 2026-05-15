import { Award, Users, Clock, Shield } from 'lucide-react'
import type { SiteConfig } from '@/types'

// Fallback statico — usato dal chatbot e quando Firestore non ha doc site_config/main.
export const CENTER_INFO = {
  nome: 'Centro Medico San Fedele',
  telefono: '031 333 3585',
  indirizzo: 'Longone al Segrino (Como)',
  orari: 'Lun-Ven 9:00-19:30',
}

export const SITE_CONFIG_DEFAULT: SiteConfig = {
  telefono: '031 333 3585',
  telefonoE164: '+390313333585',
  whatsappE164: '+390313333585',
  email: 'info@sanfedele.it',
  indirizzo: 'Via Risorgimento, 1',
  indirizzoCompleto: 'Via Risorgimento, 1 — 22030 Longone al Segrino (CO)',
  citta: 'Longone al Segrino',
  cap: '22030',
  provincia: 'CO',
  orari: [
    { giorno: 'Lunedì – Venerdì', ore: '09:00 – 19:30' },
    { giorno: 'Sabato – Domenica', ore: 'Chiuso' },
  ],
  mapsUrl: 'https://maps.google.com/?q=Via+Risorgimento+1+Longone+al+Segrino',
}

export const SITE_STATS = [
  { icon: Award, label: 'Anni di eccellenza', value: '20+' },
  { icon: Users, label: 'Pazienti assistiti', value: '50.000+' },
  { icon: Clock, label: 'Specialistiche', value: '80+' },
  { icon: Shield, label: 'Medici specialisti', value: '30+' },
]
