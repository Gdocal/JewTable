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

  // Helper function to check if target is a resize handle
  const isResizeHandle = (target: EventTarget | null): boolean => {
    if (!target || !(target instanceof HTMLElement)) return false;

    // Check if the target or any parent has the resize handle class
    let element: HTMLElement | null = target;
    while (element) {
      if (element.className && typeof element.className === 'string' &&
          element.className.includes('resizeHandle')) {
        return true;
      }
      // Check parent, but stop at the th element
      if (element.tagName === 'TH') break;
      element = element.parentElement;
    }
    return false;
  };

  // Wrap listeners to prevent drag on resize handle
  const wrappedListeners = React.useMemo(() => {
    if (!listeners || disabled) return listeners;

    const wrapped: any = {};
    Object.keys(listeners).forEach((key) => {
      wrapped[key] = (e: any) => {
        // Check if this is a resize handle - if so, don't start drag
        if (isResizeHandle(e.target)) {
          return;
        }
        // Otherwise, call the original listener
        listeners[key](e);
      };
    });
    return wrapped;
  }, [listeners, disabled]);

  return (
    <th
      ref={setNodeRef}
      className={className}
      style={headerStyle}
      {...attributes}
      {...wrappedListeners}
      onClick={handleClick}
    >
      {children}
    </th>
  );
}
