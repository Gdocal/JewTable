/**
 * SelectFilter - Multi-select filter with checkboxes
 * Phase 3: Filtering
 */

import React, { useState, useMemo } from 'react';
import styles from './SelectFilter.module.css';

export interface SelectFilterValue {
  selectedValues: string[];
}

interface SelectFilterProps {
  value: SelectFilterValue | null;
  onChange: (value: SelectFilterValue | null) => void;
  options: string[]; // Available options for this column
}

export function SelectFilter({ value, onChange, options }: SelectFilterProps) {
  const [selectedValues, setSelectedValues] = useState<Set<string>>(
    new Set(value?.selectedValues || [])
  );
  const [searchTerm, setSearchTerm] = useState('');

  // Filter options based on search term
  const filteredOptions = useMemo(() => {
    if (!searchTerm) return options;
    const term = searchTerm.toLowerCase();
    return options.filter((opt) => opt.toLowerCase().includes(term));
  }, [options, searchTerm]);

  const handleToggle = (option: string) => {
    const newSelected = new Set(selectedValues);
    if (newSelected.has(option)) {
      newSelected.delete(option);
    } else {
      newSelected.add(option);
    }
    setSelectedValues(newSelected);

    if (newSelected.size > 0) {
      onChange({ selectedValues: Array.from(newSelected) });
    } else {
      onChange(null);
    }
  };

  const handleSelectAll = () => {
    const allOptions = new Set(filteredOptions);
    setSelectedValues(allOptions);
    onChange({ selectedValues: Array.from(allOptions) });
  };

  const handleClearAll = () => {
    setSelectedValues(new Set());
    onChange(null);
  };

  return (
    <div className={styles.container}>
      {/* Search input */}
      {options.length > 5 && (
        <input
          type="text"
          className={styles.searchInput}
          placeholder="Search options..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          autoFocus
        />
      )}

      {/* Select All / Clear All */}
      <div className={styles.actions}>
        <button
          className={styles.actionButton}
          onClick={handleSelectAll}
          type="button"
          disabled={filteredOptions.length === 0}
        >
          Select All
        </button>
        <button
          className={styles.actionButton}
          onClick={handleClearAll}
          type="button"
          disabled={selectedValues.size === 0}
        >
          Clear All
        </button>
      </div>

      {/* Options list */}
      <div className={styles.optionsList}>
        {filteredOptions.length === 0 ? (
          <div className={styles.emptyState}>No options found</div>
        ) : (
          filteredOptions.map((option) => (
            <label key={option} className={styles.option}>
              <input
                type="checkbox"
                checked={selectedValues.has(option)}
                onChange={() => handleToggle(option)}
                className={styles.checkbox}
              />
              <span className={styles.optionLabel}>{option}</span>
            </label>
          ))
        )}
      </div>

      {/* Selected count */}
      {selectedValues.size > 0 && (
        <div className={styles.selectedCount}>
          {selectedValues.size} of {options.length} selected
        </div>
      )}
    </div>
  );
}

/**
 * Apply select filter logic
 */
export function applySelectFilter(
  cellValue: any,
  filterValue: SelectFilterValue | null | undefined
): boolean {
  if (!filterValue) return true; // No filter applied

  const str = String(cellValue);
  return filterValue.selectedValues.includes(str);
}
