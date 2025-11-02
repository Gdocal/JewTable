/**
 * ColumnDragHandle - Drag handle for column reordering
 * Phase 10.6: Column Reordering
 *
 * This follows the same pattern as DragHandleCell for row reordering.
 * The drag handle is a small icon that users can grab to reorder columns.
 */

import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import styles from './ColumnDragHandle.module.css';

interface ColumnDragHandleProps {
  columnId: string;
  disabled?: boolean;
}

export function ColumnDragHandle({ columnId, disabled }: ColumnDragHandleProps) {
  const { attributes, listeners, isDragging } = useSortable({
    id: columnId,
    disabled,
  });

  console.log(`[${new Date().toLocaleTimeString()}] [COLUMN DRAG HANDLE]`, columnId, {
    hasListeners: !!listeners,
    disabled,
    isDragging
  });

  return (
    <div
      className={`${styles.handle} ${isDragging ? styles.dragging : ''}`}
      {...attributes}
      {...listeners}
      title="Drag to reorder column"
    >
      <svg
        width="12"
        height="12"
        viewBox="0 0 12 12"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Vertical grip dots */}
        <circle cx="4" cy="3" r="1" fill="currentColor" />
        <circle cx="8" cy="3" r="1" fill="currentColor" />
        <circle cx="4" cy="6" r="1" fill="currentColor" />
        <circle cx="8" cy="6" r="1" fill="currentColor" />
        <circle cx="4" cy="9" r="1" fill="currentColor" />
        <circle cx="8" cy="9" r="1" fill="currentColor" />
      </svg>
    </div>
  );
}
