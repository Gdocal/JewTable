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
  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent default checkbox behavior
    onSave(!value); // Toggle immediately on mousedown (before blur from other cells)
  };

  return (
    <div className={styles.container}>
      <input
        type="checkbox"
        checked={value}
        onMouseDown={handleMouseDown}
        readOnly
        className={styles.checkbox}
      />
    </div>
  );
}
