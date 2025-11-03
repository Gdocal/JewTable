/**
 * DragHandleCell - Cell wrapper for drag handle with sortable context
 * Phase 6: Drag & Drop
 */

import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { DragHandle } from '../DragHandle/DragHandle';

interface DragHandleCellProps {
  rowId: string;
}

export function DragHandleCell({ rowId }: DragHandleCellProps) {
  const { attributes, listeners, isDragging } = useSortable({ id: rowId });

  return <DragHandle attributes={attributes} listeners={listeners} isDragging={isDragging} />;
}
