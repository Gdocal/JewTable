/**
 * PaginationControls component
 * Phase 8.3: Traditional pagination UI
 */

import React from 'react';
import { Table } from '@tanstack/react-table';
import { RowData } from '../../types/table.types';
import styles from './PaginationControls.module.css';

export interface PaginationControlsProps<TData extends RowData> {
  table: Table<TData>;
  isLoading?: boolean;
}

export function PaginationControls<TData extends RowData>({
  table,
  isLoading = false,
}: PaginationControlsProps<TData>) {
  const pagination = table.getState().pagination;
  const pageCount = table.getPageCount();
  const currentPage = pagination.pageIndex + 1;

  // Generate page numbers to show
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisible = 7;

    if (pageCount <= maxVisible) {
      // Show all pages
      for (let i = 1; i <= pageCount; i++) {
        pages.push(i);
      }
    } else {
      // Always show first page
      pages.push(1);

      // Calculate range around current page
      let startPage = Math.max(2, currentPage - 1);
      let endPage = Math.min(pageCount - 1, currentPage + 1);

      // Adjust range to always show 5 pages in middle
      if (currentPage <= 3) {
        endPage = 5;
      } else if (currentPage >= pageCount - 2) {
        startPage = pageCount - 4;
      }

      // Add ellipsis before middle pages if needed
      if (startPage > 2) {
        pages.push('...');
      }

      // Add middle pages
      for (let i = startPage; i <= endPage; i++) {
        pages.push(i);
      }

      // Add ellipsis after middle pages if needed
      if (endPage < pageCount - 1) {
        pages.push('...');
      }

      // Always show last page
      pages.push(pageCount);
    }

    return pages;
  };

  return (
    <div className={styles.container}>
      <div className={styles.info}>
        <span>
          Page <strong>{currentPage}</strong> of <strong>{pageCount}</strong>
        </span>
        <span className={styles.separator}>•</span>
        <span>
          {pagination.pageSize} rows per page
        </span>
      </div>

      <div className={styles.controls}>
        <button
          onClick={() => table.firstPage()}
          disabled={!table.getCanPreviousPage() || isLoading}
          className={styles.button}
          title="First page"
        >
          «
        </button>

        <button
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage() || isLoading}
          className={styles.button}
          title="Previous page"
        >
          ‹
        </button>

        <div className={styles.pageNumbers}>
          {getPageNumbers().map((page, index) => (
            page === '...' ? (
              <span key={`ellipsis-${index}`} className={styles.ellipsis}>
                ...
              </span>
            ) : (
              <button
                key={page}
                onClick={() => table.setPageIndex((page as number) - 1)}
                disabled={isLoading}
                className={`${styles.pageButton} ${
                  currentPage === page ? styles.active : ''
                }`}
              >
                {page}
              </button>
            )
          ))}
        </div>

        <button
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage() || isLoading}
          className={styles.button}
          title="Next page"
        >
          ›
        </button>

        <button
          onClick={() => table.lastPage()}
          disabled={!table.getCanNextPage() || isLoading}
          className={styles.button}
          title="Last page"
        >
          »
        </button>
      </div>
    </div>
  );
}
