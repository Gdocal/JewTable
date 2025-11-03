/**
 * DraggableRow - Wrapper for draggable table rows
 * Phase 6: Drag & Drop
 */

import React from 'react';
import { useSortable, defaultAnimateLayoutChanges } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { AnimateLayoutChanges } from '@dnd-kit/sortable';
import styles from './DraggableRow.module.css';

interface DraggableRowProps {
  id: string;
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  isDragDisabled?: boolean;
}

// Custom animation that ensures smooth transitions
const animateLayoutChanges: AnimateLayoutChanges = (args) => {
  const { isSorting, wasDragging } = args;

  // Always animate when not currently sorting (includes the drop animation)
  if (!isSorting) {
    return true;
  }

  // Use default behavior during active sorting
  return defaultAnimateLayoutChanges(args);
};

export function DraggableRow({ id, children, className, style, isDragDisabled }: DraggableRowProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id,
    disabled: isDragDisabled,
    animateLayoutChanges,
    transition: {
      duration: 200,
      easing: 'ease',
    },
  });

  const rowStyle: React.CSSProperties = {
    ...style,
    // Don't apply transform to original row - DragOverlay handles visual representation
    transform: isDragging ? undefined : CSS.Transform.toString(transform),
    transition: isDragging ? undefined : (transition || 'transform 200ms ease'),
    // Hide original row completely during drag - DragOverlay shows the visual
    opacity: isDragging ? 0 : 1,
  };

  return (
    <tr
      ref={setNodeRef}
      className={`${className || ''} ${isDragging ? styles.dragging : ''}`}
      style={rowStyle}
      {...attributes}
      data-draggable-listeners={listeners ? 'true' : 'false'}
    >
      {children}
    </tr>
  );
}
