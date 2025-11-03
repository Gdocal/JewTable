/**
 * DragHandle - Drag handle icon for row reordering
 * Phase 6: Drag & Drop
 */

import React from 'react';
import styles from './DragHandle.module.css';

interface DragHandleProps {
  listeners?: any;
  attributes?: any;
  isDragging?: boolean;
}

export function DragHandle({ listeners, attributes, isDragging = false }: DragHandleProps) {
  return (
    <div
      className={`${styles.handle} ${isDragging ? styles.dragging : ''}`}
      {...listeners}
      {...attributes}
      title="Drag to reorder"
    >
      <svg className={styles.icon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <line x1="9" y1="5" x2="9" y2="19" />
        <line x1="15" y1="5" x2="15" y2="19" />
      </svg>
    </div>
  );
}
