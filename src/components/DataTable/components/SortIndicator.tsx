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
  return (
    <span className={styles.indicator}>
      <span
        className={`${styles.arrow} ${styles.arrowUp} ${
          isSorted === 'asc' ? styles.active : styles.inactive
        }`}
      >
        ▲
      </span>
      <span
        className={`${styles.arrow} ${styles.arrowDown} ${
          isSorted === 'desc' ? styles.active : styles.inactive
        }`}
      >
        ▼
      </span>
    </span>
  );
}
