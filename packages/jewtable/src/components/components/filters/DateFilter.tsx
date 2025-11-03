/**
 * DateFilter - Date column filter with multiple operators
 * Phase 3: Filtering
 */

import React, { useState } from 'react';
import { format, parseISO, isValid, isSameDay, isBefore, isAfter } from 'date-fns';
import styles from './DateFilter.module.css';

export type DateFilterOperator = 'equals' | 'before' | 'after' | 'between';

export interface DateFilterValue {
  operator: DateFilterOperator;
  date: Date;
  date2?: Date; // For 'between' operator
}

interface DateFilterProps {
  value: DateFilterValue | null;
  onChange: (value: DateFilterValue | null | undefined) => void;
}

const OPERATORS: { value: DateFilterOperator; label: string }[] = [
  { value: 'equals', label: 'Equals' },
  { value: 'before', label: 'Before' },
  { value: 'after', label: 'After' },
  { value: 'between', label: 'Between' },
];

export function DateFilter({ value, onChange }: DateFilterProps) {
  const [operator, setOperator] = useState<DateFilterOperator>(
    value?.operator || 'equals'
  );
  const [dateValue, setDateValue] = useState<string>(
    value?.date ? format(value.date, 'yyyy-MM-dd') : ''
  );
  const [dateValue2, setDateValue2] = useState<string>(
    value?.date2 ? format(value.date2, 'yyyy-MM-dd') : ''
  );

  const handleOperatorChange = (newOperator: DateFilterOperator) => {
    setOperator(newOperator);
    updateFilter(newOperator, dateValue, dateValue2);
  };

  const handleDateChange = (newValue: string, isSecond = false) => {
    if (isSecond) {
      setDateValue2(newValue);
      updateFilter(operator, dateValue, newValue);
    } else {
      setDateValue(newValue);
      updateFilter(operator, newValue, dateValue2);
    }
  };

  const updateFilter = (op: DateFilterOperator, val: string, val2: string) => {
    const date = val ? parseISO(val) : null;
    const date2 = val2 ? parseISO(val2) : null;

    if (op === 'between') {
      if (date && isValid(date) && date2 && isValid(date2)) {
        onChange({ operator: op, date, date2 });
      } else {
        onChange(undefined);
      }
    } else {
      if (date && isValid(date)) {
        onChange({ operator: op, date });
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
        onChange={(e) => handleOperatorChange(e.target.value as DateFilterOperator)}
      >
        {OPERATORS.map((op) => (
          <option key={op.value} value={op.value}>
            {op.label}
          </option>
        ))}
      </select>

      <label className={styles.label}>Date</label>
      <input
        type="date"
        className={styles.input}
        value={dateValue}
        onChange={(e) => handleDateChange(e.target.value)}
        autoFocus
      />

      {operator === 'between' && (
        <>
          <label className={styles.label}>And</label>
          <input
            type="date"
            className={styles.input}
            value={dateValue2}
            onChange={(e) => handleDateChange(e.target.value, true)}
          />
        </>
      )}
    </div>
  );
}

/**
 * Apply date filter logic
 */
export function applyDateFilter(
  cellValue: any,
  filterValue: DateFilterValue | null | undefined
): boolean {
  if (!filterValue) return true; // No filter applied

  let cellDate: Date;

  if (cellValue instanceof Date) {
    cellDate = cellValue;
  } else if (typeof cellValue === 'string') {
    cellDate = parseISO(cellValue);
  } else {
    return false;
  }

  if (!isValid(cellDate)) return false;

  const filterDate = filterValue.date;

  switch (filterValue.operator) {
    case 'equals':
      return isSameDay(cellDate, filterDate);
    case 'before':
      return isBefore(cellDate, filterDate);
    case 'after':
      return isAfter(cellDate, filterDate);
    case 'between':
      if (!filterValue.date2) return false;
      return (
        (isSameDay(cellDate, filterDate) || isAfter(cellDate, filterDate)) &&
        (isSameDay(cellDate, filterValue.date2) || isBefore(cellDate, filterValue.date2))
      );
    default:
      return true;
  }
}
