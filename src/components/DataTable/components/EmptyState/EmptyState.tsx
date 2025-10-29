/**
 * EmptyState - Empty table state with optional CTA
 * Phase 5: Row Creation (Improved UX)
 */

import React from 'react';
import styles from './EmptyState.module.css';

interface EmptyStateProps {
  onAddRow?: () => void;
  enableRowCreation?: boolean;
  isReadOnly?: boolean;
  message?: string;
}

export function EmptyState({
  onAddRow,
  enableRowCreation = true,
  isReadOnly = false,
  message = 'No data available',
}: EmptyStateProps) {
  const showAddButton = enableRowCreation && !isReadOnly && onAddRow;

  return (
    <div className={styles.emptyState}>
      <div className={styles.iconContainer}>
        <svg className={styles.icon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <rect x="3" y="3" width="18" height="18" rx="2" />
          <line x1="9" y1="9" x2="15" y2="9" />
          <line x1="9" y1="15" x2="15" y2="15" />
        </svg>
      </div>

      <p className={styles.message}>{message}</p>

      {showAddButton ? (
        <button
          className={styles.addButton}
          onClick={onAddRow}
          type="button"
        >
          <svg className={styles.buttonIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          <span>Add Your First Row</span>
        </button>
      ) : isReadOnly ? (
        <p className={styles.hint}>This table is read-only</p>
      ) : null}
    </div>
  );
}
