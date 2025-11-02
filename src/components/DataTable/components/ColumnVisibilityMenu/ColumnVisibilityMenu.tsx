/**
 * ColumnVisibilityMenu - Dropdown menu for toggling column visibility
 * Phase 10.7: Column Visibility Toggle
 */

import React, { useState, useRef, useEffect } from 'react';
import { Table } from '@tanstack/react-table';
import styles from './ColumnVisibilityMenu.module.css';

interface ColumnVisibilityMenuProps<TData> {
  table: Table<TData>;
  onResetColumnOrder?: () => void;
  onResetColumnVisibility?: () => void;
}

export function ColumnVisibilityMenu<TData>({ table, onResetColumnOrder, onResetColumnVisibility }: ColumnVisibilityMenuProps<TData>) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const allColumns = table.getAllColumns().filter(
    // Filter out special columns that shouldn't be togglable
    (column) => {
      const meta = column.columnDef.meta as any;
      return !meta?.isDragColumn && !meta?.isSelectionColumn && !meta?.isExpandColumn && column.id !== 'actions';
    }
  );

  const visibleCount = allColumns.filter((col) => col.getIsVisible()).length;

  return (
    <div className={styles.container} ref={menuRef}>
      <button
        className={styles.toggleButton}
        onClick={() => setIsOpen(!isOpen)}
        title="Toggle column visibility"
      >
        <span className={styles.icon}>&#9776;</span>
        <span className={styles.label}>Columns ({visibleCount}/{allColumns.length})</span>
      </button>

      {isOpen && (
        <div className={styles.menu}>
          <div className={styles.header}>
            <span className={styles.title}>Show/Hide Columns</span>
            <button
              className={styles.closeButton}
              onClick={() => setIsOpen(false)}
              aria-label="Close"
            >
              ×
            </button>
          </div>

          <div className={styles.options}>
            <button
              className={styles.actionButton}
              onClick={() => table.toggleAllColumnsVisible(true)}
            >
              Show All
            </button>
            <button
              className={styles.actionButton}
              onClick={() => table.toggleAllColumnsVisible(false)}
            >
              Hide All
            </button>
            {onResetColumnVisibility && (
              <button
                className={styles.actionButton}
                onClick={() => {
                  onResetColumnVisibility();
                  table.resetColumnVisibility();
                }}
                title="Reset to default visibility"
              >
                Reset Visibility
              </button>
            )}
            {onResetColumnOrder && (
              <button
                className={styles.actionButton}
                onClick={onResetColumnOrder}
                title="Reset column order to default"
              >
                Reset Order
              </button>
            )}
          </div>

          <div className={styles.columnList}>
            {allColumns.map((column) => {
              const columnName = typeof column.columnDef.header === 'string'
                ? column.columnDef.header
                : column.id;

              return (
                <label key={column.id} className={styles.columnItem}>
                  <input
                    type="checkbox"
                    checked={column.getIsVisible()}
                    onChange={column.getToggleVisibilityHandler()}
                    className={styles.checkbox}
                  />
                  <span className={styles.columnName}>{columnName}</span>
                </label>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
