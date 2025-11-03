/**
 * Main Zustand store for table state management
 */

import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { RowData, CellId, RowChanges } from '../types/table.types';
import { FilterState } from '../types/filter.types';
import { SortingState } from '@tanstack/react-table';

interface TableDataState {
  data: Map<string, RowData[]>;
  totalCounts: Map<string, number>;
}

interface TableUIState {
  // Editing state
  editingCell: CellId | null;
  editingRow: string | null;

  // Selection state
  selectedRows: Map<string, Set<string>>; // tableId -> Set of rowIds

  // Mobile expanded rows
  expandedRows: Map<string, Set<string>>; // tableId -> Set of rowIds

  // Loading states
  loadingStates: Map<string, boolean>; // tableId -> isLoading

  // Error states
  errors: Map<string, Error | null>; // tableId -> error
}

interface TableFilterSortState {
  // Filters per table
  filters: Map<string, FilterState>;

  // Sorting per table
  sorting: Map<string, SortingState>;

  // Global search per table
  globalSearch: Map<string, string>;
}

interface TableChangesState {
  // Track unsaved changes
  pendingChanges: Map<string, Map<string, RowChanges>>; // tableId -> rowId -> changes
}

interface TableStore
  extends TableDataState,
    TableUIState,
    TableFilterSortState,
    TableChangesState {
  // Data actions
  setTableData: (tableId: string, data: RowData[], totalCount?: number) => void;
  updateRow: (tableId: string, rowId: string, data: Partial<RowData>) => void;
  addRow: (tableId: string, row: RowData) => void;
  removeRow: (tableId: string, rowId: string) => void;
  reorderRows: (tableId: string, rowIds: string[]) => void;

  // UI actions
  setEditingCell: (cellId: CellId | null) => void;
  setEditingRow: (rowId: string | null) => void;
  toggleRowSelection: (tableId: string, rowId: string) => void;
  selectAllRows: (tableId: string, rowIds: string[]) => void;
  clearSelection: (tableId: string) => void;
  toggleRowExpanded: (tableId: string, rowId: string) => void;
  setLoading: (tableId: string, isLoading: boolean) => void;
  setError: (tableId: string, error: Error | null) => void;

  // Filter & Sort actions
  setFilters: (tableId: string, filters: FilterState) => void;
  setSorting: (tableId: string, sorting: SortingState) => void;
  setGlobalSearch: (tableId: string, search: string) => void;

  // Changes tracking actions
  markRowChanged: (tableId: string, rowId: string, original: RowData, modified: Partial<RowData>, isNew: boolean) => void;
  clearRowChanges: (tableId: string, rowId: string) => void;
  clearAllChanges: (tableId: string) => void;
  getRowChanges: (tableId: string, rowId: string) => RowChanges | null;
  hasUnsavedChanges: (tableId: string) => boolean;

  // Utility actions
  clearTableState: (tableId: string) => void;
  reset: () => void;
}

const initialState: TableDataState & TableUIState & TableFilterSortState & TableChangesState = {
  // Data
  data: new Map(),
  totalCounts: new Map(),

  // UI
  editingCell: null,
  editingRow: null,
  selectedRows: new Map(),
  expandedRows: new Map(),
  loadingStates: new Map(),
  errors: new Map(),

  // Filters & Sort
  filters: new Map(),
  sorting: new Map(),
  globalSearch: new Map(),

  // Changes
  pendingChanges: new Map(),
};

