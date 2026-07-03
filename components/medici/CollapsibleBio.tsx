'use client'

import { useState, useRef, useEffect } from 'react'
import { ChevronDown } from 'lucide-react'

interface Props {
  text: string
  /** Altezza in px della bio collassata */
  collapsedHeight?: number
}

export function CollapsibleBio({ text, collapsedHeight = 160 }: Props) {
  const [expanded, setExpanded] = useState(false)
  const [overflows, setOverflows] = useState(false)
  const contentRef = useRef<HTMLParagraphElement>(null)

  useEffect(() => {
    if (contentRef.current) {
      setOverflows(contentRef.current.scrollHeight > collapsedHeight + 24)
    }
  }, [text, collapsedHeight])

  return (
    <div>
      <div
        className="relative overflow-hidden transition-[max-height] duration-500 ease-in-out"
        style={{ maxHeight: expanded || !overflows ? '9999px' : `${collapsedHeight}px` }}
      >
        <p
          ref={contentRef}
          className="text-text-main/80 leading-relaxed text-base md:text-lg font-medium whitespace-pre-line"
        >
          {text}
        </p>
        {!expanded && overflows && (
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-bg-soft to-transparent" />
        )}
      </div>

      {overflows && (
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className="mt-4 inline-flex items-center gap-1.5 text-primary font-semibold hover:gap-2.5 transition-all"
          aria-expanded={expanded}
        >
          {expanded ? 'Riduci' : 'Leggi tutto'}
          <ChevronDown
            size={18}
            className={`transition-transform duration-300 ${expanded ? 'rotate-180' : ''}`}
          />
        </button>
      )}
    </div>
  )
}
