/**
 * ReferenceFilter - Multi-select filter for Reference columns
 * Filters by reference IDs but displays reference labels
 */

import React, { useState, useMemo } from 'react';
import { Column } from '@tanstack/react-table';
import { CellOptions } from '../../types/column.types';
import { RowData } from '../../types/table.types';
import { getReferenceConfig } from '../../utils/referenceRegistry';
import { useReferenceData } from '../../hooks/useReferenceData';
import { getReferenceRegistry } from '../../cells/ReferenceCell/ReferenceCell';
import styles from './SelectFilter.module.css'; // Reuse SelectFilter styles

export interface ReferenceFilterValue {
  selectedIds: (string | number)[];
}

interface ReferenceFilterProps {
  value: ReferenceFilterValue | null;
  onChange: (value: ReferenceFilterValue | null | undefined) => void;
  options: string[]; // Reference option IDs (as strings)
  cellOptions?: CellOptions;
  column?: Column<any, unknown>;
}

export function ReferenceFilter({ value, onChange, options, cellOptions, column }: ReferenceFilterProps) {
  const [selectedIds, setSelectedIds] = useState<Set<string | number>>(
    new Set(value?.selectedIds || [])
  );
  const [searchTerm, setSearchTerm] = useState('');

  // Try to get reference config if referenceType is available
  const referenceType = cellOptions?.referenceType;
  const config = useMemo(() => {
    if (!referenceType) {
      return null;
    }
    try {
      const registry = getReferenceRegistry();
      if (!registry || !registry[referenceType]) {
        return null;
      }
      return getReferenceConfig(registry, referenceType);
    } catch (e) {
      return null;
    }
  }, [referenceType]);

  // Fetch reference data
  const { data: referenceData } = useReferenceData(config, { enabled: !!config });

  // Create a mapping from IDs to display labels using reference data
  const idToLabelMap = useMemo(() => {
    const map = new Map<string, string>();

    if (referenceData && referenceData.length > 0 && config) {
      // Use reference data to build the mapping
      const labelField = config.label || 'name';
      const valueField = config.value || 'id';

      for (const item of referenceData) {
        const id = String(item[valueField]);
        const label = String(item[labelField]);
        map.set(id, label);
      }
    } else {
      // Fallback: just use IDs as labels
      for (const id of options) {
        map.set(id, id);
      }
    }

    return map;
  }, [referenceData, config, options]);

  // Filter options based on search term (search on labels, not IDs)
  const filteredOptions = useMemo(() => {
    if (!searchTerm) return options;
    const term = searchTerm.toLowerCase();
    return options.filter((optionId) => {
      const label = idToLabelMap.get(optionId) || optionId;
      return label.toLowerCase().includes(term);
    });
  }, [options, searchTerm, idToLabelMap]);

  const handleToggle = (id: string) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedIds(newSelected);

    if (newSelected.size > 0) {
      onChange({ selectedIds: Array.from(newSelected) });
    } else {
      onChange(undefined);
    }
  };

  const handleSelectAll = () => {
    const allIds = new Set(filteredOptions);
    setSelectedIds(allIds);
    onChange({ selectedIds: Array.from(allIds) });
  };

  const handleClearAll = () => {
    setSelectedIds(new Set());
    onChange(undefined);
  };

  return (
    <div className={styles.container}>
      {/* Search input */}
      {options.length > 5 && (
        <input
          type="text"
          className={styles.searchInput}
          placeholder="Search..."
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
          disabled={selectedIds.size === 0}
        >
          Clear All
        </button>
      </div>

      {/* Options list */}
      <div className={styles.optionsList}>
        {filteredOptions.length === 0 ? (
          <div className={styles.noOptions}>No options found</div>
        ) : (
          filteredOptions.map((optionId) => {
            const displayLabel = idToLabelMap.get(optionId) || optionId;
            return (
              <label key={optionId} className={styles.optionLabel}>
                <input
                  type="checkbox"
                  checked={selectedIds.has(optionId)}
                  onChange={() => handleToggle(optionId)}
                  className={styles.checkbox}
                />
                <span className={styles.optionText}>{displayLabel}</span>
                {selectedIds.has(optionId) && (
                  <span className={styles.checkmark}>✓</span>
                )}
              </label>
            );
          })
        )}
      </div>

      {/* Selection count */}
      {selectedIds.size > 0 && (
        <div className={styles.selectionCount}>
          {selectedIds.size} selected
        </div>
      )}
    </div>
  );
}

/**
 * Apply reference filter logic
 * Filters by reference ID
 */
export function applyReferenceFilter(
  cellValue: any,
  filterValue: ReferenceFilterValue | null | undefined
): boolean {
  if (!filterValue || filterValue.selectedIds.length === 0) return true;

  // Handle null/undefined
  if (cellValue === null || cellValue === undefined) return false;

  // Convert to string for comparison (handles both string and number IDs)
  const cellId = String(cellValue);
  const selectedIdsStr = filterValue.selectedIds.map((id) => String(id));

  return selectedIdsStr.includes(cellId);
}
