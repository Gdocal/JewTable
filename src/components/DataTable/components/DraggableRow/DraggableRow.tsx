/**
 * DraggableRow - Wrapper for draggable table rows
 * Phase 6: Drag & Drop
 */

import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import styles from './DraggableRow.module.css';

interface DraggableRowProps {
  id: string;
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  isDragDisabled?: boolean;
}

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
  });

  const rowStyle: React.CSSProperties = {
    ...style,
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
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
