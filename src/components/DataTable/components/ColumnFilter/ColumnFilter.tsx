/**
 * ColumnFilter - Wrapper component for column-specific filtering
 * Phase 3: Filtering
 */

import React, { useState, useRef } from 'react';
import { Column } from '@tanstack/react-table';
import { FilterIcon } from '../FilterPopover/FilterIcon';
import { FilterPopover } from '../FilterPopover/FilterPopover';
import {
  TextFilter,
  NumberFilter,
  DateFilter,
  SelectFilter,
  TextFilterValue,
  NumberFilterValue,
  DateFilterValue,
  SelectFilterValue,
} from '../filters';
import { CellType } from '../../types/cell.types';
import { RowData } from '../../types/table.types';
import styles from './ColumnFilter.module.css';

interface ColumnFilterProps<TData extends RowData> {
  column: Column<TData, unknown>;
  cellType?: CellType;
  selectOptions?: string[];
  headerElement?: HTMLElement | null; // Table header reference for popover positioning
}

export function ColumnFilter<TData extends RowData>({
  column,
  cellType = CellType.TEXT,
  selectOptions = [],
  headerElement = null,
}: ColumnFilterProps<TData>) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const filterValue = column.getFilterValue();
  const isActive = filterValue !== undefined;

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
