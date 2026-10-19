'use client'

import {
  closestCenter,
  DndContext,
  type DragEndEvent,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import {
  arrayMove,
  rectSortingStrategy,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import type { CSSProperties, ReactNode } from 'react'

function SortableItem({ id, className, children }: { id: string; className?: string; children: (handle: ReactNode, dragging: boolean) => ReactNode }) {
  const { attributes, listeners, setNodeRef, setActivatorNodeRef, transform, transition, isDragging } = useSortable({ id })
  const style: CSSProperties = { transform: CSS.Transform.toString(transform), transition }
  const handle = (
    <button type="button" className="handle" ref={setActivatorNodeRef} {...attributes} {...listeners} aria-label="Drag to reorder">
      <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true">
        <circle cx="4" cy="3" r="1.2" fill="currentColor" />
        <circle cx="10" cy="3" r="1.2" fill="currentColor" />
        <circle cx="4" cy="7" r="1.2" fill="currentColor" />
        <circle cx="10" cy="7" r="1.2" fill="currentColor" />
        <circle cx="4" cy="11" r="1.2" fill="currentColor" />
        <circle cx="10" cy="11" r="1.2" fill="currentColor" />
      </svg>
    </button>
  )
  return (
    <div ref={setNodeRef} style={style} className={`${className ?? ''}${isDragging ? ' dragging' : ''}`}>
      {children(handle, isDragging)}
    </div>
  )
}

export default function SortableList<T extends { id: string }>({
  items,
  onReorder,
  renderItem,
  itemClassName,
  layout = 'list',
  className = 'rows',
}: {
  items: T[]
  onReorder: (next: T[]) => void
  renderItem: (item: T, handle: ReactNode, index: number) => ReactNode
  itemClassName?: string
  layout?: 'list' | 'grid'
  className?: string
}) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  )

  const onDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    if (!over || active.id === over.id) return
    const from = items.findIndex((item) => item.id === active.id)
    const to = items.findIndex((item) => item.id === over.id)
    if (from < 0 || to < 0) return
    onReorder(arrayMove(items, from, to))
  }

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
      <SortableContext items={items.map((item) => item.id)} strategy={layout === 'grid' ? rectSortingStrategy : verticalListSortingStrategy}>
        <div className={className}>
          {items.map((item, index) => (
            <SortableItem key={item.id} id={item.id} className={itemClassName}>
              {(handle) => renderItem(item, handle, index)}
            </SortableItem>
          ))}
        </div>
      </SortableContext>
    </DndContext>
  )
}
