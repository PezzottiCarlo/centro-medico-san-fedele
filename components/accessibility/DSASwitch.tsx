'use client'

import { useAccessibility } from '@/hooks/useAccessibility'
import { Eye, Type } from 'lucide-react'
import { cn } from '@/lib/utils'

export function DSASwitch({ compact = false }: { compact?: boolean }) {
  const { dsaMode, highContrast, toggleDsaMode, toggleHighContrast } = useAccessibility()

  if (compact) {
    return (
      <div className="flex items-center gap-2">
        <button
          onClick={toggleDsaMode}
          className={cn(
            'p-2 rounded-lg text-sm font-medium transition-colors',
            dsaMode ? 'bg-secondary text-white' : 'bg-muted text-text-main hover:bg-secondary/20'
          )}
          aria-pressed={dsaMode}
          title="Modalità DSA"
        >
          <Type size={16} />
        </button>
        <button
          onClick={toggleHighContrast}
          className={cn(
            'p-2 rounded-lg text-sm font-medium transition-colors',
            highContrast ? 'bg-primary text-white' : 'bg-muted text-text-main hover:bg-primary/20'
          )}
          aria-pressed={highContrast}
          title="Alto contrasto"
        >
          <Eye size={16} />
        </button>
      </div>
    )
  }

  return (
    <div className="bg-secondary/10 rounded-lg p-6">
      <h3 className="font-semibold text-text-main mb-4">Accessibilità</h3>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium text-text-main">Modalità DSA</p>
            <p className="text-sm text-gray-500">Font Lexend, spaziatura aumentata</p>
          </div>
          <button
            role="switch"
            aria-checked={dsaMode}
            onClick={toggleDsaMode}
            className={cn(
              'relative w-12 h-6 rounded-full overflow-hidden transition-colors focus:outline-none focus:ring-2 focus:ring-secondary focus:ring-offset-2',
              dsaMode ? 'bg-secondary' : 'bg-gray-300'
            )}
          >
            <span
              className={cn(
                'absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all duration-200',
                dsaMode ? 'left-7' : 'left-1'
              )}
            />
          </button>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium text-text-main">Alto contrasto</p>
            <p className="text-sm text-gray-500">Maggior leggibilità del testo</p>
          </div>
          <button
            role="switch"
            aria-checked={highContrast}
            onClick={toggleHighContrast}
            className={cn(
              'relative w-12 h-6 rounded-full overflow-hidden transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2',
              highContrast ? 'bg-primary' : 'bg-gray-300'
            )}
          >
            <span
              className={cn(
                'absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all duration-200',
                highContrast ? 'left-7' : 'left-1'
              )}
            />
          </button>
        </div>
      </div>
    </div>
  )
}
