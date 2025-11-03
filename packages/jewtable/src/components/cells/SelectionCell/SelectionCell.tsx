/**
 * SelectionCell component
 * Phase 10.1: Row selection checkbox
 */

import React from 'react';
import styles from './SelectionCell.module.css';

export interface SelectionCellProps {
  checked: boolean;
  indeterminate?: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
}

export function SelectionCell({
  checked,
  indeterminate = false,
  onChange,
  disabled = false,
}: SelectionCellProps) {
  const checkboxRef = React.useRef<HTMLInputElement>(null);

  // Set indeterminate state via DOM (can't be set via JSX)
  React.useEffect(() => {
    if (checkboxRef.current) {
      checkboxRef.current.indeterminate = indeterminate;
    }
  }, [indeterminate]);

  return (
    <div className={styles.selectionCell}>
      <input
        ref={checkboxRef}
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        disabled={disabled}
        className={styles.checkbox}
        onClick={(e) => e.stopPropagation()} // Prevent row click
      />
    </div>
  );
}
