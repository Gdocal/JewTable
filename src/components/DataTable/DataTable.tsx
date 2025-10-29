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
import { TableActions } from './components/TableActions/TableActions';
import { RowActions } from './components/RowActions/RowActions';
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
  enableInlineEditing = true,
  enableRowCreation = true,
}: DataTableProps<TData>) {
  // Ref for table header (used for filter popover positioning)
  const theadRef = React.useRef<HTMLTableSectionElement>(null);

  // Sorting state
  const [sorting, setSorting] = useState<SortingState>([]);

  // Global filter state (Phase 3)
  const [globalFilter, setGlobalFilter] = useState('');

  // Column filters state (Phase 3)
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);

  // Edit state (Phase 4) - track which cell is being edited
  const [editingCell, setEditingCell] = useState<{ rowId: string; columnId: string } | null>(null);

  // Modified data state (Phase 4) - track unsaved changes
  const [modifiedData, setModifiedData] = useState<Map<string, Partial<TData>>>(new Map());

  // Row creation/deletion state (Phase 5)
  const [newRows, setNewRows] = useState<Set<string>>(new Set());
  const [deletedRows, setDeletedRows] = useState<Set<string>>(new Set());

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

  // Edit handlers (Phase 4)
  const handleStartEdit = (rowId: string, columnId: string) => {
    setEditingCell({ rowId, columnId });
  };

  const handleCancelEdit = () => {
    setEditingCell(null);
  };

  const handleSaveEdit = (rowId: string, columnId: string, newValue: any) => {
    // Update the modified data map
    setModifiedData((prev) => {
      const newMap = new Map(prev);
      const existingChanges = newMap.get(rowId) || {};
      newMap.set(rowId, { ...existingChanges, [columnId]: newValue });
      return newMap;
    });

    // Exit edit mode
    setEditingCell(null);

    // TODO: In Phase 8, this will trigger API save
    console.log(`Saved: Row ${rowId}, Column ${columnId}, Value:`, newValue);
  };

  // Row CRUD handlers (Phase 5)
  const handleAddRow = () => {
    // Generate temporary ID
    const tempId = `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Create empty row with default values
    const newRow: TData = {
      id: tempId,
      ...columns.reduce((acc, col) => {
        const key = (col as any).accessorKey || col.id;
        if (key) {
          acc[key] = '';
        }
        return acc;
      }, {} as any),
    } as TData;

    // Add to data and mark as new
    data.push(newRow);
    setNewRows((prev) => new Set(prev).add(tempId));

    // Enter edit mode for first editable column
    const firstEditableColumn = columns.find((col) => (col as any).editable !== false);
    if (firstEditableColumn) {
      const columnId = firstEditableColumn.id || (firstEditableColumn as any).accessorKey;
      setEditingCell({ rowId: tempId, columnId });
    }

    console.log(`Added new row: ${tempId}`);
  };

  const handleCopyRow = (rowId: string) => {
    const rowToCopy = displayData.find((row) => row.id === rowId);
    if (!rowToCopy) return;

    // Generate temporary ID
    const tempId = `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Copy all data except ID
    const copiedRow: TData = {
      ...rowToCopy,
      id: tempId,
    };

    // Add to data and mark as new
    data.push(copiedRow);
    setNewRows((prev) => new Set(prev).add(tempId));

    console.log(`Copied row ${rowId} to ${tempId}`);
  };

  const handleDeleteRow = (rowId: string) => {
    setDeletedRows((prev) => new Set(prev).add(rowId));

    // Remove from new rows set if it was a new row
    if (newRows.has(rowId)) {
      setNewRows((prev) => {
        const newSet = new Set(prev);
        newSet.delete(rowId);
        return newSet;
      });
    }

    // Clear any modifications for this row
    setModifiedData((prev) => {
      const newMap = new Map(prev);
      newMap.delete(rowId);
      return newMap;
    });

    // Exit edit mode if this row was being edited
    if (editingCell?.rowId === rowId) {
      setEditingCell(null);
    }

    console.log(`Deleted row: ${rowId}`);
  };

  // Get display data - merge original data with modifications, filter out deleted
  const displayData = useMemo(() => {
    return data
      .filter((row) => !deletedRows.has(row.id))
      .map((row) => {
        const modifications = modifiedData.get(row.id);
        return modifications ? { ...row, ...modifications } : row;
      });
  }, [data, modifiedData, deletedRows]);

  // Memoize columns to prevent unnecessary re-renders
  const tableColumns = useMemo<ColumnDef<TData>[]>(() => {
    const userColumns = columns.map((col) => {
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
          const rowId = info.row.original.id;
          const columnId = info.column.id;
          const isEditing = editingCell?.rowId === rowId && editingCell?.columnId === columnId;
          // Cell is editable if: global editing is enabled AND column is not explicitly disabled
          const isEditable = enableInlineEditing && columnDef.editable !== false;

          return (
            <CellRenderer
              value={info.getValue()}
              cellType={columnDef.cellType}
              cellOptions={columnDef.cellOptions}
              rowId={rowId}
              columnId={columnId}
              isEditing={isEditing}
              isEditable={isEditable}
              onStartEdit={() => handleStartEdit(rowId, columnId)}
              onSave={(newValue) => handleSaveEdit(rowId, columnId, newValue)}
              onCancel={handleCancelEdit}
            />
          );
        },
      };
    });

    // Add actions column if row creation is enabled
    if (enableRowCreation) {
      userColumns.push({
        id: '_actions',
        header: 'Actions',
        cell: (info) => (
          <RowActions
            rowId={info.row.original.id}
            onCopy={handleCopyRow}
            onDelete={handleDeleteRow}
            isNewRow={newRows.has(info.row.original.id)}
          />
        ),
        enableSorting: false,
        enableColumnFilter: false,
      } as ColumnDef<TData>);
    }

    return userColumns;
  }, [columns, enableSorting, editingCell, enableInlineEditing, enableRowCreation, newRows]);

  // Initialize TanStack Table
  const table = useReactTable({
    data: displayData,
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
      {/* Table actions (Add Row) - Phase 5 */}
      <TableActions
        onAddRow={handleAddRow}
        enableRowCreation={enableRowCreation}
      />

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
        <thead ref={theadRef} className={styles.thead}>
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
                            headerElement={theadRef.current}
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
