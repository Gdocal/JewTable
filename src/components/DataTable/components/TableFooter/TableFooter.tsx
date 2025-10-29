/**
 * TableFooter - Sticky footer with pagination and row count
 * Phase 5: Row Creation (Simplified - Add Row moved to toolbar)
 * Phase 8: Enhanced for server infinite scroll status
 */

import React from 'react';
import styles from './TableFooter.module.css';

interface TableFooterProps {
  totalRows?: number;
  mode?: 'client' | 'server';
  paginationType?: 'infinite' | 'traditional';
  hasNextPage?: boolean;
  totalCount?: number; // Total available on server
}

export function TableFooter({
  totalRows = 0,
  mode = 'client',
  paginationType = 'traditional',
  hasNextPage = false,
  totalCount,
}: TableFooterProps) {
  // Server infinite scroll: show loaded vs total
  const isServerInfinite = mode === 'server' && paginationType === 'infinite';

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
          {isServerInfinite && totalCount ? (
            <>
              Loaded {totalRows.toLocaleString()} of {totalCount.toLocaleString()} rows
              {hasNextPage && <span className={styles.moreIndicator}> • More available</span>}
            </>
          ) : (
            <>{totalRows.toLocaleString()} {totalRows === 1 ? 'row' : 'rows'}</>
          )}
        </span>
      </div>
    </div>
  );
}
