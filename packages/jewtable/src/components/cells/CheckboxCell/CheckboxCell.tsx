/**
 * CheckboxCell - Display checkbox values
 * Phase 1: Read-only version
 */

import React from 'react';
import styles from './CheckboxCell.module.css';

interface CheckboxCellProps {
  value: boolean | null | undefined;
}

export function CheckboxCell({ value }: CheckboxCellProps) {
  const checked = Boolean(value);

  return (
    <div className={styles.checkboxCell}>
      <input
        type="checkbox"
        checked={checked}
        readOnly
        disabled
        className={styles.checkbox}
      />
    </div>
  );
}
