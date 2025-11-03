/**
 * TextFilter - Text column filter with multiple operators
 * Phase 3: Filtering
 */

import React, { useState } from 'react';
import styles from './TextFilter.module.css';

export type TextFilterOperator = 'contains' | 'equals' | 'startsWith' | 'endsWith' | 'notContains';

export interface TextFilterValue {
  operator: TextFilterOperator;
  value: string;
}

interface TextFilterProps {
  value: TextFilterValue | null;
  onChange: (value: TextFilterValue | null | undefined) => void;
}

const OPERATORS: { value: TextFilterOperator; label: string }[] = [
  { value: 'contains', label: 'Contains' },
  { value: 'equals', label: 'Equals' },
  { value: 'startsWith', label: 'Starts with' },
  { value: 'endsWith', label: 'Ends with' },
  { value: 'notContains', label: 'Does not contain' },
];

export function TextFilter({ value, onChange }: TextFilterProps) {
  const [operator, setOperator] = useState<TextFilterOperator>(
    value?.operator || 'contains'
  );
  const [filterValue, setFilterValue] = useState(value?.value || '');

  const handleOperatorChange = (newOperator: TextFilterOperator) => {
    setOperator(newOperator);
    if (filterValue) {
      onChange({ operator: newOperator, value: filterValue });
    }
  };

  const handleValueChange = (newValue: string) => {
    setFilterValue(newValue);
    if (newValue) {
      onChange({ operator, value: newValue });
    } else {
      onChange(undefined);
    }
  };

  return (
    <div className={styles.container}>
      <label className={styles.label}>Operator</label>
      <select
        className={styles.select}
        value={operator}
        onChange={(e) => handleOperatorChange(e.target.value as TextFilterOperator)}
      >
        {OPERATORS.map((op) => (
          <option key={op.value} value={op.value}>
            {op.label}
          </option>
        ))}
      </select>

      <label className={styles.label}>Value</label>
      <input
        type="text"
        className={styles.input}
        placeholder="Enter text..."
        value={filterValue}
        onChange={(e) => handleValueChange(e.target.value)}
        autoFocus
      />
    </div>
  );
}

/**
 * Apply text filter logic
 */
export function applyTextFilter(
  cellValue: any,
  filterValue: TextFilterValue | null | undefined
): boolean {
  if (!filterValue) return true; // No filter applied
  if (!cellValue) return false;

  const str = String(cellValue).toLowerCase();
  const val = filterValue.value.toLowerCase();

  switch (filterValue.operator) {
    case 'contains':
      return str.includes(val);
    case 'equals':
      return str === val;
    case 'startsWith':
      return str.startsWith(val);
    case 'endsWith':
      return str.endsWith(val);
    case 'notContains':
      return !str.includes(val);
    default:
      return true;
  }
}
