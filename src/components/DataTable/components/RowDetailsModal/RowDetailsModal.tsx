/**
 * RowDetailsModal - Modal for displaying detailed row information
 * Phase 10.8: Modal for Row Details
 */

import React, { useEffect } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { CellType } from '../../types/cell.types';
import styles from './RowDetailsModal.module.css';

interface RowDetailsModalProps<TData> {
  row: TData;
  columns: ColumnDef<TData>[];
  onClose: () => void;
  isOpen: boolean;
}

export function RowDetailsModal<TData extends Record<string, any>>({
  row,
  columns,
  onClose,
  isOpen,
}: RowDetailsModalProps<TData>) {
  // Close on Escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // Filter out special columns (actions, drag, selection, expand)
  const dataColumns = columns.filter((col: any) => {
    const meta = col.meta;
    return !meta?.isDragColumn && !meta?.isSelectionColumn && !meta?.isExpandColumn && col.id !== 'actions';
  });

  const formatValue = (value: any, column: any): string => {
    if (value === null || value === undefined) return '—';

    const cellType = column.cellType || CellType.TEXT;

    switch (cellType) {
      case CellType.DATE:
        try {
          return new Date(value).toLocaleDateString();
        } catch {
          return String(value);
        }
      case CellType.NUMBER:
      case CellType.CURRENCY:
        if (typeof value === 'number') {
          return cellType === CellType.CURRENCY
            ? `$${value.toLocaleString()}`
            : value.toLocaleString();
        }
        return String(value);
      case CellType.PERCENT:
        if (typeof value === 'number') {
          return `${(value * 100).toFixed(2)}%`;
        }
        return String(value);
      case CellType.BOOLEAN:
        return value ? 'Yes' : 'No';
      case CellType.SELECT:
      case CellType.BADGE:
        return String(value);
      case CellType.PROGRESS:
        if (typeof value === 'number') {
          return `${value}%`;
        }
        return String(value);
      default:
        return String(value);
    }
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h2 className={styles.title}>Row Details</h2>
          <button
            className={styles.closeButton}
            onClick={onClose}
            aria-label="Close"
          >
            ×
          </button>
        </div>

        <div className={styles.content}>
          <div className={styles.fieldList}>
            {dataColumns.map((column: any) => {
              const columnId = column.id || column.accessorKey;
              const columnName = typeof column.header === 'string' ? column.header : columnId;
              const value = row[columnId];
              const formattedValue = formatValue(value, column);

              return (
                <div key={columnId} className={styles.field}>
                  <div className={styles.fieldLabel}>{columnName}</div>
                  <div className={styles.fieldValue}>{formattedValue}</div>
                </div>
              );
            })}
          </div>
        </div>

        <div className={styles.footer}>
          <button className={styles.closeFooterButton} onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
