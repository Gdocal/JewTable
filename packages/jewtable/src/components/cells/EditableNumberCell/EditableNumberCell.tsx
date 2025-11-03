/**
 * EditableNumberCell - Editable number input cell
 * Phase 4: Inline Editing
 */

import React, { useState, useRef, useEffect } from 'react';
import { formatNumber, formatCurrency, formatPercent } from '../../utils/formatters';
import styles from './EditableNumberCell.module.css';

interface EditableNumberCellProps {
  value: number;
  onSave: (newValue: number) => void;
  onCancel: () => void;
  isEditing: boolean;
  onStartEdit: () => void;
  format?: 'decimal' | 'currency' | 'percent';
  decimals?: number;
  currencySymbol?: string;
  error?: string;
}

export function EditableNumberCell({
  value,
  onSave,
  onCancel,
  isEditing,
  onStartEdit,
  format = 'decimal',
  decimals = 2,
  currencySymbol = '$',
  error,
}: EditableNumberCellProps) {
  const [tempValue, setTempValue] = useState(String(value ?? ''));
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
      setTempValue(String(value ?? ''));
    }
  }, [value, isEditing]);

  const handleSave = () => {
    const numValue = parseFloat(tempValue);
    if (!isNaN(numValue) && numValue !== value) {
      onSave(numValue);
    } else if (isNaN(numValue)) {
      // Invalid number, show error by keeping edit mode
      // In a full implementation, this would trigger validation error
      onCancel();
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
      setTempValue(String(value ?? ''));
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
          type="number"
          step="any"
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

  // Format the value based on the format type
  let formattedValue: string;
  if (value == null || isNaN(value)) {
    formattedValue = '—';
  } else {
    switch (format) {
      case 'currency':
        formattedValue = formatCurrency(value, decimals, currencySymbol);
        break;
      case 'percent':
        formattedValue = formatPercent(value, decimals);
        break;
      case 'decimal':
      default:
        formattedValue = formatNumber(value, decimals);
        break;
    }
  }

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
