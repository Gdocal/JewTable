/**
 * EditableSelectCell - Editable select dropdown cell
 * Phase 4: Inline Editing
 */

import React, { useState, useRef, useEffect } from 'react';
import styles from './EditableSelectCell.module.css';

interface EditableSelectCellProps {
  value: string;
  onSave: (newValue: string) => void;
  onCancel: () => void;
  isEditing: boolean;
  onStartEdit: () => void;
  options: string[];
  error?: string;
}

export function EditableSelectCell({
  value,
  onSave,
  onCancel,
  isEditing,
  onStartEdit,
  options,
  error,
}: EditableSelectCellProps) {
  const [tempValue, setTempValue] = useState(value ?? '');
  const selectRef = useRef<HTMLSelectElement>(null);

  // Focus select when entering edit mode
  useEffect(() => {
    if (isEditing && selectRef.current) {
      selectRef.current.focus();
    }
  }, [isEditing]);

  // Update temp value when prop value changes
  useEffect(() => {
    if (!isEditing) {
      setTempValue(value ?? '');
    }
  }, [value, isEditing]);

  const handleSave = () => {
    if (tempValue !== value) {
      onSave(tempValue);
    } else {
      onCancel();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSave();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      setTempValue(value ?? '');
      onCancel();
    } else if (e.key === 'Tab') {
      handleSave();
    }
  };

  const handleBlur = () => {
    handleSave();
  };

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setTempValue(e.target.value);
  };

  if (isEditing) {
    return (
      <div className={styles.editContainer}>
        <select
          ref={selectRef}
          className={`${styles.select} ${error ? styles.selectError : ''}`}
          value={tempValue}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          onBlur={handleBlur}
        >
          <option value="">Select...</option>
          {options.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
        {error && <div className={styles.errorMessage}>{error}</div>}
      </div>
    );
  }

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent text selection
    onStartEdit();
  };

  return (
    <div
      className={styles.viewContainer}
      onMouseDown={handleMouseDown}
      onDoubleClick={onStartEdit}
    >
      <span className={styles.value}>{value ?? ''}</span>
    </div>
  );
}
