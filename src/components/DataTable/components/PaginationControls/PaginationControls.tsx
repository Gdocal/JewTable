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
  isFetching?: boolean; // Disable buttons during fetch
  pageSizeOptions?: number[];
  onPageSizeChange?: (pageSize: number) => void;
}

export function PaginationControls<TData extends RowData>({
  table,
  isLoading = false,
  isFetching = false,
  pageSizeOptions = [10, 25, 50, 100, 200],
  onPageSizeChange,
}: PaginationControlsProps<TData>) {
  const pagination = table.getState().pagination;
  const pageCount = table.getPageCount();
  const currentPage = pagination.pageIndex + 1;

  // Generate page numbers to show (standard pagination UI pattern)
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisible = 7; // Total buttons to show (including current)
    const siblingCount = 1; // Pages to show on each side of current

    if (pageCount <= maxVisible) {
      // Show all pages if total is small
      for (let i = 1; i <= pageCount; i++) {
        pages.push(i);
      }
    } else {
      // Always show first page
      pages.push(1);

      // Calculate left and right bounds around current page
      const leftSiblingIndex = Math.max(currentPage - siblingCount, 2);
      const rightSiblingIndex = Math.min(currentPage + siblingCount, pageCount - 1);

      const shouldShowLeftDots = leftSiblingIndex > 2;
      const shouldShowRightDots = rightSiblingIndex < pageCount - 1;

      // Case 1: No left dots, show right dots
      // [1] 2 3 4 5 ... 50
      if (!shouldShowLeftDots && shouldShowRightDots) {
        const leftItemCount = 5;
        for (let i = 2; i <= Math.min(leftItemCount, pageCount - 1); i++) {
          pages.push(i);
        }
        pages.push('...');
      }
      // Case 2: Show left dots, no right dots
      // 1 ... 46 47 48 49 [50]
      else if (shouldShowLeftDots && !shouldShowRightDots) {
        pages.push('...');
        const rightItemCount = 5;
        for (let i = Math.max(pageCount - rightItemCount + 1, 2); i <= pageCount - 1; i++) {
          pages.push(i);
        }
      }
      // Case 3: Show both dots
      // 1 ... 24 [25] 26 ... 50
      else {
        pages.push('...');
        for (let i = leftSiblingIndex; i <= rightSiblingIndex; i++) {
          pages.push(i);
        }
        pages.push('...');
      }

      // Always show last page
      if (pageCount > 1) {
        pages.push(pageCount);
      }
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
        <div className={styles.pageSizeSelector}>
          <label htmlFor="pageSize" className={styles.pageSizeLabel}>
            Rows per page:
          </label>
          <select
            id="pageSize"
            value={pagination.pageSize}
            onChange={(e) => {
              const newSize = Number(e.target.value);
              table.setPageSize(newSize);
              if (onPageSizeChange) {
                onPageSizeChange(newSize);
              }
            }}
            disabled={isLoading || isFetching}
            className={styles.pageSizeSelect}
          >
            {pageSizeOptions.map((size) => (
              <option key={size} value={size}>
                {size}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className={styles.controls}>
        <button
          onClick={() => table.firstPage()}
          disabled={!table.getCanPreviousPage() || isLoading || isFetching}
          className={styles.button}
          title="First page"
        >
          «
        </button>

        <button
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage() || isLoading || isFetching}
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
                disabled={isLoading || isFetching}
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
          disabled={!table.getCanNextPage() || isLoading || isFetching}
          className={styles.button}
          title="Next page"
        >
          ›
        </button>

        <button
          onClick={() => table.lastPage()}
          disabled={!table.getCanNextPage() || isLoading || isFetching}
          className={styles.button}
          title="Last page"
        >
          »
        </button>
      </div>
    </div>
  );
}