export const useTableStore = create<TableStore>()(
  devtools(
    (set, get) => ({
      ...initialState,

      // Data actions
      setTableData: (tableId, data, totalCount) =>
        set((state) => {
          const newData = new Map(state.data);
          newData.set(tableId, data);

          const newTotalCounts = new Map(state.totalCounts);
          if (totalCount !== undefined) {
            newTotalCounts.set(tableId, totalCount);
          }

          return { data: newData, totalCounts: newTotalCounts };
        }),

      updateRow: (tableId, rowId, data) =>
        set((state) => {
          const tableData = state.data.get(tableId);
          if (!tableData) return state;

          const newData = new Map(state.data);
          const updatedData = tableData.map((row) =>
            row.id === rowId ? { ...row, ...data } : row
          );
          newData.set(tableId, updatedData);

          return { data: newData };
        }),

      addRow: (tableId, row) =>
        set((state) => {
          const tableData = state.data.get(tableId) || [];
          const newData = new Map(state.data);
          newData.set(tableId, [...tableData, row]);

          return { data: newData };
        }),

      removeRow: (tableId, rowId) =>
        set((state) => {
          const tableData = state.data.get(tableId);
          if (!tableData) return state;

          const newData = new Map(state.data);
          newData.set(
            tableId,
            tableData.filter((row) => row.id !== rowId)
          );

          return { data: newData };
        }),

      reorderRows: (tableId, rowIds) =>
        set((state) => {
          const tableData = state.data.get(tableId);
          if (!tableData) return state;

          const rowMap = new Map(tableData.map((row) => [row.id, row]));
          const reorderedData = rowIds
            .map((id) => rowMap.get(id))
            .filter((row): row is RowData => row !== undefined);

          const newData = new Map(state.data);
          newData.set(tableId, reorderedData);

          return { data: newData };
        }),

      // UI actions
      setEditingCell: (cellId) => set({ editingCell: cellId }),

      setEditingRow: (rowId) => set({ editingRow: rowId }),

      toggleRowSelection: (tableId, rowId) =>
        set((state) => {
          const tableSelections = state.selectedRows.get(tableId) || new Set();
          const newSelections = new Set(tableSelections);

          if (newSelections.has(rowId)) {
            newSelections.delete(rowId);
          } else {
            newSelections.add(rowId);
          }

          const newSelectedRows = new Map(state.selectedRows);
          newSelectedRows.set(tableId, newSelections);

          return { selectedRows: newSelectedRows };
        }),

      selectAllRows: (tableId, rowIds) =>
        set((state) => {
          const newSelectedRows = new Map(state.selectedRows);
          newSelectedRows.set(tableId, new Set(rowIds));
          return { selectedRows: newSelectedRows };
        }),

      clearSelection: (tableId) =>
        set((state) => {
          const newSelectedRows = new Map(state.selectedRows);
          newSelectedRows.set(tableId, new Set());
          return { selectedRows: newSelectedRows };
        }),

      toggleRowExpanded: (tableId, rowId) =>
        set((state) => {
          const tableExpanded = state.expandedRows.get(tableId) || new Set();
          const newExpanded = new Set(tableExpanded);

          if (newExpanded.has(rowId)) {
            newExpanded.delete(rowId);
          } else {
            newExpanded.add(rowId);
          }

          const newExpandedRows = new Map(state.expandedRows);
          newExpandedRows.set(tableId, newExpanded);

          return { expandedRows: newExpandedRows };
        }),

      setLoading: (tableId, isLoading) =>
        set((state) => {
          const newLoadingStates = new Map(state.loadingStates);
          newLoadingStates.set(tableId, isLoading);
          return { loadingStates: newLoadingStates };
        }),

      setError: (tableId, error) =>
        set((state) => {
          const newErrors = new Map(state.errors);
          newErrors.set(tableId, error);
          return { errors: newErrors };
        }),

      // Filter & Sort actions
      setFilters: (tableId, filters) =>
        set((state) => {
          const newFilters = new Map(state.filters);
          newFilters.set(tableId, filters);
          return { filters: newFilters };
        }),

      setSorting: (tableId, sorting) =>
        set((state) => {
          const newSorting = new Map(state.sorting);
          newSorting.set(tableId, sorting);
          return { sorting: newSorting };
        }),

      setGlobalSearch: (tableId, search) =>
        set((state) => {
          const newGlobalSearch = new Map(state.globalSearch);
          newGlobalSearch.set(tableId, search);
          return { globalSearch: newGlobalSearch };
        }),

      // Changes tracking actions
      markRowChanged: (tableId, rowId, original, modified, isNew) =>
        set((state) => {
          const tableChanges = state.pendingChanges.get(tableId) || new Map();
          const newTableChanges = new Map(tableChanges);

          newTableChanges.set(rowId, {
            rowId,
            original,
            modified,
            isNew,
          });

          const newPendingChanges = new Map(state.pendingChanges);
          newPendingChanges.set(tableId, newTableChanges);

          return { pendingChanges: newPendingChanges };
        }),

      clearRowChanges: (tableId, rowId) =>
        set((state) => {
          const tableChanges = state.pendingChanges.get(tableId);
          if (!tableChanges) return state;

          const newTableChanges = new Map(tableChanges);
          newTableChanges.delete(rowId);

          const newPendingChanges = new Map(state.pendingChanges);
          newPendingChanges.set(tableId, newTableChanges);

          return { pendingChanges: newPendingChanges };
        }),

      clearAllChanges: (tableId) =>
        set((state) => {
          const newPendingChanges = new Map(state.pendingChanges);
          newPendingChanges.set(tableId, new Map());
          return { pendingChanges: newPendingChanges };
        }),

      getRowChanges: (tableId, rowId) => {
        const tableChanges = get().pendingChanges.get(tableId);
        return tableChanges?.get(rowId) || null;
      },

      hasUnsavedChanges: (tableId) => {
        const tableChanges = get().pendingChanges.get(tableId);
        return (tableChanges?.size || 0) > 0;
      },

      // Utility actions
      clearTableState: (tableId) =>
        set((state) => {
          const newData = new Map(state.data);
          newData.delete(tableId);

          const newTotalCounts = new Map(state.totalCounts);
          newTotalCounts.delete(tableId);

          const newSelectedRows = new Map(state.selectedRows);
          newSelectedRows.delete(tableId);

          const newExpandedRows = new Map(state.expandedRows);
          newExpandedRows.delete(tableId);

          const newLoadingStates = new Map(state.loadingStates);
          newLoadingStates.delete(tableId);

          const newErrors = new Map(state.errors);
          newErrors.delete(tableId);

          const newFilters = new Map(state.filters);
          newFilters.delete(tableId);

          const newSorting = new Map(state.sorting);
          newSorting.delete(tableId);

          const newGlobalSearch = new Map(state.globalSearch);
          newGlobalSearch.delete(tableId);

          const newPendingChanges = new Map(state.pendingChanges);
          newPendingChanges.delete(tableId);

          return {
            data: newData,
            totalCounts: newTotalCounts,
            selectedRows: newSelectedRows,
            expandedRows: newExpandedRows,
            loadingStates: newLoadingStates,
            errors: newErrors,
            filters: newFilters,
            sorting: newSorting,
            globalSearch: newGlobalSearch,
            pendingChanges: newPendingChanges,
          };
        }),

      reset: () => set(initialState),
    }),
    { name: 'TableStore' }
  )
);
