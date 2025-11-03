/**
 * ColumnFilter - Wrapper component for column-specific filtering
 * Phase 3: Filtering
 */

import React, { useState, useRef, useMemo } from 'react';
import { Column } from '@tanstack/react-table';
import { FilterIcon } from '../FilterPopover/FilterIcon';
import { FilterPopover } from '../FilterPopover/FilterPopover';
import {
  TextFilter,
  NumberFilter,
  DateFilter,
  SelectFilter,
  BooleanFilter,
  BadgeFilter,
  ProgressFilter,
  ReferenceFilter,
  TextFilterValue,
  NumberFilterValue,
  DateFilterValue,
  SelectFilterValue,
  BooleanFilterValue,
  BadgeFilterValue,
  ProgressFilterValue,
  ReferenceFilterValue,
} from '../filters';
import { CellType } from '../../types/cell.types';
import { RowData } from '../../types/table.types';
import { CellOptions } from '../../types/column.types';
import styles from './ColumnFilter.module.css';

interface ColumnFilterProps<TData extends RowData> {
  column: Column<TData, unknown>;
  cellType?: CellType;
  cellOptions?: CellOptions;
  selectOptions?: string[];
  headerElement?: HTMLElement | null; // Table header reference for popover positioning
}

/**
 * Extract unique values from a column for filtering
 * Used for Badge and Reference columns
 */
function getUniqueValues<TData extends RowData>(
  column: Column<TData, unknown>,
  cellType: CellType
): string[] {
  const allRows = column.getFacetedRowModel().rows;
  const uniqueValues = new Set<string>();

  for (const row of allRows) {
    const cellValue = row.getValue(column.id);

    if (cellValue === null || cellValue === undefined) continue;

    if (cellType === CellType.BADGE) {
      // Extract badge labels
      if (Array.isArray(cellValue)) {
        cellValue.forEach((badge: any) => {
          const label = typeof badge === 'string' ? badge : badge?.label;
          if (label) uniqueValues.add(String(label));
        });
      } else {
        const label = typeof cellValue === 'string' ? cellValue : (cellValue as any)?.label;
        if (label) uniqueValues.add(String(label));
      }
    } else if (cellType === CellType.REFERENCE) {
      // Extract reference IDs
      uniqueValues.add(String(cellValue));
    }
  }

  return Array.from(uniqueValues).sort();
}

export function ColumnFilter<TData extends RowData>({
  column,
  cellType = CellType.TEXT,
  cellOptions,
  selectOptions = [],
  headerElement = null,
}: ColumnFilterProps<TData>) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const filterValue = column.getFilterValue();
  const isActive = filterValue !== undefined;

  // For Badge and Reference filters, get unique values if selectOptions is empty
  const dynamicOptions = useMemo(() => {
    if ((cellType === CellType.BADGE || cellType === CellType.REFERENCE) && selectOptions.length === 0) {
      return getUniqueValues(column, cellType);
    }
    return selectOptions;
  }, [column, cellType, selectOptions]);

  const handleApply = (value: any) => {
    column.setFilterValue(value);
  };

  const handleClear = () => {
    column.setFilterValue(undefined);
  };

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsOpen(!isOpen);
  };

  const renderFilterContent = () => {
    switch (cellType) {
      case CellType.TEXT:
        return (
          <TextFilter
            value={filterValue as TextFilterValue | null}
            onChange={handleApply}
          />
        );
      case CellType.NUMBER:
        return (
          <NumberFilter
            value={filterValue as NumberFilterValue | null}
            onChange={handleApply}
            cellOptions={cellOptions}
          />
        );
      case CellType.DATE:
        return (
          <DateFilter
            value={filterValue as DateFilterValue | null}
            onChange={handleApply}
          />
        );
      case CellType.SELECT:
        return (
          <SelectFilter
            value={filterValue as SelectFilterValue | null}
            onChange={handleApply}
            options={selectOptions}
          />
        );
      case CellType.CHECKBOX:
        return (
          <BooleanFilter
            value={filterValue as BooleanFilterValue | null}
            onChange={handleApply}
          />
        );
      case CellType.BADGE:
        return (
          <BadgeFilter
            value={filterValue as BadgeFilterValue | null}
            onChange={handleApply}
            options={dynamicOptions}
          />
        );
      case CellType.PROGRESS:
        return (
          <ProgressFilter
            value={filterValue as ProgressFilterValue | null}
            onChange={handleApply}
          />
        );
      case CellType.REFERENCE:
        return (
          <ReferenceFilter
            value={filterValue as ReferenceFilterValue | null}
            onChange={handleApply}
            options={dynamicOptions}
            cellOptions={cellOptions}
            column={column}
          />
        );
      default:
        return (
          <TextFilter
            value={filterValue as TextFilterValue | null}
            onChange={handleApply}
          />
        );
    }
  };

  return (
    <div
      ref={containerRef}
      className={styles.container}
      onClick={(e) => e.stopPropagation()}
    >
      <FilterIcon isActive={isActive} isOpen={isOpen} onClick={handleToggle} />
      {isOpen && (
        <FilterPopover
          columnId={column.id}
          columnName={column.columnDef.header as string}
          filterType="text"
          isActive={isActive}
          onClose={() => setIsOpen(false)}
          onApply={handleApply}
          onClear={handleClear}
          anchorElement={containerRef.current}
          headerElement={headerElement}
        >
          {renderFilterContent()}
        </FilterPopover>
      )}
    </div>
  );
}
