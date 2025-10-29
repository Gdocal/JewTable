/**
 * BatchActionsToolbar component
 * Phase 10.1: Toolbar for batch operations on selected rows
 */

import { useState } from 'react';
import styles from './BatchActionsToolbar.module.css';

export interface BatchActionsToolbarProps {
  selectedCount: number;
  onClearSelection: () => void;
  onBatchDelete: () => void;
  onBatchEdit?: () => void;
}

export function BatchActionsToolbar({
  selectedCount,
  onClearSelection,
  onBatchDelete,
  onBatchEdit,
}: BatchActionsToolbarProps) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleDelete = () => {
    setShowDeleteConfirm(true);
  };

  const confirmDelete = () => {
    onBatchDelete();
    setShowDeleteConfirm(false);
  };

  const cancelDelete = () => {
    setShowDeleteConfirm(false);
  };

  if (selectedCount === 0) {
    return null;
  }

  return (
    <div className={styles.toolbar}>
      <div className={styles.info}>
        <span className={styles.count}>{selectedCount}</span>
        <span className={styles.text}>
          {selectedCount === 1 ? 'row selected' : 'rows selected'}
        </span>
      </div>

      <div className={styles.actions}>
        {onBatchEdit && (
          <button
            className={`${styles.button} ${styles.editButton}`}
            onClick={onBatchEdit}
            title="Edit selected rows"
          >
            ✎ Edit
          </button>
        )}

        {!showDeleteConfirm ? (
          <button
            className={`${styles.button} ${styles.deleteButton}`}
            onClick={handleDelete}
            title="Delete selected rows"
          >
            🗑 Delete
          </button>
        ) : (
          <div className={styles.confirmGroup}>
            <span className={styles.confirmText}>Delete {selectedCount} row{selectedCount > 1 ? 's' : ''}?</span>
            <button
              className={`${styles.button} ${styles.confirmButton}`}
              onClick={confirmDelete}
              title="Confirm delete"
            >
              ✓
            </button>
            <button
              className={`${styles.button} ${styles.cancelButton}`}
              onClick={cancelDelete}
              title="Cancel delete"
            >
              ✕
            </button>
          </div>
        )}

        <button
          className={`${styles.button} ${styles.clearButton}`}
          onClick={onClearSelection}
          title="Clear selection"
        >
          Clear
        </button>
      </div>
    </div>
  );
}
