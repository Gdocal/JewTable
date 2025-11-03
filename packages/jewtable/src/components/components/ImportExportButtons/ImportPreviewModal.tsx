/**
 * ImportPreviewModal - Preview CSV data before importing
 * Phase 10.9: Import/Export CSV - Preview feature
 */

import React from 'react';
import styles from './ImportPreviewModal.module.css';

interface ImportPreviewModalProps<TData> {
  data: TData[];
  columns: string[];
  onConfirm: () => void;
  onCancel: () => void;
  isOpen: boolean;
}

export function ImportPreviewModal<TData extends Record<string, any>>({
  data,
  columns,
  onConfirm,
  onCancel,
  isOpen,
}: ImportPreviewModalProps<TData>) {
  if (!isOpen) return null;

  return (
    <div className={styles.overlay} onClick={onCancel}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h2 className={styles.title}>Import Preview</h2>
          <button
            className={styles.closeButton}
            onClick={onCancel}
            aria-label="Close"
          >
            ×
          </button>
        </div>

        <div className={styles.content}>
          <div className={styles.info}>
            <p>
              <strong>{data.length}</strong> rows will be imported with{' '}
              <strong>{columns.length}</strong> columns.
            </p>
            <p className={styles.note}>
              Review the data below and click "Import" to proceed.
            </p>
          </div>

          <div className={styles.tableContainer}>
            <table className={styles.previewTable}>
              <thead>
                <tr>
                  {columns.map((col, i) => (
                    <th key={i}>{col}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.slice(0, 10).map((row, i) => (
                  <tr key={i}>
                    {columns.map((col, j) => (
                      <td key={j}>{String(row[col] || '')}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
            {data.length > 10 && (
              <div className={styles.moreRows}>
                ... and {data.length - 10} more rows
              </div>
            )}
          </div>
        </div>

        <div className={styles.footer}>
          <button className={styles.cancelButton} onClick={onCancel}>
            Cancel
          </button>
          <button className={styles.confirmButton} onClick={onConfirm}>
            Import {data.length} Rows
          </button>
        </div>
      </div>
    </div>
  );
}
