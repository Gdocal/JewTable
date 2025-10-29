/**
 * FilterChips - Display active filters as removable chips
 * Phase 3: Filtering
 */

import React from 'react';
import { ColumnFiltersState } from '@tanstack/react-table';
import { format } from 'date-fns';
import styles from './FilterChips.module.css';
import {
  TextFilterValue,
  NumberFilterValue,
  DateFilterValue,
  SelectFilterValue,
} from '../filters';

interface FilterChipsProps {
  columnFilters: ColumnFiltersState;
  globalFilter: string;
  onRemoveColumnFilter: (columnId: string) => void;
  onRemoveGlobalFilter: () => void;
  onClearAll: () => void;
  columnNames: Record<string, string>; // Map of columnId to column name
}

export function FilterChips({
  columnFilters,
  globalFilter,
  onRemoveColumnFilter,
  onRemoveGlobalFilter,
  onClearAll,
  columnNames,
}: FilterChipsProps) {
  const hasFilters = columnFilters.length > 0 || globalFilter;

  if (!hasFilters) return null;

  const formatFilterValue = (filterValue: any): string => {
    if (!filterValue) return '';

    // Text filter
    if ('operator' in filterValue && 'value' in filterValue && typeof filterValue.value === 'string') {
      const tf = filterValue as TextFilterValue;
      return `${tf.operator}: "${tf.value}"`;
    }

    // Number filter
    if ('operator' in filterValue && 'value' in filterValue && typeof filterValue.value === 'number') {
      const nf = filterValue as NumberFilterValue;
      if (nf.operator === 'between' && nf.value2 !== undefined) {
        return `${nf.value} - ${nf.value2}`;
      }
      return `${nf.operator}: ${nf.value}`;
    }

    // Date filter
    if ('operator' in filterValue && 'date' in filterValue) {
      const df = filterValue as DateFilterValue;
      const dateStr = format(df.date, 'MMM d, yyyy');
      if (df.operator === 'between' && df.date2) {
        const dateStr2 = format(df.date2, 'MMM d, yyyy');
        return `${dateStr} - ${dateStr2}`;
      }
      return `${df.operator}: ${dateStr}`;
    }

    // Select filter
    if ('selectedValues' in filterValue) {
      const sf = filterValue as SelectFilterValue;
      if (sf.selectedValues.length <= 2) {
        return sf.selectedValues.join(', ');
      }
      return `${sf.selectedValues.length} selected`;
    }

    return String(filterValue);
  };

  return (
    <div className={styles.container}>
      <div className={styles.chips}>
        {/* Global filter chip */}
        {globalFilter && (
          <div className={styles.chip}>
            <span className={styles.chipLabel}>
              Search: "{globalFilter}"
            </span>
            <button
              className={styles.chipRemove}
              onClick={onRemoveGlobalFilter}
              title="Remove"
              type="button"
            >
              ✕
            </button>
          </div>
        )}

        {/* Column filter chips */}
        {columnFilters.map((filter) => (
          <div key={filter.id} className={styles.chip}>
            <span className={styles.chipLabel}>
              <strong>{columnNames[filter.id] || filter.id}:</strong>{' '}
              {formatFilterValue(filter.value)}
            </span>
            <button
              className={styles.chipRemove}
              onClick={() => onRemoveColumnFilter(filter.id)}
              title="Remove"
              type="button"
            >
              ✕
            </button>
          </div>
        ))}
      </div>

      {/* Clear all button */}
      <button
        className={styles.clearAllButton}
        onClick={onClearAll}
        type="button"
      >
        Clear all filters
      </button>
    </div>
  );
}
