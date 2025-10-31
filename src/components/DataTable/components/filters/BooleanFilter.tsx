/**
 * BooleanFilter - Multi-select filter for Boolean/Checkbox columns
 * Allows selecting any combination of true/false/null
 */

import React, { useState } from 'react';
import styles from './SelectFilter.module.css'; // Reuse SelectFilter styles

export type BooleanFilterType = 'true' | 'false' | 'null';

export interface BooleanFilterValue {
  selectedTypes: BooleanFilterType[];
}

interface BooleanFilterProps {
  value: BooleanFilterValue | null;
  onChange: (value: BooleanFilterValue | null | undefined) => void;
}

const OPTIONS: { value: BooleanFilterType; label: string }[] = [
  { value: 'true', label: 'True' },
  { value: 'false', label: 'False' },
  { value: 'null', label: 'Undefined' },
];

export function BooleanFilter({ value, onChange }: BooleanFilterProps) {
  const [selectedTypes, setSelectedTypes] = useState<Set<BooleanFilterType>>(
    new Set(value?.selectedTypes || [])
  );

  const handleToggle = (type: BooleanFilterType) => {
    const newSelected = new Set(selectedTypes);
    if (newSelected.has(type)) {
      newSelected.delete(type);
    } else {
      newSelected.add(type);
    }
    setSelectedTypes(newSelected);

    if (newSelected.size > 0) {
      onChange({ selectedTypes: Array.from(newSelected) });
    } else {
      onChange(undefined);
    }
  };

  const handleSelectAll = () => {
    const allTypes = new Set<BooleanFilterType>(OPTIONS.map((opt) => opt.value));
    setSelectedTypes(allTypes);
    onChange({ selectedTypes: Array.from(allTypes) });
  };

  const handleClearAll = () => {
    setSelectedTypes(new Set());
    onChange(undefined);
  };

  return (
    <div className={styles.container}>
      {/* Select All / Clear All */}
      <div className={styles.actions}>
        <button
          className={styles.actionButton}
          onClick={handleSelectAll}
          type="button"
          disabled={selectedTypes.size === OPTIONS.length}
        >
          Select All
        </button>
        <button
          className={styles.actionButton}
          onClick={handleClearAll}
          type="button"
          disabled={selectedTypes.size === 0}
        >
          Clear All
        </button>
      </div>

      {/* Options list */}
      <div className={styles.optionsList}>
        {OPTIONS.map((option) => (
          <label key={option.value} className={styles.optionLabel}>
            <input
              type="checkbox"
              checked={selectedTypes.has(option.value)}
              onChange={() => handleToggle(option.value)}
              className={styles.checkbox}
            />
            <span className={styles.optionText}>{option.label}</span>
            {selectedTypes.has(option.value) && (
              <span className={styles.checkmark}>✓</span>
            )}
          </label>
        ))}
      </div>

      {/* Selection count */}
      {selectedTypes.size > 0 && (
        <div className={styles.selectionCount}>
          {selectedTypes.size} selected
        </div>
      )}
    </div>
  );
}

/**
 * Apply boolean filter logic
 * Supports filtering by any combination of true, false, or null/undefined
 */
export function applyBooleanFilter(
  cellValue: any,
  filterValue: BooleanFilterValue | null | undefined
): boolean {
  if (!filterValue || filterValue.selectedTypes.length === 0) return true; // No filter applied

  // Check if the cell value matches any of the selected types
  return filterValue.selectedTypes.some((type) => {
    switch (type) {
      case 'true':
        return cellValue === true;
      case 'false':
        return cellValue === false;
      case 'null':
        return cellValue === null || cellValue === undefined;
      default:
        return false;
    }
  });
}
