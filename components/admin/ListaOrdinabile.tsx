'use client'

import type { CSSProperties, ReactNode } from 'react'
import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core'
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { restrictToParentElement, restrictToVerticalAxis } from '@dnd-kit/modifiers'
import { CSS } from '@dnd-kit/utilities'
import { GripVertical } from 'lucide-react'

/** Maniglia da passare al contenuto della riga: solo lei avvia il trascinamento. */
export type Maniglia = ReactNode

interface Props<T extends { id: string }> {
  elementi: T[]
  onRiordina: (nuovi: T[]) => void
  renderElemento: (elemento: T, indice: number, maniglia: Maniglia) => ReactNode
  className?: string
}

/**
 * Lista riordinabile trascinando la maniglia ⋮⋮ (mouse e dito) oppure, da
 * tastiera, con Spazio sulla maniglia + frecce + Spazio. Si trascina solo dalla
 * maniglia: i campi di testo dentro le righe restano utilizzabili.
 */
export function ListaOrdinabile<T extends { id: string }>({
  elementi,
  onRiordina,
  renderElemento,
  className = 'space-y-3',
}: Props<T>) {
  const sensori = useSensors(
    // Qualche pixel prima di partire: un clic sulla maniglia non diventa un trascinamento
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )

  function suFine({ active, over }: DragEndEvent) {
    if (!over || active.id === over.id) return
    const da = elementi.findIndex((e) => e.id === active.id)
    const a = elementi.findIndex((e) => e.id === over.id)
    if (da < 0 || a < 0) return
    onRiordina(arrayMove(elementi, da, a))
  }

  return (
    <DndContext
      sensors={sensori}
      collisionDetection={closestCenter}
      modifiers={[restrictToVerticalAxis, restrictToParentElement]}
      onDragEnd={suFine}
      accessibility={{
        screenReaderInstructions: {
          draggable:
            'Per spostare un elemento premi Spazio, poi le frecce su e giù, poi di nuovo Spazio per lasciarlo. Esc annulla.',
        },
      }}
    >
      <SortableContext items={elementi.map((e) => e.id)} strategy={verticalListSortingStrategy}>
        <div className={className}>
          {elementi.map((elemento, indice) => (
            <RigaOrdinabile key={elemento.id} id={elemento.id}>
              {(maniglia) => renderElemento(elemento, indice, maniglia)}
            </RigaOrdinabile>
          ))}
        </div>
      </SortableContext>
    </DndContext>
  )
}

function RigaOrdinabile({ id, children }: { id: string; children: (maniglia: Maniglia) => ReactNode }) {
  const { attributes, listeners, setNodeRef, setActivatorNodeRef, transform, transition, isDragging } =
    useSortable({ id })

  const stile: CSSProperties = {
    transform: CSS.Translate.toString(transform),
    transition,
    position: 'relative',
    zIndex: isDragging ? 20 : undefined,
  }

  const maniglia = (
    <button
      type="button"
      ref={setActivatorNodeRef}
      {...attributes}
      {...listeners}
      aria-label="Trascina per spostare"
      title="Trascina per spostare"
      // touch-none: su telefono il dito trascina la riga invece di scorrere la pagina
      className="touch-none cursor-grab active:cursor-grabbing rounded p-1.5 text-slate-500 hover:text-white hover:bg-slate-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
    >
      <GripVertical size={18} />
    </button>
  )

  return (
    <div
      ref={setNodeRef}
      style={stile}
      className={`rounded-lg transition-shadow ${
        isDragging ? 'shadow-2xl shadow-black/40 ring-2 ring-primary scale-[1.01]' : ''
      }`}
    >
      {children(maniglia)}
    </div>
  )
}
