/**
 * NumberFilter - Number column filter with multiple operators
 * Phase 3: Filtering
 */

import React, { useState } from 'react';
import { CellOptions } from '../../types/column.types';
import styles from './NumberFilter.module.css';

export type NumberFilterOperator = 'equals' | 'notEquals' | 'greaterThan' | 'lessThan' | 'between';

export interface NumberFilterValue {
  operator: NumberFilterOperator;
  value: number;
  value2?: number; // For 'between' operator
}

interface NumberFilterProps {
  value: NumberFilterValue | null;
  onChange: (value: NumberFilterValue | null | undefined) => void;
  cellOptions?: CellOptions;
}

const OPERATORS: { value: NumberFilterOperator; label: string }[] = [
  { value: 'equals', label: 'Equals' },
  { value: 'notEquals', label: 'Not equals' },
  { value: 'greaterThan', label: 'Greater than' },
  { value: 'lessThan', label: 'Less than' },
  { value: 'between', label: 'Between' },
];

export function NumberFilter({ value, onChange, cellOptions }: NumberFilterProps) {
  const isPercentage = cellOptions?.numberFormat === 'percent';

  const [operator, setOperator] = useState<NumberFilterOperator>(
    value?.operator || 'equals'
  );

  // Display values as percentages if needed (multiply by 100)
  const [filterValue, setFilterValue] = useState<string>(
    value?.value !== undefined
      ? isPercentage
        ? (value.value * 100).toString()
        : value.value.toString()
      : ''
  );
  const [filterValue2, setFilterValue2] = useState<string>(
    value?.value2 !== undefined
      ? isPercentage
        ? (value.value2 * 100).toString()
        : value.value2.toString()
      : ''
  );

  const handleOperatorChange = (newOperator: NumberFilterOperator) => {
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

  const updateFilter = (op: NumberFilterOperator, val: string, val2: string) => {
    let num = parseFloat(val);
    let num2 = parseFloat(val2);

    // Convert percentage input to decimal (e.g., 5% -> 0.05)
    if (isPercentage) {
      if (!isNaN(num)) {
        num = num / 100;
      }
      if (!isNaN(num2)) {
        num2 = num2 / 100;
      }
    }

    if (op === 'between') {
      if (!isNaN(num) && !isNaN(num2)) {
        onChange({ operator: op, value: num, value2: num2 });
      } else {
        // Use undefined instead of null to properly clear the filter
        onChange(undefined);
      }
    } else {
      if (!isNaN(num)) {
        onChange({ operator: op, value: num });
      } else {
        // Use undefined instead of null to properly clear the filter
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
        onChange={(e) => handleOperatorChange(e.target.value as NumberFilterOperator)}
      >
        {OPERATORS.map((op) => (
          <option key={op.value} value={op.value}>
            {op.label}
          </option>
        ))}
      </select>

      <label className={styles.label}>Value</label>
      <input
        type="number"
        className={styles.input}
        placeholder={isPercentage ? "Enter percentage..." : "Enter number..."}
        value={filterValue}
        onChange={(e) => handleValueChange(e.target.value)}
        autoFocus
      />

      {operator === 'between' && (
        <>
          <label className={styles.label}>And</label>
          <input
            type="number"
            className={styles.input}
            placeholder={isPercentage ? "Enter second percentage..." : "Enter second number..."}
            value={filterValue2}
            onChange={(e) => handleValueChange(e.target.value, true)}
          />
        </>
      )}
    </div>
  );
}

/**
 * Apply number filter logic
 */
export function applyNumberFilter(
  cellValue: any,
  filterValue: NumberFilterValue | null | undefined
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
