/**
 * RowActions - Per-row action buttons (Copy, Delete)
 * Phase 5: Row Creation
 */

import React, { useState } from 'react';
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
      <button
        className={styles.actionButton}
        onClick={() => onCopy(rowId)}
        type="button"
        title="Copy row"
      >
        <span className={styles.icon}>⎘</span>
      </button>
      <button
        className={`${styles.actionButton} ${styles.deleteButton}`}
        onClick={handleDeleteClick}
        type="button"
        title="Delete row"
      >
        <span className={styles.icon}>🗑</span>
      </button>
    </div>
  );
}
