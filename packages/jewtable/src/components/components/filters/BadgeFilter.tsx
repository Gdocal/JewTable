/**
 * BadgeFilter - Multi-select filter for Badge columns
 * Filters by badge label (supports Badge objects and strings)
 */

import React, { useState, useMemo } from 'react';
import styles from './SelectFilter.module.css'; // Reuse SelectFilter styles

export interface BadgeFilterValue {
  selectedLabels: string[];
}

interface BadgeFilterProps {
  value: BadgeFilterValue | null;
  onChange: (value: BadgeFilterValue | null | undefined) => void;
  options: string[]; // Available badge labels
}

export function BadgeFilter({ value, onChange, options }: BadgeFilterProps) {
  const [selectedLabels, setSelectedLabels] = useState<Set<string>>(
    new Set(value?.selectedLabels || [])
  );
  const [searchTerm, setSearchTerm] = useState('');

  // Filter options based on search term
  const filteredOptions = useMemo(() => {
    if (!searchTerm) return options;
    const term = searchTerm.toLowerCase();
    return options.filter((opt) => opt.toLowerCase().includes(term));
  }, [options, searchTerm]);

  const handleToggle = (label: string) => {
    const newSelected = new Set(selectedLabels);
    if (newSelected.has(label)) {
      newSelected.delete(label);
    } else {
      newSelected.add(label);
    }
    setSelectedLabels(newSelected);

    if (newSelected.size > 0) {
      onChange({ selectedLabels: Array.from(newSelected) });
    } else {
      onChange(undefined);
    }
  };

  const handleSelectAll = () => {
    const allOptions = new Set(filteredOptions);
    setSelectedLabels(allOptions);
    onChange({ selectedLabels: Array.from(allOptions) });
  };

  const handleClearAll = () => {
    setSelectedLabels(new Set());
    onChange(undefined);
  };

  return (
    <div className={styles.container}>
      {/* Search input */}
      {options.length > 5 && (
        <input
          type="text"
          className={styles.searchInput}
          placeholder="Search badges..."
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
          disabled={selectedLabels.size === 0}
        >
          Clear All
        </button>
      </div>

      {/* Options list */}
      <div className={styles.optionsList}>
        {filteredOptions.length === 0 ? (
          <div className={styles.noOptions}>No badges found</div>
        ) : (
          filteredOptions.map((label) => (
            <label key={label} className={styles.optionLabel}>
              <input
                type="checkbox"
                checked={selectedLabels.has(label)}
                onChange={() => handleToggle(label)}
                className={styles.checkbox}
              />
              <span className={styles.optionText}>{label}</span>
              {selectedLabels.has(label) && (
                <span className={styles.checkmark}>✓</span>
              )}
            </label>
          ))
        )}
      </div>

      {/* Selection count */}
      {selectedLabels.size > 0 && (
        <div className={styles.selectionCount}>
          {selectedLabels.size} selected
        </div>
      )}
    </div>
  );
}

/**
 * Apply badge filter logic
 */
export function applyBadgeFilter(
  cellValue: any,
  filterValue: BadgeFilterValue | null | undefined
): boolean {
  if (!filterValue || filterValue.selectedLabels.length === 0) return true;

  // Handle null/undefined
  if (!cellValue) return false;

  // Extract label from Badge object or use string directly
  const getLabel = (val: any): string => {
    if (typeof val === 'string') return val;
    if (val && typeof val === 'object' && 'label' in val) return val.label;
    return String(val);
  };

  // Handle array of badges or single badge
  const labels = Array.isArray(cellValue)
    ? cellValue.map(getLabel)
    : [getLabel(cellValue)];

  // Check if any badge label matches the filter
  return labels.some((label) => filterValue.selectedLabels.includes(label));
}
