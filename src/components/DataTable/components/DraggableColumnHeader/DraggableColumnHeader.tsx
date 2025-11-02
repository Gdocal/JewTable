/**
 * DraggableColumnHeader - Wrapper for draggable table column headers
 * Phase 10.6: Column Reordering
 */

import React from 'react';
import { useSortable, defaultAnimateLayoutChanges } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { AnimateLayoutChanges } from '@dnd-kit/sortable';
import styles from './DraggableColumnHeader.module.css';

interface DraggableColumnHeaderProps {
  id: string;
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  isDragDisabled?: boolean;
  onClick?: (event: React.MouseEvent) => void;
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

export function DraggableColumnHeader({ id, children, className, style, isDragDisabled, onClick }: DraggableColumnHeaderProps) {
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

  const headerStyle: React.CSSProperties = {
    ...style,
    // Apply transform for column dragging
    transform: CSS.Transform.toString(transform),
    transition: isDragging ? undefined : (transition || 'transform 200ms ease'),
    // Slightly reduce opacity during drag to show movement
    opacity: isDragging ? 0.5 : 1,
  };

  // Prevent onClick from interfering with drag
  const handleClick = (e: React.MouseEvent) => {
    // Only trigger onClick if we're not dragging
    if (!isDragging && onClick) {
      onClick(e);
    }
  };

  return (
    <th
      ref={setNodeRef}
      className={`${className || ''} ${isDragging ? styles.dragging : ''}`}
      style={headerStyle}
      {...attributes}
      {...listeners}
      onClick={handleClick}
    >
      {children}
    </th>
  );
}
