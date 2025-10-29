/**
 * EditableCheckboxCell - Instant toggle checkbox
 * Phase 4: Inline Editing
 */

import React from 'react';
import styles from './EditableCheckboxCell.module.css';

interface EditableCheckboxCellProps {
  value: boolean;
  onSave: (newValue: boolean) => void;
}

export function EditableCheckboxCell({
  value,
  onSave,
}: EditableCheckboxCellProps) {
  const handleToggle = () => {
    onSave(!value);
  };

  return (
    <div className={styles.container}>
      <input
        type="checkbox"
        checked={value}
        onChange={handleToggle}
        className={styles.checkbox}
      />
    </div>
  );
}
