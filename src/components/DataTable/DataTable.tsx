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
  RowSelectionState,
  ColumnSizingState,
  ColumnOrderState,
  VisibilityState,
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
  horizontalListSortingStrategy,
} from '@dnd-kit/sortable';
import {
  restrictToVerticalAxis,
  restrictToHorizontalAxis,
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
import { DraggableColumnHeader } from './components/DraggableColumnHeader/DraggableColumnHeader';
import { DragHandleCell } from './components/DragHandleCell/DragHandleCell';
import { PaginationControls } from './components/PaginationControls/PaginationControls';
import { SelectionCell } from './cells/SelectionCell';
import { ExpandIcon } from './components/ExpandIcon';
import { BatchActionsToolbar } from './components/BatchActionsToolbar';
import { ColumnVisibilityMenu } from './components/ColumnVisibilityMenu/ColumnVisibilityMenu';
import { RowDetailsModal } from './components/RowDetailsModal/RowDetailsModal';
import { ImportExportButtons } from './components/ImportExportButtons/ImportExportButtons';
import {
  applyTextFilter,
  applyNumberFilter,
  applyDateFilter,
  applySelectFilter,
  applyBooleanFilter,
  applyBadgeFilter,
  applyProgressFilter,
  applyReferenceFilter,
  TextFilterValue,
  NumberFilterValue,
  DateFilterValue,
  SelectFilterValue,
  BooleanFilterValue,
  BadgeFilterValue,
  ProgressFilterValue,
  ReferenceFilterValue,
} from './components/filters';
import { CellType } from './types/cell.types';
import { VIRTUALIZATION } from './utils/constants';
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

const booleanFilterFn: FilterFn<any> = (row, columnId, filterValue) => {
  const value = row.getValue(columnId);
  return applyBooleanFilter(value, filterValue as BooleanFilterValue);
};

const badgeFilterFn: FilterFn<any> = (row, columnId, filterValue) => {
  const value = row.getValue(columnId);
  return applyBadgeFilter(value, filterValue as BadgeFilterValue);
};

const progressFilterFn: FilterFn<any> = (row, columnId, filterValue) => {
  const value = row.getValue(columnId);
  return applyProgressFilter(value, filterValue as ProgressFilterValue);
};

const referenceFilterFn: FilterFn<any> = (row, columnId, filterValue) => {
  const value = row.getValue(columnId);
  return applyReferenceFilter(value, filterValue as ReferenceFilterValue);
};

export function DataTable<TData extends RowData>({
  tableId,
  columns,
  data = [],
  className,
  mode = TableMode.CLIENT,
  paginationType = PaginationType.INFINITE,
  onFetchNextPage,
  hasNextPage,
  isFetchingNextPage,
  totalRows,
  pageCount,
  isLoading = false,
  isFetching = false,
  onPaginationChange,
  onSortChange,
  onFilterChange,
  enableSorting = true,
  enableInlineEditing = true,
  enableRowCreation = true,
  enableRowDeletion = true,
  enableRowCopy = true,
  enableRowInsertion = true,
  enableRowReordering = false,
  enableVirtualization = false,
  enableStickyFirstColumn = false,
  enableRowExpanding = false,
  enableColumnResizing = false,
  enableColumnReordering = false,
  renderExpandedContent,
  rowHeight = 53,
  pageSizeOptions,
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

  // Row selection state (Phase 10.1 - Row selection & batch editing)
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});

  // Expanded rows state (Phase 10.5 - Row expanding)
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

  // Column sizing state (Phase 10.3 - Column resizing)
  const [columnSizing, setColumnSizing] = useState<ColumnSizingState>({});

  // Column order state (Phase 10.6 - Column reordering)
  // Initialize with empty array - will be set after tableColumns are computed
  const [columnOrder, setColumnOrder] = useState<ColumnOrderState>([]);

  // Column visibility state (Phase 10.7 - Column visibility toggle)
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});

  // Row details modal state (Phase 10.8 - Row details modal)
  const [detailsRowId, setDetailsRowId] = useState<string | null>(null);

  // Horizontal scroll shadows state (Phase 10.2 - Horizontal scroll)
  const [showLeftShadow, setShowLeftShadow] = useState(false);
  const [showRightShadow, setShowRightShadow] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

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

  // Phase 8.4: Notify parent of sorting changes (server mode only)
  useEffect(() => {
    if (mode === TableMode.SERVER && onSortChange) {
      onSortChange(sorting);
    }
  }, [sorting, mode, onSortChange]);

  // Phase 8.4: Notify parent of filter changes (server mode only)
  useEffect(() => {
    if (mode === TableMode.SERVER && onFilterChange) {
      // Convert TanStack Table filter format to simple key-value format for API
      const filterParams: Record<string, any> = {};

      columnFilters.forEach((filter) => {
        filterParams[filter.id] = filter.value;
      });

      if (globalFilter) {
        filterParams.q = globalFilter; // Use 'q' for json-server full-text search
      }

      onFilterChange(filterParams);
    }
  }, [columnFilters, globalFilter, mode, onFilterChange]);

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

  // Handle column drag end (Phase 10.6 - Column reordering)
  const handleColumnDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over || active.id === over.id) {
      return;
    }

    const oldIndex = columnOrder.indexOf(active.id as string);
    const newIndex = columnOrder.indexOf(over.id as string);

    if (oldIndex !== -1 && newIndex !== -1) {
      setColumnOrder(arrayMove(columnOrder, oldIndex, newIndex));
    }
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

  // Column order initialization ref to track if we've set it (Phase 10.6)
  const columnOrderInitialized = useRef(false);

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
          case CellType.CHECKBOX:
            filterFn = booleanFilterFn as FilterFn<TData>;
            break;
          case CellType.BADGE:
            filterFn = badgeFilterFn as FilterFn<TData>;
            break;
          case CellType.PROGRESS:
            filterFn = progressFilterFn as FilterFn<TData>;
            break;
          case CellType.REFERENCE:
            filterFn = referenceFilterFn as FilterFn<TData>;
            break;
          case CellType.TEXT:
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
        cell: (info: any) => {
          const rowId = info.row.original.id;
          const columnId = info.column.id;
          // Use accessorKey for saving (the actual data field), not column.id
          const dataField = ('accessorKey' in col ? (col.accessorKey as string) : null) || columnId;
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
              onSave={(newValue) => handleSaveEdit(rowId, dataField, newValue)}
              onCancel={handleCancelEdit}
              referenceType={columnDef.cellOptions?.referenceType}
              onCreateSuccess={columnDef.cellOptions?.onReferenceCreateSuccess}
            />
          );
        },
      };
    });

    // Add selection column if row selection is enabled (Phase 10.1)
    // Selection column always goes first
    userColumns.unshift({
      id: '_select',
      header: ({ table }) => (
        <SelectionCell
          checked={table.getIsAllRowsSelected()}
          indeterminate={table.getIsSomeRowsSelected()}
          onChange={(checked) => table.toggleAllRowsSelected(checked)}
        />
      ),
      cell: ({ row }) => (
        <SelectionCell
          checked={row.getIsSelected()}
          onChange={(checked) => row.toggleSelected(checked)}
        />
      ),
      size: 48,
      minSize: 48,
      maxSize: 48,
      enableSorting: false,
      enableColumnFilter: false,
      enableResizing: false,
      meta: { isSelectionColumn: true },
    } as ColumnDef<TData>);

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

    // Add expand column if row expanding is enabled (Phase 10.5)
    if (enableRowExpanding && renderExpandedContent) {
      userColumns.unshift({
        id: '_expand',
        header: '',
        cell: ({ row }) => {
          const rowId = row.original.id;
          const isExpanded = expandedRows.has(rowId);
          return (
            <ExpandIcon
              isExpanded={isExpanded}
              onClick={() => {
                setExpandedRows((prev) => {
                  const newSet = new Set(prev);
                  if (newSet.has(rowId)) {
                    newSet.delete(rowId);
                  } else {
                    newSet.add(rowId);
                  }
                  return newSet;
                });
              }}
            />
          );
        },
        size: 32,
        minSize: 32,
        maxSize: 32,
        enableSorting: false,
        enableColumnFilter: false,
        enableResizing: false,
        meta: { isExpandColumn: true },
      } as any);
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
            onViewDetails={setDetailsRowId} // Phase 10.8: Row details modal
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

  // Initialize column order (Phase 10.6 - Column reordering)
  // Use useLayoutEffect to initialize synchronously before paint
  React.useLayoutEffect(() => {
    if (!columnOrderInitialized.current && tableColumns.length > 0) {
      const initialOrder = tableColumns.map((col) => (col as any).id || (col as any).accessorKey);
      setColumnOrder(initialOrder);
      columnOrderInitialized.current = true;
    }
  }, [tableColumns]);

  // Determine if using manual pagination (Phase 8.3)
  const useManualPagination = mode === TableMode.SERVER && paginationType === PaginationType.TRADITIONAL;

  // Determine if using traditional pagination (any mode) - for CSS styling
  const isTraditionalPagination = paginationType === PaginationType.TRADITIONAL;

  // Initialize TanStack Table
  const table = useReactTable({
    data: displayData,
    columns: tableColumns,
    state: {
      sorting,
      globalFilter,
      columnFilters,
      rowSelection, // Phase 10.1: Row selection state
      columnSizing, // Phase 10.3: Column sizing state
      ...(columnOrder.length > 0 ? { columnOrder } : {}), // Phase 10.6: Only set if initialized
      columnVisibility, // Phase 10.7: Column visibility state
      ...(useManualPagination ? { pagination } : {}),
    },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    onColumnFiltersChange: setColumnFilters,
    onRowSelectionChange: setRowSelection, // Phase 10.1: Row selection handler
    onColumnSizingChange: setColumnSizing, // Phase 10.3: Column sizing handler
    onColumnOrderChange: setColumnOrder, // Phase 10.6: Column order handler
    onColumnVisibilityChange: setColumnVisibility, // Phase 10.7: Column visibility handler
    enableRowSelection: true, // Phase 10.1: Enable row selection
    columnResizeMode: 'onChange', // Phase 10.3: Update column size on drag
    ...(useManualPagination ? { onPaginationChange: setPagination } : {}),
    getCoreRowModel: getCoreRowModel(),
    // Phase 8.4: Only use client-side sorting/filtering in client mode
    getSortedRowModel: mode === TableMode.CLIENT ? getSortedRowModel() : undefined,
    getFilteredRowModel: mode === TableMode.CLIENT ? getFilteredRowModel() : undefined,
    manualSorting: mode === TableMode.SERVER,
    manualFiltering: mode === TableMode.SERVER,
    // Manual pagination for server mode with traditional pagination
    ...(useManualPagination
      ? {
          manualPagination: true,
          pageCount: pageCount ?? Math.ceil((totalRows ?? 0) / pagination.pageSize),
        }
      : {}),
    // Use row.original.id as the unique identifier for selection
    getRowId: (row) => row.id,
  });

  // Virtualization setup (Phase 7 & 8.2)
  // Server infinite scroll: virtualize with TOTAL count (scrollbar shows full dataset)
  // Client infinite scroll: virtualize with all data in memory
  const isServerInfinite = mode === TableMode.SERVER && paginationType === PaginationType.INFINITE;
  const shouldUseVirtualization = enableVirtualization && !isTraditionalPagination;

  // For server infinite scroll, use total count so scrollbar represents full dataset
  // Cap at MAX_VIRTUAL_ROWS to prevent browser scroll height limits (17-33M pixels)
  const rawVirtualCount = isServerInfinite && totalRows
    ? totalRows
    : table.getRowModel().rows.length;

  const virtualizerCount = Math.min(rawVirtualCount, VIRTUALIZATION.MAX_VIRTUAL_ROWS);
  const isVirtualizationCapped = isServerInfinite && totalRows && totalRows > VIRTUALIZATION.MAX_VIRTUAL_ROWS;

  const rowVirtualizer = useVirtualizer({
    count: virtualizerCount,
    getScrollElement: () => useManualPagination ? scrollContainerRef.current : tbodyRef.current,
    estimateSize: React.useCallback((index: number) => {
      // If row expanding is enabled, check if this row is expanded
      if (enableRowExpanding) {
        const row = table.getRowModel().rows[index];
        if (row && expandedRows.has(row.original.id)) {
          // Expanded rows need more height (base height + estimated expanded content height)
          return rowHeight + 200; // 200px is an estimate for expanded content
        }
      }
      return rowHeight;
    }, [enableRowExpanding, expandedRows, rowHeight, table]),
    overscan: 10,
    enabled: shouldUseVirtualization,
  });

  // Recalculate virtualizer sizes when rows expand/collapse (Phase 10.5)
  useEffect(() => {
    if (shouldUseVirtualization && enableRowExpanding) {
      rowVirtualizer.measure();
    }
  }, [expandedRows, shouldUseVirtualization, enableRowExpanding, rowVirtualizer]);

  // Pagination change callback (Phase 8.3 - Traditional pagination)
  useEffect(() => {
    if (!useManualPagination || !onPaginationChange) return;
    onPaginationChange(pagination);
  }, [pagination, useManualPagination, onPaginationChange]);

  // Infinite scroll detection (Phase 8.2 - Server mode with infinite pagination)
  // Fetch next page when user scrolls into skeleton territory
  useEffect(() => {
    if (mode !== TableMode.SERVER || paginationType !== PaginationType.INFINITE) return;
    if (!onFetchNextPage || !hasNextPage || isFetchingNextPage) return;
    if (!shouldUseVirtualization) return;

    const virtualItems = rowVirtualizer.getVirtualItems();
    if (virtualItems.length === 0) return;

    const loadedRowCount = table.getRowModel().rows.length;

    // Find the last visible item index
    const lastVisibleIndex = virtualItems[virtualItems.length - 1]?.index;

    // Only fetch if user is viewing within 3 rows of the loaded data boundary
    // This prevents aggressive fetching while still loading before user sees skeletons
    if (lastVisibleIndex !== undefined && lastVisibleIndex >= loadedRowCount - 3) {
      onFetchNextPage();
    }
  }, [
    mode,
    paginationType,
    shouldUseVirtualization,
    rowVirtualizer.getVirtualItems(),
    table.getRowModel().rows.length,
    onFetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  ]);

  // Horizontal scroll shadow detection (Phase 10.2)
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleHorizontalScroll = () => {
      const { scrollLeft, scrollWidth, clientWidth } = container;

      // Show left shadow if scrolled right
      setShowLeftShadow(scrollLeft > 0);

      // Show right shadow if not scrolled to the end
      setShowRightShadow(scrollLeft + clientWidth < scrollWidth - 1);
    };

    // Check on mount
    handleHorizontalScroll();

    // Listen for scroll and resize events
    container.addEventListener('scroll', handleHorizontalScroll);
    window.addEventListener('resize', handleHorizontalScroll);

    return () => {
      container.removeEventListener('scroll', handleHorizontalScroll);
      window.removeEventListener('resize', handleHorizontalScroll);
    };
  }, [data, columnFilters, globalFilter]); // Re-check when data or filters change

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

  // Show overlay during pagination fetch (not initial load)
  const showLoadingOverlay = useManualPagination && isFetching && !isLoading;

  return (
    <div
      ref={containerRef}
      className={`${styles.tableContainer} ${className || ''} ${showLeftShadow ? styles.hasScrollShadowLeft : ''} ${showRightShadow ? styles.hasScrollShadowRight : ''}`}
      onClick={handleContainerClick}
    >
      {/* Table toolbar - Phase 5 (Improved UX) */}
      <TableToolbar
        isReadOnly={isReadOnly}
      />

      {/* Global search, column visibility, and import/export - Phase 3, 10.7 & 10.9 */}
      <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap' }}>
        <GlobalSearch
          value={globalFilter}
          onChange={setGlobalFilter}
        />
        <ColumnVisibilityMenu table={table} />
        <ImportExportButtons
          data={displayData}
          columns={columns}
          tableId={tableId}
          onImport={(importedData) => {
            // Add imported rows as new rows
            importedData.forEach((row) => {
              const newId = `import_${Date.now()}_${Math.random()}`;
              setModifiedData((prev) => new Map(prev).set(newId, row as any));
              setNewRows((prev) => new Set(prev).add(newId));
            });
          }}
        />
      </div>

      {/* Active filter chips - Phase 3 */}
      <FilterChips
        columnFilters={columnFilters}
        globalFilter={globalFilter}
        onRemoveColumnFilter={handleRemoveColumnFilter}
        onRemoveGlobalFilter={handleRemoveGlobalFilter}
        onClearAll={handleClearAllFilters}
        columnNames={columnNames}
        columns={columns}
      />

      {/* Virtualization cap warning - Phase 8.2 */}
      {isVirtualizationCapped && (
        <div className={styles.warningBanner}>
          <div className={styles.warningIcon}>⚠️</div>
          <div className={styles.warningContent}>
            <strong>Large Dataset Limited:</strong> Showing first{' '}
            {VIRTUALIZATION.MAX_VIRTUAL_ROWS.toLocaleString()} of {totalRows?.toLocaleString()} rows.
            Use filters to refine your results and access specific data.
          </div>
        </div>
      )}

      {/* Batch actions toolbar - Phase 10.1 */}
      <BatchActionsToolbar
        selectedCount={Object.keys(rowSelection).length}
        onClearSelection={() => setRowSelection({})}
        onBatchDelete={() => {
          // Get selected row IDs
          const selectedRowIds = Object.keys(rowSelection);
          // Delete each selected row
          selectedRowIds.forEach((rowId) => {
            handleDeleteRow(rowId);
          });
          // Clear selection after delete
          setRowSelection({});
        }}
      />

      {enableVirtualization ? (
        <div ref={scrollContainerRef} className={`${styles.virtualizationContainer} ${isTraditionalPagination ? styles.paginationMode : ''} ${showLoadingOverlay ? styles.loadingOverlay : ''}`}>
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
            onDragCancel={() => setActiveId(null)}
            modifiers={[restrictToVerticalAxis, restrictToParentElement]}
          >
            <table className={`${styles.table} ${enableStickyFirstColumn ? styles.stickyFirstColumn : ''}`}>
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleColumnDragEnd}
            modifiers={[restrictToHorizontalAxis]}
          >
          <thead ref={theadRef} className={styles.thead}>
            {table.getHeaderGroups().map((headerGroup) => (
              <SortableContext
                key={headerGroup.id}
                items={columnOrder}
                strategy={horizontalListSortingStrategy}
                disabled={!enableColumnReordering}
              >
              <tr className={styles.headerRow}>
                {headerGroup.headers.map((header) => {
                  // Find the original column definition by matching id or accessorKey
                  const columnDef = columns.find(
                    (c) => c.id === header.id || (c as any).accessorKey === header.id
                  ) as any;
                  const cellType = columnDef?.cellType || CellType.TEXT;
                  const canFilter = header.column.getCanFilter();

                  const isDragColumn = (header.column.columnDef.meta as any)?.isDragColumn;
                  const isSelectionColumn = (header.column.columnDef.meta as any)?.isSelectionColumn;
                  const isExpandColumn = (header.column.columnDef.meta as any)?.isExpandColumn;

                  // Don't make special columns (drag, selection, expand) reorderable
                  const isReorderable = enableColumnReordering && !isDragColumn && !isSelectionColumn && !isExpandColumn;

                  const headerContent = (
                    <>
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
                              cellOptions={columnDef?.cellOptions}
                              selectOptions={columnDef?.cellOptions?.options || []}
                              headerElement={theadRef.current}
                            />
                          )}
                        </div>
                      </div>
                      {/* Resize handle - Phase 10.3 */}
                      {enableColumnResizing && header.column.getCanResize() && (
                        <div
                          onMouseDown={header.getResizeHandler()}
                          onTouchStart={header.getResizeHandler()}
                          className={`${styles.resizeHandle} ${header.column.getIsResizing() ? styles.isResizing : ''}`}
                        />
                      )}
                    </>
                  );

                  const headerClassName = `${styles.th} ${
                    header.column.getCanSort() ? styles.sortable : ''
                  } ${header.column.getIsSorted() ? styles.sorted : ''} ${isDragColumn ? styles.dragColumn : ''} ${isSelectionColumn ? styles.selectionColumn : ''} ${isExpandColumn ? styles.expandColumn : ''}`;

                  const headerStyle = {
                    cursor: header.column.getCanSort() ? 'pointer' : 'default',
                    width: header.getSize(),
                    position: 'relative' as const,
                  };

                  return isReorderable ? (
                    <DraggableColumnHeader
                      key={header.id}
                      id={header.id}
                      className={headerClassName}
                      style={headerStyle}
                      onClick={header.column.getToggleSortingHandler()}
                    >
                      {headerContent}
                    </DraggableColumnHeader>
                  ) : (
                    <th
                      key={header.id}
                      className={headerClassName}
                      style={headerStyle}
                      onClick={header.column.getToggleSortingHandler()}
                    >
                      {headerContent}
                    </th>
                  );
                })}
              </tr>
              </SortableContext>
            ))}
          </thead>
          </DndContext>
          <SortableContext
            items={rowOrder}
            strategy={verticalListSortingStrategy}
          >
            <tbody
              ref={tbodyRef}
              className={styles.tbody}
            >
              {shouldUseVirtualization ? (
                <div
                  className={styles.virtualScrollContent}
                  style={{
                    height: `${rowVirtualizer.getTotalSize()}px`,
                  }}
                >
                  {rowVirtualizer.getVirtualItems().map((virtualRow) => {
                    const row = table.getRowModel().rows[virtualRow.index];

                    // Server infinite scroll: render skeleton for unloaded data
                    if (!row && isServerInfinite) {
                      const skeletonStyle: React.CSSProperties = {
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        transform: `translateY(${virtualRow.start}px)`,
                        height: `${rowHeight}px`,
                      };

                      return (
                        <tr key={`skeleton-${virtualRow.index}`} className={styles.row} style={skeletonStyle}>
                          {table.getAllColumns().map((column) => (
                            <td key={column.id} className={styles.td}>
                              <div className={styles.skeleton} />
                            </td>
                          ))}
                        </tr>
                      );
                    }

                    if (!row) return null;

                    const animationOrder = animatingRows.get(row.original.id);
                    const shouldAnimate = animationOrder !== undefined;
                    const animationDuration = shouldAnimate ? `${2 + (animationOrder * 0.1)}s` : '2s';
                    const isExpanded = enableRowExpanding && expandedRows.has(row.original.id);

                    // Container style for absolute positioning
                    const containerStyle: React.CSSProperties = {
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      width: '100%',
                      transform: `translateY(${virtualRow.start}px)`,
                    };

                    const rowStyle: React.CSSProperties = {
                      ...(shouldAnimate ? { '--animation-duration': animationDuration } as React.CSSProperties : undefined),
                    };

                    return (
                      <React.Fragment key={row.id}>
                        <div style={containerStyle}>
                          {enableRowReordering ? (
                            <DraggableRow
                              id={row.original.id}
                              className={`${styles.row} ${shouldAnimate ? styles.newRow : ''}`}
                              style={rowStyle}
                              isDragDisabled={!!sorting.length || !!columnFilters.length || !!globalFilter}
                            >
                              {row.getVisibleCells().map((cell) => {
                                const isDragColumn = (cell.column.columnDef.meta as any)?.isDragColumn;
                                const isSelectionColumn = (cell.column.columnDef.meta as any)?.isSelectionColumn;
                                const isExpandColumn = (cell.column.columnDef.meta as any)?.isExpandColumn;
                                return (
                                  <td key={cell.id} className={`${styles.td} ${isDragColumn ? styles.dragColumn : ''} ${isSelectionColumn ? styles.selectionColumn : ''} ${isExpandColumn ? styles.expandColumn : ''}`}>
                                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                  </td>
                                );
                              })}
                            </DraggableRow>
                          ) : (
                            <tr
                              className={`${styles.row} ${shouldAnimate ? styles.newRow : ''}`}
                              style={rowStyle}
                            >
                              {row.getVisibleCells().map((cell) => {
                                const isDragColumn = (cell.column.columnDef.meta as any)?.isDragColumn;
                                const isSelectionColumn = (cell.column.columnDef.meta as any)?.isSelectionColumn;
                                const isExpandColumn = (cell.column.columnDef.meta as any)?.isExpandColumn;
                                return (
                                  <td key={cell.id} className={`${styles.td} ${isDragColumn ? styles.dragColumn : ''} ${isSelectionColumn ? styles.selectionColumn : ''} ${isExpandColumn ? styles.expandColumn : ''}`}>
                                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                  </td>
                                );
                              })}
                            </tr>
                          )}
                          {/* Expanded row content (Phase 10.5) */}
                          {isExpanded && renderExpandedContent && (
                            <tr className={styles.expandedRow}>
                              <td colSpan={row.getVisibleCells().length} className={styles.expandedContent}>
                                {renderExpandedContent(row.original)}
                              </td>
                            </tr>
                          )}
                        </div>
                      </React.Fragment>
                    );
                  })}
                </div>
              ) : (
                table.getRowModel().rows.map((row) => {
                    const animationOrder = animatingRows.get(row.original.id);
                    const shouldAnimate = animationOrder !== undefined;
                    const animationDuration = shouldAnimate ? `${2 + (animationOrder * 0.1)}s` : '2s';
                    const rowStyle = shouldAnimate ? { '--animation-duration': animationDuration } as React.CSSProperties : undefined;
                    const isExpanded = enableRowExpanding && expandedRows.has(row.original.id);

                    return (
                      <React.Fragment key={row.id}>
                        {enableRowReordering ? (
                          <DraggableRow
                            id={row.original.id}
                            className={`${styles.row} ${shouldAnimate ? styles.newRow : ''}`}
                            style={rowStyle}
                            isDragDisabled={!!sorting.length || !!columnFilters.length || !!globalFilter}
                          >
                            {row.getVisibleCells().map((cell) => {
                              const isDragColumn = (cell.column.columnDef.meta as any)?.isDragColumn;
                              const isSelectionColumn = (cell.column.columnDef.meta as any)?.isSelectionColumn;
                              const isExpandColumn = (cell.column.columnDef.meta as any)?.isExpandColumn;
                              return (
                                <td key={cell.id} className={`${styles.td} ${isDragColumn ? styles.dragColumn : ''} ${isSelectionColumn ? styles.selectionColumn : ''} ${isExpandColumn ? styles.expandColumn : ''}`}>
                                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                </td>
                              );
                            })}
                          </DraggableRow>
                        ) : (
                          <tr
                            className={`${styles.row} ${shouldAnimate ? styles.newRow : ''}`}
                            style={rowStyle}
                          >
                            {row.getVisibleCells().map((cell) => {
                              const isDragColumn = (cell.column.columnDef.meta as any)?.isDragColumn;
                              const isSelectionColumn = (cell.column.columnDef.meta as any)?.isSelectionColumn;
                              const isExpandColumn = (cell.column.columnDef.meta as any)?.isExpandColumn;
                              return (
                                <td key={cell.id} className={`${styles.td} ${isDragColumn ? styles.dragColumn : ''} ${isSelectionColumn ? styles.selectionColumn : ''} ${isExpandColumn ? styles.expandColumn : ''}`}>
                                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                </td>
                              );
                            })}
                          </tr>
                        )}
                        {/* Expanded row content (Phase 10.5) */}
                        {isExpanded && renderExpandedContent && (
                          <tr className={styles.expandedRow}>
                            <td colSpan={row.getVisibleCells().length} className={styles.expandedContent}>
                              {renderExpandedContent(row.original)}
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    );
                  })
              )}
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
              const isExpandCol = (cell.column.columnDef.meta as any)?.isExpandColumn;
              const isSelectCol = (cell.column.columnDef.meta as any)?.isSelectionColumn;
              return sum + (isDragCol ? 32 : (isExpandCol ? 32 : (isSelectCol ? 48 : cell.column.getSize())));
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
                        const isSelectionColumn = (cell.column.columnDef.meta as any)?.isSelectionColumn;
                        const isExpandColumn = (cell.column.columnDef.meta as any)?.isExpandColumn;
                        const cellWidth = isDragColumn ? 32 : (isExpandColumn ? 32 : (isSelectionColumn ? 48 : cell.column.getSize()));
                        return (
                          <td
                            key={cell.id}
                            className={`${styles.td} ${isDragColumn ? styles.dragColumn : ''} ${isSelectionColumn ? styles.selectionColumn : ''} ${isExpandColumn ? styles.expandColumn : ''}`}
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
        <div className={showLoadingOverlay ? styles.loadingOverlay : ''}>
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
            onDragCancel={() => setActiveId(null)}
            modifiers={[restrictToVerticalAxis, restrictToParentElement]}
          >
            <table className={`${styles.table} ${enableStickyFirstColumn ? styles.stickyFirstColumn : ''}`}>
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleColumnDragEnd}
            modifiers={[restrictToHorizontalAxis]}
          >
          <thead ref={theadRef} className={styles.thead}>
            {table.getHeaderGroups().map((headerGroup) => (
              <SortableContext
                key={headerGroup.id}
                items={columnOrder}
                strategy={horizontalListSortingStrategy}
                disabled={!enableColumnReordering}
              >
              <tr className={styles.headerRow}>
                {headerGroup.headers.map((header) => {
                  // Find the original column definition by matching id or accessorKey
                  const columnDef = columns.find(
                    (c) => c.id === header.id || (c as any).accessorKey === header.id
                  ) as any;
                  const cellType = columnDef?.cellType || CellType.TEXT;
                  const canFilter = header.column.getCanFilter();

                  const isDragColumn = (header.column.columnDef.meta as any)?.isDragColumn;
                  const isSelectionColumn = (header.column.columnDef.meta as any)?.isSelectionColumn;
                  const isExpandColumn = (header.column.columnDef.meta as any)?.isExpandColumn;

                  // Don't make special columns (drag, selection, expand) reorderable
                  const isReorderable = enableColumnReordering && !isDragColumn && !isSelectionColumn && !isExpandColumn;

                  const headerContent = (
                    <>
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
                              cellOptions={columnDef?.cellOptions}
                              selectOptions={columnDef?.cellOptions?.options || []}
                              headerElement={theadRef.current}
                            />
                          )}
                        </div>
                      </div>
                      {/* Resize handle - Phase 10.3 */}
                      {enableColumnResizing && header.column.getCanResize() && (
                        <div
                          onMouseDown={header.getResizeHandler()}
                          onTouchStart={header.getResizeHandler()}
                          className={`${styles.resizeHandle} ${header.column.getIsResizing() ? styles.isResizing : ''}`}
                        />
                      )}
                    </>
                  );

                  const headerClassName = `${styles.th} ${
                    header.column.getCanSort() ? styles.sortable : ''
                  } ${header.column.getIsSorted() ? styles.sorted : ''} ${isDragColumn ? styles.dragColumn : ''} ${isSelectionColumn ? styles.selectionColumn : ''} ${isExpandColumn ? styles.expandColumn : ''}`;

                  const headerStyle = {
                    cursor: header.column.getCanSort() ? 'pointer' : 'default',
                    width: header.getSize(),
                    position: 'relative' as const,
                  };

                  return isReorderable ? (
                    <DraggableColumnHeader
                      key={header.id}
                      id={header.id}
                      className={headerClassName}
                      style={headerStyle}
                      onClick={header.column.getToggleSortingHandler()}
                    >
                      {headerContent}
                    </DraggableColumnHeader>
                  ) : (
                    <th
                      key={header.id}
                      className={headerClassName}
                      style={headerStyle}
                      onClick={header.column.getToggleSortingHandler()}
                    >
                      {headerContent}
                    </th>
                  );
                })}
              </tr>
              </SortableContext>
            ))}
          </thead>
          </DndContext>
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
                const isExpanded = enableRowExpanding && expandedRows.has(row.original.id);

                return (
                  <React.Fragment key={row.id}>
                    {enableRowReordering ? (
                      <DraggableRow
                        id={row.original.id}
                        className={`${styles.row} ${shouldAnimate ? styles.newRow : ''}`}
                        style={rowStyle}
                        isDragDisabled={!!sorting.length || !!columnFilters.length || !!globalFilter}
                      >
                        {row.getVisibleCells().map((cell) => {
                          const isDragColumn = (cell.column.columnDef.meta as any)?.isDragColumn;
                          const isSelectionColumn = (cell.column.columnDef.meta as any)?.isSelectionColumn;
                          const isExpandColumn = (cell.column.columnDef.meta as any)?.isExpandColumn;
                          return (
                            <td key={cell.id} className={`${styles.td} ${isDragColumn ? styles.dragColumn : ''} ${isSelectionColumn ? styles.selectionColumn : ''} ${isExpandColumn ? styles.expandColumn : ''}`}>
                              {flexRender(cell.column.columnDef.cell, cell.getContext())}
                            </td>
                          );
                        })}
                      </DraggableRow>
                    ) : (
                      <tr
                        className={`${styles.row} ${shouldAnimate ? styles.newRow : ''}`}
                        style={rowStyle}
                      >
                        {row.getVisibleCells().map((cell) => {
                          const isDragColumn = (cell.column.columnDef.meta as any)?.isDragColumn;
                          const isSelectionColumn = (cell.column.columnDef.meta as any)?.isSelectionColumn;
                          const isExpandColumn = (cell.column.columnDef.meta as any)?.isExpandColumn;
                          return (
                            <td key={cell.id} className={`${styles.td} ${isDragColumn ? styles.dragColumn : ''} ${isSelectionColumn ? styles.selectionColumn : ''} ${isExpandColumn ? styles.expandColumn : ''}`}>
                              {flexRender(cell.column.columnDef.cell, cell.getContext())}
                            </td>
                          );
                        })}
                      </tr>
                    )}
                    {/* Expanded row content (Phase 10.5) */}
                    {isExpanded && renderExpandedContent && (
                      <tr className={styles.expandedRow}>
                        <td colSpan={row.getVisibleCells().length} className={styles.expandedContent}>
                          {renderExpandedContent(row.original)}
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
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
              const isExpandCol = (cell.column.columnDef.meta as any)?.isExpandColumn;
              const isSelectCol = (cell.column.columnDef.meta as any)?.isSelectionColumn;
              return sum + (isDragCol ? 32 : (isExpandCol ? 32 : (isSelectCol ? 48 : cell.column.getSize())));
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
                        const isSelectionColumn = (cell.column.columnDef.meta as any)?.isSelectionColumn;
                        const isExpandColumn = (cell.column.columnDef.meta as any)?.isExpandColumn;
                        const cellWidth = isDragColumn ? 32 : (isExpandColumn ? 32 : (isSelectionColumn ? 48 : cell.column.getSize()));
                        return (
                          <td
                            key={cell.id}
                            className={`${styles.td} ${isDragColumn ? styles.dragColumn : ''} ${isSelectionColumn ? styles.selectionColumn : ''} ${isExpandColumn ? styles.expandColumn : ''}`}
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
      {paginationType === PaginationType.TRADITIONAL && (
        <PaginationControls
          table={table}
          isLoading={isLoading}
          isFetching={isFetching}
          pageSizeOptions={pageSizeOptions}
          onPageSizeChange={(newSize) => {
            // Notify parent component of page size change
            if (onPaginationChange) {
              onPaginationChange({ pageIndex: 0, pageSize: newSize });
            }
          }}
        />
      )}

      {/* Table footer - Phase 5 (Simplified), Phase 8 (Enhanced for infinite scroll) */}
      <TableFooter
        totalRows={displayData.length}
        mode={mode}
        paginationType={paginationType}
        hasNextPage={hasNextPage}
        totalCount={totalRows} // Total available on server
        isCapped={isVirtualizationCapped}
        maxVirtualRows={VIRTUALIZATION.MAX_VIRTUAL_ROWS}
      />

      {/* Row details modal - Phase 10.8 */}
      {detailsRowId && (
        <RowDetailsModal
          row={displayData.find((row) => row.id === detailsRowId) as TData}
          columns={columns}
          onClose={() => setDetailsRowId(null)}
          isOpen={!!detailsRowId}
        />
      )}
    </div>
  );
}
