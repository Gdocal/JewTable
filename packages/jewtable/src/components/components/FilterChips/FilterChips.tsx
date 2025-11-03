/**
 * FilterChips - Display active filters as removable chips
 * Phase 3: Filtering
 */

import React, { useMemo, useState, useEffect } from 'react';
import { ColumnFiltersState } from '@tanstack/react-table';
import { format } from 'date-fns';
import styles from './FilterChips.module.css';
import {
  TextFilterValue,
  NumberFilterValue,
  DateFilterValue,
  SelectFilterValue,
  BooleanFilterValue,
  BadgeFilterValue,
  ProgressFilterValue,
  ReferenceFilterValue,
} from '../filters';
import { DataTableColumnDef } from '../../types/column.types';
import { RowData } from '../../types/table.types';
import { CellType } from '../../types/cell.types';
import { getReferenceRegistry } from '../../cells/ReferenceCell/ReferenceCell';
import { getReferenceConfig } from '../../utils/referenceRegistry';

interface FilterChipsProps {
  columnFilters: ColumnFiltersState;
  globalFilter: string;
  onRemoveColumnFilter: (columnId: string) => void;
  onRemoveGlobalFilter: () => void;
  onClearAll: () => void;
  columnNames: Record<string, string>; // Map of columnId to column name
  columns: DataTableColumnDef<any>[]; // Column definitions to extract reference configs
}

export function FilterChips({
  columnFilters,
  globalFilter,
  onRemoveColumnFilter,
  onRemoveGlobalFilter,
  onClearAll,
  columnNames,
  columns,
}: FilterChipsProps) {
  const hasFilters = columnFilters.length > 0 || globalFilter;

  // Build a map of columnId -> referenceType for reference columns
  const referenceColumnTypes = useMemo(() => {
    const map: Record<string, string> = {};
    for (const col of columns) {
      if (col.cellType === CellType.REFERENCE && col.cellOptions?.referenceType) {
        map[col.id] = col.cellOptions.referenceType;
      }
    }
    return map;
  }, [columns]);

  // Get reference configs for all reference columns
  const referenceConfigs = useMemo(() => {
    const configs: Record<string, any> = {};
    const registry = getReferenceRegistry();

    for (const [columnId, refType] of Object.entries(referenceColumnTypes)) {
      try {
        if (registry && registry[refType]) {
          configs[columnId] = getReferenceConfig(registry, refType);
        }
      } catch (e) {
        // Ignore errors
      }
    }
    return configs;
  }, [referenceColumnTypes]);

  // State to hold fetched reference data
  const [referenceIdToLabelMaps, setReferenceIdToLabelMaps] = useState<Record<string, Map<string, string>>>({});

  // Fetch reference data for all reference columns
  useEffect(() => {
    const fetchReferenceData = async () => {
      const maps: Record<string, Map<string, string>> = {};

      for (const [columnId, config] of Object.entries(referenceConfigs)) {
        if (!config || !config.endpoint) continue;

        try {
          // Fetch data from the endpoint
          const url = new URL(config.endpoint, window.location.origin);
          const response = await fetch(url.toString());

          if (!response.ok) {
            console.warn(`[FilterChips] Failed to fetch reference data for column ${columnId}: ${response.statusText}`);
            continue;
          }

          const data = await response.json();

          // Support both direct array and { items: [] } format
          const items = Array.isArray(data) ? data : (data.items && Array.isArray(data.items) ? data.items : []);

          if (items.length > 0) {
            const labelField = config.label || 'name';
            const valueField = config.value || 'id';
            const map = new Map<string, string>();

            for (const item of items) {
              const id = String(item[valueField]);
              const label = String(item[labelField]);
              map.set(id, label);
            }

            maps[columnId] = map;
          }
        } catch (e) {
          console.warn(`[FilterChips] Failed to fetch reference data for column ${columnId}:`, e);
        }
      }

      setReferenceIdToLabelMaps(maps);
    };

    if (Object.keys(referenceConfigs).length > 0) {
      fetchReferenceData();
    }
  }, [referenceConfigs]);

  if (!hasFilters) return null;

  const formatFilterValue = (filterValue: any, columnId: string): string => {
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

    // Boolean filter
    if ('selectedTypes' in filterValue && Array.isArray(filterValue.selectedTypes)) {
      const bf = filterValue as BooleanFilterValue;
      const labels = bf.selectedTypes.map((type) => {
        switch (type) {
          case 'true':
            return 'True';
          case 'false':
            return 'False';
          case 'null':
            return 'Undefined';
          default:
            return '';
        }
      });
      if (labels.length <= 2) {
        return labels.join(', ');
      }
      return `${labels.length} selected`;
    }

    // Badge filter
    if ('selectedLabels' in filterValue) {
      const bf = filterValue as BadgeFilterValue;
      if (bf.selectedLabels.length <= 2) {
        return bf.selectedLabels.join(', ');
      }
      return `${bf.selectedLabels.length} badges`;
    }

    // Progress filter (check type discriminator to distinguish from Number filter)
    if ('type' in filterValue && filterValue.type === 'progress') {
      const pf = filterValue as ProgressFilterValue;
      // Convert decimal to percentage for display
      const displayValue = Math.round(pf.value * 100);
      if (pf.operator === 'between' && pf.value2 !== undefined) {
        const displayValue2 = Math.round(pf.value2 * 100);
        return `${displayValue}% - ${displayValue2}%`;
      }
      return `${pf.operator}: ${displayValue}%`;
    }

    // Reference filter - show labels instead of IDs
    if ('selectedIds' in filterValue) {
      const rf = filterValue as ReferenceFilterValue;
      const idToLabelMap = referenceIdToLabelMaps[columnId];

      if (idToLabelMap) {
        // Map IDs to labels
        const labels = rf.selectedIds.map((id) => idToLabelMap.get(String(id)) || String(id));
        if (labels.length <= 2) {
          return labels.join(', ');
        }
        return `${labels.length} selected`;
      } else {
        // Fallback to showing IDs if no map available
        if (rf.selectedIds.length <= 2) {
          return rf.selectedIds.join(', ');
        }
        return `${rf.selectedIds.length} selected`;
      }
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
              {formatFilterValue(filter.value, filter.id)}
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
