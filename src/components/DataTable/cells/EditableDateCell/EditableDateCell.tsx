/**
 * EditableDateCell - Editable date input cell
 * Phase 4: Inline Editing
 */

import React, { useState, useRef, useEffect } from 'react';
import { format, parseISO, isValid } from 'date-fns';
import { formatDate, DateFormat } from '../../utils/formatters';
import styles from './EditableDateCell.module.css';

interface EditableDateCellProps {
  value: Date | string;
  onSave: (newValue: Date) => void;
  onCancel: () => void;
  isEditing: boolean;
  onStartEdit: () => void;
  dateFormat?: DateFormat;
  error?: string;
}

export function EditableDateCell({
  value,
  onSave,
  onCancel,
  isEditing,
  onStartEdit,
  dateFormat,
  error,
}: EditableDateCellProps) {
  // Convert value to Date if it's a string
  const dateValue = typeof value === 'string' ? parseISO(value) : value;

  // Format as yyyy-MM-dd for input type="date"
  const [tempValue, setTempValue] = useState(
    dateValue && isValid(dateValue) ? format(dateValue, 'yyyy-MM-dd') : ''
  );
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus input when entering edit mode
  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isEditing]);

  // Update temp value when prop value changes
  useEffect(() => {
    if (!isEditing) {
      const newDateValue = typeof value === 'string' ? parseISO(value) : value;
      setTempValue(
        newDateValue && isValid(newDateValue) ? format(newDateValue, 'yyyy-MM-dd') : ''
      );
    }
  }, [value, isEditing]);

  const handleSave = () => {
    if (tempValue) {
      const newDate = parseISO(tempValue);
      if (isValid(newDate)) {
        const oldDate = typeof value === 'string' ? parseISO(value) : value;
        if (!oldDate || format(newDate, 'yyyy-MM-dd') !== format(oldDate, 'yyyy-MM-dd')) {
          onSave(newDate);
        } else {
          onCancel();
        }
      } else {
        onCancel();
      }
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
      const resetDateValue = typeof value === 'string' ? parseISO(value) : value;
      setTempValue(
        resetDateValue && isValid(resetDateValue) ? format(resetDateValue, 'yyyy-MM-dd') : ''
      );
      onCancel();
    } else if (e.key === 'Tab') {
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
          type="date"
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

  const formattedValue = formatDate(value, dateFormat);

  return (
    <div
      className={styles.viewContainer}
      onMouseDown={onStartEdit}
      onDoubleClick={onStartEdit}
    >
      <span className={styles.value}>{formattedValue}</span>
    </div>
  );
}
