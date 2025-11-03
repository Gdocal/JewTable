/**
 * ProgressFilter - Progress/Performance column filter with operators (0-100%)
 * Similar to NumberFilter but specifically for percentage values
 */

import React, { useState } from 'react';
import styles from './NumberFilter.module.css'; // Reuse number filter styles

export type ProgressFilterOperator = 'equals' | 'notEquals' | 'greaterThan' | 'lessThan' | 'between';

export interface ProgressFilterValue {
  type: 'progress'; // Discriminator to distinguish from NumberFilter
  operator: ProgressFilterOperator;
  value: number; // Stored as decimal (0-1)
  value2?: number; // For 'between' operator, stored as decimal (0-1)
}

interface ProgressFilterProps {
  value: ProgressFilterValue | null;
  onChange: (value: ProgressFilterValue | null | undefined) => void;
}

const OPERATORS: { value: ProgressFilterOperator; label: string }[] = [
  { value: 'equals', label: 'Equals' },
  { value: 'notEquals', label: 'Not equals' },
  { value: 'greaterThan', label: 'Greater than' },
  { value: 'lessThan', label: 'Less than' },
  { value: 'between', label: 'Between' },
];

export function ProgressFilter({ value, onChange }: ProgressFilterProps) {
  const [operator, setOperator] = useState<ProgressFilterOperator>(
    value?.operator || 'equals'
  );

  // Display values as percentages (multiply by 100)
  const [filterValue, setFilterValue] = useState<string>(
    value?.value !== undefined ? (value.value * 100).toString() : ''
  );
  const [filterValue2, setFilterValue2] = useState<string>(
    value?.value2 !== undefined ? (value.value2 * 100).toString() : ''
  );

  const handleOperatorChange = (newOperator: ProgressFilterOperator) => {
    setOperator(newOperator);
    updateFilter(newOperator, filterValue, filterValue2);
  };

  const handleValueChange = (newValue: string, isSecond = false) => {
    if (isSecond) {
      setFilterValue2(newValue);
      updateFilter(operator, filterValue, newValue);
    } else {
      setFilterValue(newValue);
      updateFilter(operator, newValue, filterValue2);
    }
  };

  const updateFilter = (op: ProgressFilterOperator, val: string, val2: string) => {
    let num = parseFloat(val);
    let num2 = parseFloat(val2);

    // Convert percentage input to decimal (e.g., 50% -> 0.5)
    if (!isNaN(num)) {
      num = Math.max(0, Math.min(100, num)) / 100; // Clamp to 0-100 and convert
    }
    if (!isNaN(num2)) {
      num2 = Math.max(0, Math.min(100, num2)) / 100; // Clamp to 0-100 and convert
    }

    if (op === 'between') {
      if (!isNaN(num) && !isNaN(num2)) {
        onChange({ type: 'progress', operator: op, value: num, value2: num2 });
      } else {
        onChange(undefined);
      }
    } else {
      if (!isNaN(num)) {
        onChange({ type: 'progress', operator: op, value: num });
      } else {
        onChange(undefined);
      }
    }
  };

  return (
    <div className={styles.container}>
      <label className={styles.label}>Operator</label>
      <select
        className={styles.select}
        value={operator}
        onChange={(e) => handleOperatorChange(e.target.value as ProgressFilterOperator)}
      >
        {OPERATORS.map((op) => (
          <option key={op.value} value={op.value}>
            {op.label}
          </option>
        ))}
      </select>

      <label className={styles.label}>Value (%)</label>
      <input
        type="number"
        className={styles.input}
        placeholder="Enter percentage (0-100)..."
        value={filterValue}
        onChange={(e) => handleValueChange(e.target.value)}
        min="0"
        max="100"
        step="1"
        autoFocus
      />

      {operator === 'between' && (
        <>
          <label className={styles.label}>And (%)</label>
          <input
            type="number"
            className={styles.input}
            placeholder="Enter second percentage (0-100)..."
            value={filterValue2}
            onChange={(e) => handleValueChange(e.target.value, true)}
            min="0"
            max="100"
            step="1"
          />
        </>
      )}
    </div>
  );
}

/**
 * Apply progress filter logic
 * Values are stored as decimals (0-1) but displayed as percentages (0-100)
 */
export function applyProgressFilter(
  cellValue: any,
  filterValue: ProgressFilterValue | null | undefined
): boolean {
  if (!filterValue) return true; // No filter applied

  const num = parseFloat(cellValue);
  if (isNaN(num)) return false;

  const val = filterValue.value;

  switch (filterValue.operator) {
    case 'equals':
      return num === val;
    case 'notEquals':
      return num !== val;
    case 'greaterThan':
      return num > val;
    case 'lessThan':
      return num < val;
    case 'between':
      if (filterValue.value2 === undefined) return false;
      return num >= val && num <= filterValue.value2;
    default:
      return true;
  }
}
