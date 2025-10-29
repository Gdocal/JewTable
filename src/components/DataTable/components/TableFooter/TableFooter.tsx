/**
 * TableFooter - Sticky footer with pagination and row count
 * Phase 5: Row Creation (Simplified - Add Row moved to toolbar)
 */

import React from 'react';
import styles from './TableFooter.module.css';

interface TableFooterProps {
  totalRows?: number;
}

export function TableFooter({
  totalRows = 0,
}: TableFooterProps) {
  return (
    <div className={styles.footer}>
      <div className={styles.leftSection}>
        {/* Future: Additional metadata or controls */}
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
