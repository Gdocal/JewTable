/**
 * Main DataTable component
 * Phase 1: Basic table with read-only cells
 * Phase 2: Column sorting
 * Phase 3: Column filtering
 */

import React, { useMemo, useState } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  flexRender,
  ColumnDef,
  SortingState,
  ColumnFiltersState,
  FilterFn,
} from '@tanstack/react-table';
import { DataTableProps, RowData } from './types/table.types';
import { CellRenderer } from './cells/CellRenderer';
import { SortIndicator } from './components/SortIndicator';
import { GlobalSearch } from './components/GlobalSearch';
import { ColumnFilter } from './components/ColumnFilter';
import { FilterChips } from './components/FilterChips';
import {
  applyTextFilter,
  applyNumberFilter,
  applyDateFilter,
  applySelectFilter,
  TextFilterValue,
  NumberFilterValue,
  DateFilterValue,
  SelectFilterValue,
} from './components/filters';
import { CellType } from './types/cell.types';
import styles from './DataTable.module.css';

// Custom filter functions for each cell type
const textFilterFn: FilterFn<any> = (row, columnId, filterValue) => {
  const value = row.getValue(columnId);
  return applyTextFilter(value, filterValue as TextFilterValue);
};

const numberFilterFn: FilterFn<any> = (row, columnId, filterValue) => {
  const value = row.getValue(columnId);
  return applyNumberFilter(value, filterValue as NumberFilterValue);
};

const dateFilterFn: FilterFn<any> = (row, columnId, filterValue) => {
  const value = row.getValue(columnId);
  return applyDateFilter(value, filterValue as DateFilterValue);
};

const selectFilterFn: FilterFn<any> = (row, columnId, filterValue) => {
  const value = row.getValue(columnId);
  return applySelectFilter(value, filterValue as SelectFilterValue);
};

export function DataTable<TData extends RowData>({
  tableId,
  columns,
  data = [],
  className,
  enableSorting = true,
}: DataTableProps<TData>) {
  // Sorting state
  const [sorting, setSorting] = useState<SortingState>([]);

  // Global filter state (Phase 3)
  const [globalFilter, setGlobalFilter] = useState('');

  // Column filters state (Phase 3)
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);

  // Create column names map for filter chips
  const columnNames = useMemo(() => {
    return columns.reduce((acc, col) => {
      const header = col.header;
      const name = typeof header === 'string' ? header : col.id || '';
      if (col.id) {
        acc[col.id] = name;
      }
      return acc;
    }, {} as Record<string, string>);
  }, [columns]);

  // Filter clearing handlers
  const handleRemoveColumnFilter = (columnId: string) => {
    setColumnFilters((prev) => prev.filter((f) => f.id !== columnId));
  };

  const handleRemoveGlobalFilter = () => {
    setGlobalFilter('');
  };

  const handleClearAllFilters = () => {
    setColumnFilters([]);
    setGlobalFilter('');
  };

  // Memoize columns to prevent unnecessary re-renders
  const tableColumns = useMemo<ColumnDef<TData>[]>(() => {
    return columns.map((col) => {
      const columnDef = col as any;
      const cellType = columnDef.cellType || CellType.TEXT;

      // Determine filter function based on cell type
      let filterFn: FilterFn<TData> | undefined;
      if (col.filterable !== false) {
        switch (cellType) {
          case CellType.NUMBER:
            filterFn = numberFilterFn as FilterFn<TData>;
            break;
          case CellType.DATE:
          case CellType.DATE_RANGE:
            filterFn = dateFilterFn as FilterFn<TData>;
            break;
          case CellType.SELECT:
            filterFn = selectFilterFn as FilterFn<TData>;
            break;
          case CellType.TEXT:
          case CellType.CHECKBOX:
          default:
            filterFn = textFilterFn as FilterFn<TData>;
            break;
        }
      }

      return {
        ...col,
        enableSorting: col.sortable !== false && enableSorting,
        enableColumnFilter: col.filterable !== false,
        filterFn,
        cell: (info) => {
          return (
            <CellRenderer
              value={info.getValue()}
              cellType={columnDef.cellType}
              cellOptions={columnDef.cellOptions}
              rowId={info.row.original.id}
              columnId={info.column.id}
              isEditing={false}
            />
          );
        },
      };
    });
  }, [columns, enableSorting]);

  // Initialize TanStack Table
  const table = useReactTable({
    data,
    columns: tableColumns,
    state: {
      sorting,
      globalFilter,
      columnFilters,
    },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  });

  return (
    <div className={`${styles.tableContainer} ${className || ''}`}>
      {/* Global search - Phase 3 */}
      <GlobalSearch
        value={globalFilter}
        onChange={setGlobalFilter}
      />

      {/* Active filter chips - Phase 3 */}
      <FilterChips
        columnFilters={columnFilters}
        globalFilter={globalFilter}
        onRemoveColumnFilter={handleRemoveColumnFilter}
        onRemoveGlobalFilter={handleRemoveGlobalFilter}
        onClearAll={handleClearAllFilters}
        columnNames={columnNames}
      />

      <table className={styles.table}>
        <thead className={styles.thead}>
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id} className={styles.headerRow}>
              {headerGroup.headers.map((header) => {
                // Find the original column definition by matching id or accessorKey
                const columnDef = columns.find(
                  (c) => c.id === header.id || (c as any).accessorKey === header.id
                ) as any;
                const cellType = columnDef?.cellType || CellType.TEXT;
                const canFilter = header.column.getCanFilter();

                return (
                  <th
                    key={header.id}
                    className={`${styles.th} ${
                      header.column.getCanSort() ? styles.sortable : ''
                    } ${header.column.getIsSorted() ? styles.sorted : ''}`}
                    onClick={header.column.getToggleSortingHandler()}
                    style={{ cursor: header.column.getCanSort() ? 'pointer' : 'default' }}
                  >
                    <div className={styles.thContent}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                      <div className={styles.headerIcons}>
                        {header.column.getCanSort() && (
                          <SortIndicator
                            isSorted={header.column.getIsSorted()}
                          />
                        )}
                        {canFilter && (
                          <ColumnFilter
                            column={header.column}
                            cellType={cellType}
                            selectOptions={columnDef?.cellOptions?.options || []}
                          />
                        )}
                      </div>
                    </div>
                  </th>
                );
              })}
            </tr>
          ))}
        </thead>
        <tbody className={styles.tbody}>
          {table.getRowModel().rows.map((row) => (
            <tr key={row.id} className={styles.row}>
              {row.getVisibleCells().map((cell) => (
                <td key={cell.id} className={styles.td}>
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>

      {/* Empty state */}
      {table.getRowModel().rows.length === 0 && (
        <div className={styles.emptyState}>
          <p>No data available</p>
        </div>
      )}
    </div>
  );
}
