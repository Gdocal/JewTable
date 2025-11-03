/**
 * FilterIcon - Icon button to toggle filter popover
 * Phase 3: Filtering
 */

import React from 'react';
import styles from './FilterIcon.module.css';

interface FilterIconProps {
  isActive: boolean;
  isOpen: boolean;
  onClick: (e: React.MouseEvent) => void;
}

export function FilterIcon({ isActive, isOpen, onClick }: FilterIconProps) {
  return (
    <button
      className={`${styles.filterButton} ${isActive ? styles.active : ''} ${
        isOpen ? styles.open : ''
      }`}
      onClick={onClick}
      title="Filter column"
      type="button"
    >
      <svg
        width="14"
        height="14"
        viewBox="0 0 14 14"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M1 2H13L8 8V12L6 13V8L1 2Z"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill={isActive ? 'currentColor' : 'none'}
        />
      </svg>
      {isActive && <span className={styles.badge}>●</span>}
    </button>
  );
}
