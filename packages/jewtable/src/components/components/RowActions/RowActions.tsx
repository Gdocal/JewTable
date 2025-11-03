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
  onInsert: (rowId: string) => void;
  onDelete: (rowId: string) => void;
  onViewDetails?: (rowId: string) => void; // Phase 10.8: View details modal
  isNewRow?: boolean;
  enableCopy?: boolean;
  enableInsert?: boolean;
  enableDelete?: boolean;
}

export function RowActions({
  rowId,
  onCopy,
  onInsert,
  onDelete,
  onViewDetails, // Phase 10.8
  isNewRow = false,
  enableCopy = true,
  enableInsert = true,
  enableDelete = true,
}: RowActionsProps) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.preventDefault();
    setShowDeleteConfirm(true);
  };

  const handleConfirmDelete = (e: React.MouseEvent) => {
    e.preventDefault();
    onDelete(rowId);
    setShowDeleteConfirm(false);
  };

  const handleCancelDelete = (e: React.MouseEvent) => {
    e.preventDefault();
    setShowDeleteConfirm(false);
  };

  const handleCopyClick = (e: React.MouseEvent) => {
    e.preventDefault();
    onCopy(rowId);
  };

  const handleInsertClick = (e: React.MouseEvent) => {
    e.preventDefault();
    onInsert(rowId);
  };

  const handleViewDetailsClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (onViewDetails) {
      onViewDetails(rowId);
    }
  };

  if (showDeleteConfirm) {
    return (
      <div className={styles.confirmContainer}>
        <span className={styles.confirmText}>Delete?</span>
        <button
          className={styles.confirmButton}
          onMouseDown={handleConfirmDelete}
          type="button"
          title="Confirm delete"
        >
          ✓
        </button>
        <button
          className={styles.cancelButton}
          onMouseDown={handleCancelDelete}
          type="button"
          title="Cancel"
        >
          ✕
        </button>
      </div>
    );
  }

  // If no actions enabled, don't render anything
  if (!enableCopy && !enableInsert && !enableDelete) {
    return null;
  }

  return (
    <div className={styles.container}>
      {onViewDetails && (
        <Tooltip text="View details" position="top">
          <button
            className={styles.actionButton}
            onMouseDown={handleViewDetailsClick}
            type="button"
            aria-label="View details"
          >
            <svg className={styles.icon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
              <circle cx="12" cy="12" r="3" />
            </svg>
          </button>
        </Tooltip>
      )}

      {enableCopy && (
        <Tooltip text="Copy row below" position="top">
          <button
            className={styles.actionButton}
            onMouseDown={handleCopyClick}
            type="button"
            aria-label="Copy row"
          >
            <svg className={styles.icon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="9" y="9" width="13" height="13" rx="2" />
              <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
            </svg>
          </button>
        </Tooltip>
      )}

      {enableInsert && (
        <Tooltip text="Insert blank row below" position="top">
          <button
            className={styles.actionButton}
            onMouseDown={handleInsertClick}
            type="button"
            aria-label="Insert blank row"
          >
            <svg className={styles.icon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
          </button>
        </Tooltip>
      )}

      {enableDelete && (
        <Tooltip text="Delete row" position="top">
          <button
            className={`${styles.actionButton} ${styles.deleteButton}`}
            onMouseDown={handleDeleteClick}
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
      )}
    </div>
  );
}
