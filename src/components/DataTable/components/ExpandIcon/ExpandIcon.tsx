/**
 * ExpandIcon - Icon for expanding/collapsing rows
 * Phase 10.5: Row Expanding
 */

import React from 'react';
import styles from './ExpandIcon.module.css';

interface ExpandIconProps {
  isExpanded: boolean;
  onClick: () => void;
  disabled?: boolean;
}

export function ExpandIcon({ isExpanded, onClick, disabled = false }: ExpandIconProps) {
  return (
    <button
      type="button"
      className={`${styles.expandButton} ${isExpanded ? styles.expanded : ''}`}
      onClick={onClick}
      disabled={disabled}
      aria-label={isExpanded ? 'Collapse row' : 'Expand row'}
      title={isExpanded ? 'Collapse' : 'Expand'}
    >
      <svg
        className={styles.chevron}
        width="16"
        height="16"
        viewBox="0 0 16 16"
        fill="currentColor"
      >
        <path d="M4.5 5.5L8 9l3.5-3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      </svg>
    </button>
  );
}
