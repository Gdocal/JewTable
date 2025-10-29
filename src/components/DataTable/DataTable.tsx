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
import { TableFooter } from './components/TableFooter/TableFooter';
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
  enableRowDeletion = true,
  enableRowCopy = true,
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
  // Track insertion position for new rows (rowId -> insertAfterRowId)
  const [rowInsertions, setRowInsertions] = useState<Map<string, string | null>>(new Map());

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

    // Create empty row with default values based on cell type
    const newRow: Partial<TData> = {
      ...columns.reduce((acc, col) => {
        const key = (col as any).accessorKey || col.id;
        if (key && key !== 'id') {
          const cellType = (col as any).cellType || CellType.TEXT;
          // Set appropriate default value based on cell type
          switch (cellType) {
            case CellType.NUMBER:
              acc[key] = null;
              break;
            case CellType.DATE:
            case CellType.DATE_RANGE:
              acc[key] = null;
              break;
            case CellType.CHECKBOX:
              acc[key] = false;
              break;
            case CellType.TEXT:
            case CellType.SELECT:
            default:
              acc[key] = '';
              break;
          }
        }
        return acc;
      }, {} as any),
    };

    // Mark as new row
    setNewRows((prev) => new Set(prev).add(tempId));

    // Add to modified data (will be picked up by displayData)
    setModifiedData((prev) => {
      const newMap = new Map(prev);
      newMap.set(tempId, newRow);
      return newMap;
    });

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
    const copiedRow: Partial<TData> = {
      ...rowToCopy,
    };
    delete (copiedRow as any).id;

    // Mark as new row
    setNewRows((prev) => new Set(prev).add(tempId));

    // Track that this row should be inserted after the copied row
    setRowInsertions((prev) => {
      const newMap = new Map(prev);
      newMap.set(tempId, rowId);
      return newMap;
    });

    // Add to modified data (will be picked up by displayData)
    setModifiedData((prev) => {
      const newMap = new Map(prev);
      newMap.set(tempId, copiedRow);
      return newMap;
    });

    console.log(`Copied row ${rowId} to ${tempId}, will insert after ${rowId}`);
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

    // Clear insertion tracking for this row
    setRowInsertions((prev) => {
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
    // Start with original data (excluding deleted rows)
    const baseData = data.filter((row) => !deletedRows.has(row.id));

    // Build result by inserting new rows at correct positions
    const result: TData[] = [];
    const insertedNewRows = new Set<string>();

    // Process base data and insert new rows after their target rows
    baseData.forEach((row) => {
      // Add the base row (with modifications if any)
      const modifications = modifiedData.get(row.id);
      result.push(modifications ? { ...row, ...modifications } : row);

      // Check if any new rows should be inserted after this row
      newRows.forEach((newRowId) => {
        if (rowInsertions.get(newRowId) === row.id && !insertedNewRows.has(newRowId)) {
          const newRowMods = modifiedData.get(newRowId);
          if (newRowMods) {
            result.push({ ...newRowMods, id: newRowId } as TData);
            insertedNewRows.add(newRowId);
          }
        }
      });
    });

    // Add any new rows that don't have an insertion position (e.g., from Add Row button)
    newRows.forEach((newRowId) => {
      if (!insertedNewRows.has(newRowId)) {
        const newRowMods = modifiedData.get(newRowId);
        if (newRowMods) {
          result.push({ ...newRowMods, id: newRowId } as TData);
        }
      }
    });

    return result;
  }, [data, modifiedData, deletedRows, newRows, rowInsertions]);

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

    // Add actions column if any row actions are enabled
    const hasRowActions = enableRowCreation || enableRowCopy || enableRowDeletion;
    if (hasRowActions) {
      userColumns.push({
        id: '_actions',
        header: 'Actions',
        cell: (info) => (
          <RowActions
            rowId={info.row.original.id}
            onCopy={handleCopyRow}
            onDelete={handleDeleteRow}
            isNewRow={newRows.has(info.row.original.id)}
            enableCopy={enableRowCopy}
            enableDelete={enableRowDeletion}
          />
        ),
        enableSorting: false,
        enableColumnFilter: false,
      } as ColumnDef<TData>);
    }

    return userColumns;
  }, [columns, enableSorting, editingCell, enableInlineEditing, enableRowCreation, enableRowCopy, enableRowDeletion, newRows]);

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
          {table.getRowModel().rows.map((row) => {
            const isNewRow = newRows.has(row.original.id);
            return (
              <tr
                key={row.id}
                className={`${styles.row} ${isNewRow ? styles.newRow : ''}`}
              >
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id} className={styles.td}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            );
          })}
        </tbody>
      </table>

      {/* Empty state */}
      {table.getRowModel().rows.length === 0 && (
        <div className={styles.emptyState}>
          <p>No data available</p>
        </div>
      )}

      {/* Table footer with Add Row - Phase 5 */}
      <TableFooter
        onAddRow={handleAddRow}
        enableRowCreation={enableRowCreation}
        totalRows={displayData.length}
      />
    </div>
  );
}
