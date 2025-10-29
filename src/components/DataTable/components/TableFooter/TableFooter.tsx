/**
 * TableFooter - Sticky footer with Add Row and future pagination
 * Phase 5: Row Creation
 */

import React from 'react';
import styles from './TableFooter.module.css';

interface TableFooterProps {
  onAddRow: () => void;
  enableRowCreation?: boolean;
  totalRows?: number;
}

export function TableFooter({
  onAddRow,
  enableRowCreation = true,
  totalRows = 0,
}: TableFooterProps) {
  return (
    <div className={styles.footer}>
      <div className={styles.leftSection}>
        {enableRowCreation && (
          <button
            className={styles.addButton}
            onClick={onAddRow}
            type="button"
            title="Add new row"
          >
            <span className={styles.icon}>+</span>
            <span>Add Row</span>
          </button>
        )}
      </div>

      <div className={styles.centerSection}>
        {/* Pagination will go here in Phase 8 */}
      </div>

      <div className={styles.rightSection}>
        <span className={styles.rowCount}>
          {totalRows} {totalRows === 1 ? 'row' : 'rows'}
        </span>
      </div>
    </div>
  );
}
