/**
 * RowActions - Per-row action buttons (Copy, Delete)
 * Phase 5: Row Creation
 */

import React, { useState } from 'react';
import { Tooltip } from '../Tooltip/Tooltip';
import styles from './RowActions.module.css';

interface RowActionsProps {
  rowId: string;
  onCopy: (rowId: string) => void;
  onDelete: (rowId: string) => void;
  isNewRow?: boolean;
}

export function RowActions({
  rowId,
  onCopy,
  onDelete,
  isNewRow = false,
}: RowActionsProps) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleDeleteClick = () => {
    setShowDeleteConfirm(true);
  };

  const handleConfirmDelete = () => {
    onDelete(rowId);
    setShowDeleteConfirm(false);
  };

  const handleCancelDelete = () => {
    setShowDeleteConfirm(false);
  };

  if (showDeleteConfirm) {
    return (
      <div className={styles.confirmContainer}>
        <span className={styles.confirmText}>Delete?</span>
        <button
          className={styles.confirmButton}
          onClick={handleConfirmDelete}
          type="button"
          title="Confirm delete"
        >
          ✓
        </button>
        <button
          className={styles.cancelButton}
          onClick={handleCancelDelete}
          type="button"
          title="Cancel"
        >
          ✕
        </button>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <Tooltip text="Copy row below" position="top">
        <button
          className={styles.actionButton}
          onClick={() => onCopy(rowId)}
          type="button"
          aria-label="Copy row"
        >
          <svg className={styles.icon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="9" y="9" width="13" height="13" rx="2" />
            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
          </svg>
        </button>
      </Tooltip>

      <Tooltip text="Delete row" position="top">
        <button
          className={`${styles.actionButton} ${styles.deleteButton}`}
          onClick={handleDeleteClick}
          type="button"
          aria-label="Delete row"
        >
          <svg className={styles.icon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
            <line x1="10" y1="11" x2="10" y2="17" />
            <line x1="14" y1="11" x2="14" y2="17" />
          </svg>
        </button>
      </Tooltip>
    </div>
  );
}
