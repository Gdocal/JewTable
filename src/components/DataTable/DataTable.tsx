/**
 * Main DataTable component
 * Phase 1: Basic table with read-only cells
 */

import React, { useMemo } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  ColumnDef,
} from '@tanstack/react-table';
import { DataTableProps, RowData } from './types/table.types';
import { CellRenderer } from './cells/CellRenderer';
import styles from './DataTable.module.css';

export function DataTable<TData extends RowData>({
  tableId,
  columns,
  data = [],
  className,
}: DataTableProps<TData>) {
  // Memoize columns to prevent unnecessary re-renders
  const tableColumns = useMemo<ColumnDef<TData>[]>(() => {
    return columns.map((col) => ({
      ...col,
      cell: (info) => {
        const columnDef = col as any;
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
    }));
  }, [columns]);

  // Initialize TanStack Table
  const table = useReactTable({
    data,
    columns: tableColumns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className={`${styles.tableContainer} ${className || ''}`}>
      <table className={styles.table}>
        <thead className={styles.thead}>
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id} className={styles.headerRow}>
              {headerGroup.headers.map((header) => (
                <th key={header.id} className={styles.th}>
                  {header.isPlaceholder
                    ? null
                    : flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )}
                </th>
              ))}
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
