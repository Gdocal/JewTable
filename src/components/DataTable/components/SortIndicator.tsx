/**
 * SortIndicator - Shows sort direction arrows
 * Phase 2: Sorting
 */

import React from 'react';
import { SortDirection } from '@tanstack/react-table';
import styles from './SortIndicator.module.css';

interface SortIndicatorProps {
  isSorted: false | SortDirection;
}

export function SortIndicator({ isSorted }: SortIndicatorProps) {
  if (!isSorted) {
    return (
      <span className={styles.indicator}>
        <span className={`${styles.arrow} ${styles.arrowUp} ${styles.inactive}`}>▲</span>
        <span className={`${styles.arrow} ${styles.arrowDown} ${styles.inactive}`}>▼</span>
      </span>
    );
  }

  return (
    <span className={styles.indicator}>
      {isSorted === 'asc' ? (
        <span className={`${styles.arrow} ${styles.arrowUp} ${styles.active}`}>▲</span>
      ) : (
        <span className={`${styles.arrow} ${styles.arrowDown} ${styles.active}`}>▼</span>
      )}
    </span>
  );
}
