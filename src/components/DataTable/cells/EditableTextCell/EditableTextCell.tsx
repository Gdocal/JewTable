/**
 * EditableTextCell - Editable text input cell
 * Phase 4: Inline Editing
 */

import React, { useState, useRef, useEffect } from 'react';
import styles from './EditableTextCell.module.css';

interface EditableTextCellProps {
  value: string;
  onSave: (newValue: string) => void;
  onCancel: () => void;
  isEditing: boolean;
  onStartEdit: () => void;
  error?: string;
}

export function EditableTextCell({
  value,
  onSave,
  onCancel,
  isEditing,
  onStartEdit,
  error,
}: EditableTextCellProps) {
  const [tempValue, setTempValue] = useState(value ?? '');
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus input when entering edit mode
  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
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
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSave();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      setTempValue(value ?? '');
      onCancel();
    } else if (e.key === 'Tab') {
      // Let Tab work naturally, but save first
      handleSave();
    }
  };

  const handleBlur = () => {
    handleSave();
  };

  if (isEditing) {
    return (
      <div className={styles.editContainer}>
        <input
          ref={inputRef}
          type="text"
          className={`${styles.input} ${error ? styles.inputError : ''}`}
          value={tempValue}
          onChange={(e) => setTempValue(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={handleBlur}
        />
        {error && <div className={styles.errorMessage}>{error}</div>}
      </div>
    );
  }

  return (
    <div
      className={styles.viewContainer}
      onClick={onStartEdit}
      onDoubleClick={onStartEdit}
    >
      <span className={styles.value}>{value ?? ''}</span>
    </div>
  );
}
