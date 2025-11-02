/**
 * SortableColumnHeader - Wrapper for reorderable column headers
 * Phase 10.6: Column Reordering (Option A - entire header draggable)
 */

import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface SortableColumnHeaderProps {
  id: string;
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  disabled?: boolean;
  onClick?: (event: React.MouseEvent) => void;
}

export function SortableColumnHeader({
  id,
  children,
  className,
  style,
  disabled,
  onClick
}: SortableColumnHeaderProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id,
    disabled,
  });

  console.log(`[${new Date().toLocaleTimeString()}] [SORTABLE HEADER]`, id, {
    hasListeners: !!listeners,
    disabled,
    isDragging
  });

  const headerStyle: React.CSSProperties = {
    ...style,
    transform: CSS.Transform.toString(transform),
    transition: isDragging ? undefined : (transition || 'transform 200ms ease'),
    opacity: isDragging ? 0.5 : 1,
    cursor: disabled ? (style?.cursor || 'default') : 'grab',
  };

  // Prevent onClick from interfering with drag
  const handleClick = (e: React.MouseEvent) => {
    if (!isDragging && onClick) {
      onClick(e);
    }
  };

  return (
    <th
      ref={setNodeRef}
      className={className}
      style={headerStyle}
      {...attributes}
      {...listeners}
      onClick={handleClick}
    >
      {children}
    </th>
  );
}
