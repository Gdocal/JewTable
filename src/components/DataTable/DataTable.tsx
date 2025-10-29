/**
 * Main DataTable component
 * Phase 1: Basic table with read-only cells
 * Phase 2: Column sorting
 * Phase 3: Column filtering
 */

import React, { useMemo, useState, useRef, useEffect } from 'react';
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
import { useVirtualizer } from '@tanstack/react-virtual';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragStartEvent,
  DragOverlay,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import {
  restrictToVerticalAxis,
  restrictToParentElement,
} from '@dnd-kit/modifiers';
import { DataTableProps, RowData, TableMode, PaginationType } from './types/table.types';
import { CellRenderer } from './cells/CellRenderer';
import { SortIndicator } from './components/SortIndicator';
import { GlobalSearch } from './components/GlobalSearch';
import { ColumnFilter } from './components/ColumnFilter';
import { FilterChips } from './components/FilterChips';
import { TableToolbar } from './components/TableToolbar/TableToolbar';
import { TableFooter } from './components/TableFooter/TableFooter';
import { EmptyState } from './components/EmptyState/EmptyState';
import { RowActions } from './components/RowActions/RowActions';
import { DraggableRow } from './components/DraggableRow/DraggableRow';
import { DragHandleCell } from './components/DragHandleCell/DragHandleCell';
import { PaginationControls } from './components/PaginationControls/PaginationControls';
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
  mode = 'client' as const,
  paginationType = PaginationType.INFINITE,
  onFetchNextPage,
  hasNextPage,
  isFetchingNextPage,
  totalRows,
  pageCount,
  isLoading = false,
  onPaginationChange,
  enableSorting = true,
  enableInlineEditing = true,
  enableRowCreation = true,
  enableRowDeletion = true,
  enableRowCopy = true,
  enableRowInsertion = true,
  enableRowReordering = false,
  enableVirtualization = false,
  rowHeight = 53,
  onRowReorder,
}: DataTableProps<TData>) {
  // Ref for table header (used for filter popover positioning)
  const theadRef = React.useRef<HTMLTableSectionElement>(null);

  // Ref for table body (used for virtualization - Phase 7)
  const tbodyRef = useRef<HTMLTableSectionElement>(null);

  // Ref for virtualization scroll container (Phase 7)
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Sorting state
  const [sorting, setSorting] = useState<SortingState>([]);

  // Global filter state (Phase 3)
  const [globalFilter, setGlobalFilter] = useState('');

  // Column filters state (Phase 3)
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);

  // Pagination state (Phase 8.3 - Traditional pagination)
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 100,
  });

  // Edit state (Phase 4) - track which cell is being edited
  const [editingCell, setEditingCell] = useState<{ rowId: string; columnId: string } | null>(null);

  // Modified data state (Phase 4) - track unsaved changes
  const [modifiedData, setModifiedData] = useState<Map<string, Partial<TData>>>(new Map());

  // Row creation/deletion state (Phase 5)
  const [newRows, setNewRows] = useState<Set<string>>(new Set());
  const [deletedRows, setDeletedRows] = useState<Set<string>>(new Set());
  // Track insertion position for new rows (rowId -> insertAfterRowId)
  const [rowInsertions, setRowInsertions] = useState<Map<string, string | null>>(new Map());
  // Track rows that should show the "just added" animation (rowId -> animation order)
  const [animatingRows, setAnimatingRows] = useState<Map<string, number>>(new Map());
  // Track animation counter to ensure proper ordering when multiple rows added quickly
  const animationCounterRef = useRef(0);

  // Row order state (Phase 6 - Drag & Drop)
  const [rowOrder, setRowOrder] = useState<string[]>([]);

  // Active drag item (Phase 6 - DragOverlay fix)
  const [activeId, setActiveId] = useState<string | null>(null);

  // DndKit sensors (Phase 6)
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 10, // Require 10px movement before drag starts
      },
    }),
    useSensor(KeyboardSensor)
  );

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
    // Blur any currently focused element to trigger save before switching cells
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }

    // Small delay to allow blur/save to complete before starting new edit
    setTimeout(() => {
      setEditingCell({ rowId, columnId });
    }, 0);
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

    // Trigger animation for this row with order tracking
    const animationOrder = animationCounterRef.current;
    animationCounterRef.current += 1;
    setAnimatingRows((prev) => new Map(prev).set(tempId, animationOrder));
    const animationDuration = 2000 + (animationOrder * 100);
    setTimeout(() => {
      setAnimatingRows((prev) => {
        const newMap = new Map(prev);
        newMap.delete(tempId);
        return newMap;
      });
    }, animationDuration);

    // Enter edit mode for first editable column
    const firstEditableColumn = columns.find((col) => (col as any).editable !== false);
    if (firstEditableColumn) {
      const columnId = firstEditableColumn.id || (firstEditableColumn as any).accessorKey;
      setEditingCell({ rowId: tempId, columnId });
    }

    console.log(`Added new row: ${tempId}`);
  };

  const handleCopyRow = (rowId: string) => {
    // Exit edit mode and blur to prevent auto-scroll
    setEditingCell(null);
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }

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

    // Update insertion tracking: new copy goes directly after original row,
    // and any existing copies that were after original now go after new copy
    setRowInsertions((prev) => {
      const newMap = new Map(prev);

      // Find any existing rows that should be inserted after the target row
      const rowsToMoveDown: string[] = [];
      newMap.forEach((insertAfter, existingRowId) => {
        if (insertAfter === rowId) {
          rowsToMoveDown.push(existingRowId);
        }
      });

      // Move those rows to be inserted after the new copy instead
      rowsToMoveDown.forEach((existingRowId) => {
        newMap.set(existingRowId, tempId);
      });

      // New copy goes directly after the original row
      newMap.set(tempId, rowId);
      return newMap;
    });

    // Add to modified data (will be picked up by displayData)
    setModifiedData((prev) => {
      const newMap = new Map(prev);
      newMap.set(tempId, copiedRow);
      return newMap;
    });

    // Trigger animation for this row with order tracking
    const animationOrder = animationCounterRef.current;
    animationCounterRef.current += 1;
    setAnimatingRows((prev) => new Map(prev).set(tempId, animationOrder));
    const animationDuration = 2000 + (animationOrder * 100);
    setTimeout(() => {
      setAnimatingRows((prev) => {
        const newMap = new Map(prev);
        newMap.delete(tempId);
        return newMap;
      });
    }, animationDuration);

    console.log(`Copied row ${rowId} to ${tempId}, will insert after ${rowId}`);
  };

  const handleInsertRow = (rowId: string) => {
    // Exit edit mode and blur to prevent auto-scroll
    setEditingCell(null);
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }

    // Generate temporary ID
    const tempId = `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Create blank row with default values based on cell type
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

    // Update insertion tracking: new row goes directly after target row,
    // and any existing copies that were after target now go after new row
    setRowInsertions((prev) => {
      const newMap = new Map(prev);

      // Find any existing rows that should be inserted after the target row
      const rowsToMoveDown: string[] = [];
      newMap.forEach((insertAfter, existingRowId) => {
        if (insertAfter === rowId) {
          rowsToMoveDown.push(existingRowId);
        }
      });

      // Move those rows to be inserted after the new row instead
      rowsToMoveDown.forEach((existingRowId) => {
        newMap.set(existingRowId, tempId);
      });

      // New row goes directly after the target row
      newMap.set(tempId, rowId);
      return newMap;
    });

    // Add to modified data (will be picked up by displayData)
    setModifiedData((prev) => {
      const newMap = new Map(prev);
      newMap.set(tempId, newRow);
      return newMap;
    });

    // Trigger animation for this row with order tracking
    const animationOrder = animationCounterRef.current;
    animationCounterRef.current += 1;
    setAnimatingRows((prev) => new Map(prev).set(tempId, animationOrder));
    const animationDuration = 2000 + (animationOrder * 100);
    setTimeout(() => {
      setAnimatingRows((prev) => {
        const newMap = new Map(prev);
        newMap.delete(tempId);
        return newMap;
      });
    }, animationDuration);

    console.log(`Inserted blank row ${tempId} after ${rowId}`);
  };

  const handleDeleteRow = (rowId: string) => {
    // Exit edit mode and blur to prevent auto-scroll
    setEditingCell(null);
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }

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

    console.log(`Deleted row: ${rowId}`);
  };

  // Handle drag start (Phase 6 - DragOverlay fix)
  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  // Handle drag end (Phase 6)
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over || active.id === over.id) {
      setActiveId(null); // Clear active ID
      return;
    }

    setRowOrder((items) => {
      const oldIndex = items.indexOf(active.id as string);
      const newIndex = items.indexOf(over.id as string);

      const newOrder = arrayMove(items, oldIndex, newIndex);

      // Call onRowReorder callback if provided
      if (onRowReorder) {
        onRowReorder(newOrder);
      }

      console.log(`Reordered rows: ${active.id} moved from ${oldIndex} to ${newIndex}`);
      return newOrder;
    });

    setActiveId(null); // Clear active ID
  };

  // Get display data - merge original data with modifications, filter out deleted
  const displayData = useMemo(() => {
    // Start with original data (excluding deleted rows)
    const baseData = data.filter((row) => !deletedRows.has(row.id));

    // Build result by inserting new rows at correct positions
    const result: TData[] = [];
    const insertedNewRows = new Set<string>();

    // Helper function to recursively insert new rows after a given row
    const insertNewRowsAfter = (afterRowId: string) => {
      newRows.forEach((newRowId) => {
        if (rowInsertions.get(newRowId) === afterRowId && !insertedNewRows.has(newRowId)) {
          const newRowMods = modifiedData.get(newRowId);
          if (newRowMods) {
            result.push({ ...newRowMods, id: newRowId } as TData);
            insertedNewRows.add(newRowId);
            // Recursively check if any rows should be inserted after THIS new row
            insertNewRowsAfter(newRowId);
          }
        }
      });
    };

    // Process base data and insert new rows after their target rows
    baseData.forEach((row) => {
      // Add the base row (with modifications if any)
      const modifications = modifiedData.get(row.id);
      result.push(modifications ? { ...row, ...modifications } : row);

      // Recursively insert new rows after this row
      insertNewRowsAfter(row.id);
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

    // Apply row reordering if enabled (Phase 6)
    if (enableRowReordering && rowOrder.length > 0) {
      const orderMap = new Map(rowOrder.map((id, index) => [id, index]));
      result.sort((a, b) => {
        const aIndex = orderMap.get(a.id) ?? Number.MAX_SAFE_INTEGER;
        const bIndex = orderMap.get(b.id) ?? Number.MAX_SAFE_INTEGER;
        return aIndex - bIndex;
      });
    }

    return result;
  }, [data, modifiedData, deletedRows, newRows, rowInsertions, animatingRows, enableRowReordering, rowOrder]);

  // Initialize row order when displayData changes (Phase 6)
  useEffect(() => {
    if (enableRowReordering) {
      const currentIds = displayData.map((row) => row.id);
      setRowOrder((prevOrder) => {
        // Only update if IDs have changed
        const prevSet = new Set(prevOrder);
        const currentSet = new Set(currentIds);
        const hasChanged =
          prevOrder.length !== currentIds.length ||
          currentIds.some((id) => !prevSet.has(id));

        return hasChanged ? currentIds : prevOrder;
      });
    }
  }, [displayData, enableRowReordering]);

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

    // Add drag handle column if row reordering is enabled (Phase 6)
    if (enableRowReordering) {
      userColumns.unshift({
        id: '_drag',
        header: '',
        cell: (info) => <DragHandleCell rowId={info.row.original.id} />,
        size: 32,
        enableSorting: false,
        enableColumnFilter: false,
        meta: { isDragColumn: true },
      } as ColumnDef<TData>);
    }

    // Add actions column if any row actions are enabled
    const hasRowActions = enableRowCreation || enableRowCopy || enableRowInsertion || enableRowDeletion;
    if (hasRowActions) {
      userColumns.push({
        id: '_actions',
        header: 'Actions',
        cell: (info) => (
          <RowActions
            rowId={info.row.original.id}
            onCopy={handleCopyRow}
            onInsert={handleInsertRow}
            onDelete={handleDeleteRow}
            isNewRow={newRows.has(info.row.original.id)}
            enableCopy={enableRowCopy}
            enableInsert={enableRowInsertion}
            enableDelete={enableRowDeletion}
          />
        ),
        enableSorting: false,
        enableColumnFilter: false,
      } as ColumnDef<TData>);
    }

    return userColumns;
  }, [columns, enableSorting, editingCell, enableInlineEditing, enableRowCreation, enableRowCopy, enableRowInsertion, enableRowDeletion, enableRowReordering, newRows]);

  // Determine if using manual pagination (Phase 8.3)
  const useManualPagination = mode === TableMode.SERVER && paginationType === PaginationType.TRADITIONAL;

  // Initialize TanStack Table
  const table = useReactTable({
    data: displayData,
    columns: tableColumns,
    state: {
      sorting,
      globalFilter,
      columnFilters,
      ...(useManualPagination ? { pagination } : {}),
    },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    onColumnFiltersChange: setColumnFilters,
    ...(useManualPagination ? { onPaginationChange: setPagination } : {}),
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    // Manual pagination for server mode with traditional pagination
    ...(useManualPagination
      ? {
          manualPagination: true,
          pageCount: pageCount ?? Math.ceil((totalRows ?? 0) / pagination.pageSize),
        }
      : {}),
  });

  // Virtualization setup (Phase 7)
  const rowVirtualizer = useVirtualizer({
    count: table.getRowModel().rows.length,
    getScrollElement: () => scrollContainerRef.current,
    estimateSize: () => rowHeight,
    overscan: 10,
    enabled: enableVirtualization,
  });

  // Pagination change callback (Phase 8.3 - Traditional pagination)
  useEffect(() => {
    if (!useManualPagination || !onPaginationChange) return;
    onPaginationChange(pagination);
  }, [pagination, useManualPagination, onPaginationChange]);

  // Infinite scroll detection (Phase 8.2 - Server mode with infinite pagination)
  useEffect(() => {
    if (mode !== TableMode.SERVER || paginationType !== PaginationType.INFINITE) return;
    if (!enableVirtualization || !onFetchNextPage) return;
    if (!hasNextPage || isFetchingNextPage) return;

    const scrollElement = scrollContainerRef.current;
    if (!scrollElement) return;

    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = scrollElement;
      const scrollPercentage = (scrollTop + clientHeight) / scrollHeight;

      // Trigger fetch when 80% scrolled
      if (scrollPercentage > 0.8) {
        onFetchNextPage();
      }
    };

    scrollElement.addEventListener('scroll', handleScroll);
    return () => scrollElement.removeEventListener('scroll', handleScroll);
  }, [mode, paginationType, enableVirtualization, onFetchNextPage, hasNextPage, isFetchingNextPage]);

  // Handle clicks on non-interactive areas to save edits
  const handleContainerClick = (e: React.MouseEvent) => {
    // If clicking on the container itself (not a child element like input/button),
    // blur any focused element to trigger save
    const target = e.target as HTMLElement;
    if (
      target === e.currentTarget ||
      target.classList.contains(styles.tableContainer) ||
      target.classList.contains(styles.table) ||
      target.classList.contains(styles.tbody) ||
      target.classList.contains(styles.thead)
    ) {
      // Blur the currently focused element
      if (document.activeElement instanceof HTMLElement) {
        document.activeElement.blur();
      }
    }
  };

  // Determine if table is read-only (no editing and no row creation)
  const isReadOnly = !enableInlineEditing && !enableRowCreation;

  return (
    <div className={`${styles.tableContainer} ${className || ''}`} onClick={handleContainerClick}>
      {/* Table toolbar - Phase 5 (Improved UX) */}
      <TableToolbar
        isReadOnly={isReadOnly}
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

      {enableVirtualization ? (
        <div ref={scrollContainerRef} className={styles.virtualizationContainer}>
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
            onDragCancel={() => setActiveId(null)}
            modifiers={[restrictToVerticalAxis, restrictToParentElement]}
          >
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

                  const isDragColumn = (header.column.columnDef.meta as any)?.isDragColumn;

                  return (
                    <th
                      key={header.id}
                      className={`${styles.th} ${
                        header.column.getCanSort() ? styles.sortable : ''
                      } ${header.column.getIsSorted() ? styles.sorted : ''} ${isDragColumn ? styles.dragColumn : ''}`}
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
          <SortableContext
            items={rowOrder}
            strategy={verticalListSortingStrategy}
          >
            <tbody
              ref={tbodyRef}
              className={styles.tbody}
              style={
                enableVirtualization
                  ? {
                      height: `${rowVirtualizer.getTotalSize()}px`,
                      position: 'relative',
                    }
                  : undefined
              }
            >
              {enableVirtualization
                ? rowVirtualizer.getVirtualItems().map((virtualRow) => {
                    const row = table.getRowModel().rows[virtualRow.index];
                    if (!row) return null;

                    const animationOrder = animatingRows.get(row.original.id);
                    const shouldAnimate = animationOrder !== undefined;
                    const animationDuration = shouldAnimate ? `${2 + (animationOrder * 0.1)}s` : '2s';
                    const rowStyle: React.CSSProperties = {
                      ...(shouldAnimate ? { '--animation-duration': animationDuration } as React.CSSProperties : undefined),
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      width: '100%',
                      transform: `translateY(${virtualRow.start}px)`,
                    };

                    return enableRowReordering ? (
                      <DraggableRow
                        key={row.id}
                        id={row.original.id}
                        className={`${styles.row} ${shouldAnimate ? styles.newRow : ''}`}
                        style={rowStyle}
                        isDragDisabled={!!sorting.length || !!columnFilters.length || !!globalFilter}
                      >
                        {row.getVisibleCells().map((cell) => {
                          const isDragColumn = (cell.column.columnDef.meta as any)?.isDragColumn;
                          return (
                            <td key={cell.id} className={`${styles.td} ${isDragColumn ? styles.dragColumn : ''}`}>
                              {flexRender(cell.column.columnDef.cell, cell.getContext())}
                            </td>
                          );
                        })}
                      </DraggableRow>
                    ) : (
                      <tr
                        key={row.id}
                        className={`${styles.row} ${shouldAnimate ? styles.newRow : ''}`}
                        style={rowStyle}
                      >
                        {row.getVisibleCells().map((cell) => {
                          const isDragColumn = (cell.column.columnDef.meta as any)?.isDragColumn;
                          return (
                            <td key={cell.id} className={`${styles.td} ${isDragColumn ? styles.dragColumn : ''}`}>
                              {flexRender(cell.column.columnDef.cell, cell.getContext())}
                            </td>
                          );
                        })}
                      </tr>
                    );
                  })
                : table.getRowModel().rows.map((row) => {
                    const animationOrder = animatingRows.get(row.original.id);
                    const shouldAnimate = animationOrder !== undefined;
                    const animationDuration = shouldAnimate ? `${2 + (animationOrder * 0.1)}s` : '2s';
                    const rowStyle = shouldAnimate ? { '--animation-duration': animationDuration } as React.CSSProperties : undefined;

                    return enableRowReordering ? (
                      <DraggableRow
                        key={row.id}
                        id={row.original.id}
                        className={`${styles.row} ${shouldAnimate ? styles.newRow : ''}`}
                        style={rowStyle}
                        isDragDisabled={!!sorting.length || !!columnFilters.length || !!globalFilter}
                      >
                        {row.getVisibleCells().map((cell) => {
                          const isDragColumn = (cell.column.columnDef.meta as any)?.isDragColumn;
                          return (
                            <td key={cell.id} className={`${styles.td} ${isDragColumn ? styles.dragColumn : ''}`}>
                              {flexRender(cell.column.columnDef.cell, cell.getContext())}
                            </td>
                          );
                        })}
                      </DraggableRow>
                    ) : (
                      <tr
                        key={row.id}
                        className={`${styles.row} ${shouldAnimate ? styles.newRow : ''}`}
                        style={rowStyle}
                      >
                        {row.getVisibleCells().map((cell) => {
                          const isDragColumn = (cell.column.columnDef.meta as any)?.isDragColumn;
                          return (
                            <td key={cell.id} className={`${styles.td} ${isDragColumn ? styles.dragColumn : ''}`}>
                              {flexRender(cell.column.columnDef.cell, cell.getContext())}
                            </td>
                          );
                        })}
                      </tr>
                    );
                  })}
            </tbody>
          </SortableContext>
        </table>

        {/* DragOverlay for smooth drag animations (Phase 6 - Fix snap-back) */}
        <DragOverlay
          dropAnimation={{
            duration: 200,
            easing: 'ease',
          }}
        >
          {activeId ? (() => {
            const activeRow = table.getRowModel().rows.find((row) => row.original.id === activeId);
            if (!activeRow) return null;

            const animationOrder = animatingRows.get(activeRow.original.id);
            const shouldAnimate = animationOrder !== undefined;
            const animationDuration = shouldAnimate ? `${2 + (animationOrder * 0.1)}s` : '2s';
            const rowStyle = shouldAnimate ? { '--animation-duration': animationDuration } as React.CSSProperties : undefined;

            // Calculate total width for the overlay table
            const totalWidth = activeRow.getVisibleCells().reduce((sum, cell) => {
              const isDragCol = (cell.column.columnDef.meta as any)?.isDragColumn;
              return sum + (isDragCol ? 32 : cell.column.getSize());
            }, 0);

            return (
              <div className={styles.dragOverlay}>
                <table style={{
                  width: totalWidth ? `${totalWidth}px` : 'auto',
                  tableLayout: 'fixed',
                  minWidth: '500px'
                }}>
                  <tbody>
                    <tr className={`${styles.row} ${shouldAnimate ? styles.newRow : ''}`} style={rowStyle}>
                      {activeRow.getVisibleCells().map((cell) => {
                        const isDragColumn = (cell.column.columnDef.meta as any)?.isDragColumn;
                        const cellWidth = isDragColumn ? 32 : cell.column.getSize();
                        return (
                          <td
                            key={cell.id}
                            className={`${styles.td} ${isDragColumn ? styles.dragColumn : ''}`}
                            style={{
                              width: `${cellWidth}px`,
                              minWidth: `${cellWidth}px`,
                              maxWidth: `${cellWidth}px`,
                            }}
                          >
                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                          </td>
                        );
                      })}
                    </tr>
                  </tbody>
                </table>
              </div>
            );
          })() : null}
        </DragOverlay>
      </DndContext>
        </div>
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
          onDragCancel={() => setActiveId(null)}
          modifiers={[restrictToVerticalAxis, restrictToParentElement]}
        >
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

                  const isDragColumn = (header.column.columnDef.meta as any)?.isDragColumn;

                  return (
                    <th
                      key={header.id}
                      className={`${styles.th} ${
                        header.column.getCanSort() ? styles.sortable : ''
                      } ${header.column.getIsSorted() ? styles.sorted : ''} ${isDragColumn ? styles.dragColumn : ''}`}
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
          <SortableContext
            items={rowOrder}
            strategy={verticalListSortingStrategy}
          >
            <tbody
              className={styles.tbody}
            >
              {table.getRowModel().rows.map((row) => {
                const animationOrder = animatingRows.get(row.original.id);
                const shouldAnimate = animationOrder !== undefined;
                const animationDuration = shouldAnimate ? `${2 + (animationOrder * 0.1)}s` : '2s';
                const rowStyle = shouldAnimate ? { '--animation-duration': animationDuration } as React.CSSProperties : undefined;

                return enableRowReordering ? (
                  <DraggableRow
                    key={row.id}
                    id={row.original.id}
                    className={`${styles.row} ${shouldAnimate ? styles.newRow : ''}`}
                    style={rowStyle}
                    isDragDisabled={!!sorting.length || !!columnFilters.length || !!globalFilter}
                  >
                    {row.getVisibleCells().map((cell) => {
                      const isDragColumn = (cell.column.columnDef.meta as any)?.isDragColumn;
                      return (
                        <td key={cell.id} className={`${styles.td} ${isDragColumn ? styles.dragColumn : ''}`}>
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </td>
                      );
                    })}
                  </DraggableRow>
                ) : (
                  <tr
                    key={row.id}
                    className={`${styles.row} ${shouldAnimate ? styles.newRow : ''}`}
                    style={rowStyle}
                  >
                    {row.getVisibleCells().map((cell) => {
                      const isDragColumn = (cell.column.columnDef.meta as any)?.isDragColumn;
                      return (
                        <td key={cell.id} className={`${styles.td} ${isDragColumn ? styles.dragColumn : ''}`}>
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </SortableContext>
        </table>

        {/* DragOverlay for smooth drag animations (Phase 6 - Fix snap-back) */}
        <DragOverlay
          dropAnimation={{
            duration: 200,
            easing: 'ease',
          }}
        >
          {activeId ? (() => {
            const activeRow = table.getRowModel().rows.find((row) => row.original.id === activeId);
            if (!activeRow) return null;

            const animationOrder = animatingRows.get(activeRow.original.id);
            const shouldAnimate = animationOrder !== undefined;
            const animationDuration = shouldAnimate ? `${2 + (animationOrder * 0.1)}s` : '2s';
            const rowStyle = shouldAnimate ? { '--animation-duration': animationDuration } as React.CSSProperties : undefined;

            // Calculate total width for the overlay table
            const totalWidth = activeRow.getVisibleCells().reduce((sum, cell) => {
              const isDragCol = (cell.column.columnDef.meta as any)?.isDragColumn;
              return sum + (isDragCol ? 32 : cell.column.getSize());
            }, 0);

            return (
              <div className={styles.dragOverlay}>
                <table style={{
                  width: totalWidth ? `${totalWidth}px` : 'auto',
                  tableLayout: 'fixed',
                  minWidth: '500px'
                }}>
                  <tbody>
                    <tr className={`${styles.row} ${shouldAnimate ? styles.newRow : ''}`} style={rowStyle}>
                      {activeRow.getVisibleCells().map((cell) => {
                        const isDragColumn = (cell.column.columnDef.meta as any)?.isDragColumn;
                        const cellWidth = isDragColumn ? 32 : cell.column.getSize();
                        return (
                          <td
                            key={cell.id}
                            className={`${styles.td} ${isDragColumn ? styles.dragColumn : ''}`}
                            style={{
                              width: `${cellWidth}px`,
                              minWidth: `${cellWidth}px`,
                              maxWidth: `${cellWidth}px`,
                            }}
                          >
                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                          </td>
                        );
                      })}
                    </tr>
                  </tbody>
                </table>
              </div>
            );
          })() : null}
        </DragOverlay>
      </DndContext>
      )}

      {/* Empty state - Phase 5 (Improved UX) */}
      {table.getRowModel().rows.length === 0 && (
        <EmptyState
          onAddRow={handleAddRow}
          enableRowCreation={enableRowCreation}
          isReadOnly={isReadOnly}
        />
      )}

      {/* Loading indicator - Phase 8 (Server mode with infinite scroll) */}
      {mode === TableMode.SERVER && paginationType === PaginationType.INFINITE && (isLoading || isFetchingNextPage) && (
        <div className={styles.loadingIndicator}>
          <div className={styles.spinner} />
          <span>{isLoading ? 'Loading data...' : 'Loading more...'}</span>
        </div>
      )}

      {/* Pagination controls - Phase 8.3 (Traditional pagination) */}
      {mode === TableMode.SERVER && paginationType === PaginationType.TRADITIONAL && (
        <PaginationControls table={table} isLoading={isLoading} />
      )}

      {/* Table footer - Phase 5 (Simplified) */}
      <TableFooter
        totalRows={displayData.length}
      />
    </div>
  );
}
