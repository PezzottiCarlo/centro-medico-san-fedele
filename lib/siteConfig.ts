import { Award, Users, Clock, Shield } from 'lucide-react'

// Dati di contatto del centro — fonte unica condivisa da chatbot, knowledge base e UI
export const CENTER_INFO = {
  nome: 'Centro Medico San Fedele',
  telefono: '031 333 3585',
  indirizzo: 'Longone al Segrino (Como)',
  orari: 'Lun-Ven 9:00-19:30',
}

export const SITE_STATS = [
  { icon: Award, label: 'Anni di eccellenza', value: '20+' },
  { icon: Users, label: 'Pazienti assistiti', value: '50.000+' },
  { icon: Clock, label: 'Specialistiche', value: '80+' },
  { icon: Shield, label: 'Medici specialisti', value: '30+' },
]
