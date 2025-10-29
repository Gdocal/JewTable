/**
 * TableActions - Global table actions (Add Row, etc.)
 * Phase 5: Row Creation
 */

import React from 'react';
import styles from './TableActions.module.css';

interface TableActionsProps {
  onAddRow: () => void;
  enableRowCreation?: boolean;
}

export function TableActions({
  onAddRow,
  enableRowCreation = true,
}: TableActionsProps) {
  if (!enableRowCreation) return null;

  return (
    <div className={styles.container}>
      <button
        className={styles.addButton}
        onClick={onAddRow}
        type="button"
        title="Add new row"
      >
        <span className={styles.icon}>+</span>
        <span>Add Row</span>
      </button>
    </div>
  );
}
