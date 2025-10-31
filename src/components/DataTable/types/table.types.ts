/**
 * Main table type definitions
 */

import { SortingState } from '@tanstack/react-table';
import { DataTableColumnDef } from './column.types';
import { FilterState } from './filter.types';

export enum TableMode {
  CLIENT = 'client', // All data loaded, client-side operations
  SERVER = 'server', // Server-side pagination, filtering, sorting
}

export enum PaginationType {
  INFINITE = 'infinite',     // Infinite scroll (loads and appends)
  TRADITIONAL = 'traditional', // Page-based (Previous/Next buttons)
}

export interface RowData {
  id: string;
  [key: string]: unknown;
}

export interface DataTableProps<TData extends RowData = RowData> {
  // Required props
  tableId: string;
  columns: DataTableColumnDef<TData>[];

  // Data (controlled or uncontrolled)
  data?: TData[];
  initialData?: TData[];

  // Mode
  mode?: TableMode;
  paginationType?: PaginationType; // Only for SERVER mode

  // Server-side callbacks (for SERVER mode)
  onFetchData?: (params: FetchDataParams) => Promise<FetchDataResponse<TData>>;

  // Infinite pagination props
  onFetchNextPage?: () => void;
  hasNextPage?: boolean;
  isFetchingNextPage?: boolean;

  // Traditional pagination props
  totalRows?: number; // Total rows on server
  pageCount?: number; // Total pages

  // Loading state
  isLoading?: boolean;
  isFetching?: boolean; // For showing overlay during pagination

  // CRUD callbacks
  onRowUpdate?: (rowId: string, data: Partial<TData>) => Promise<void>;
  onRowCreate?: (data: TData) => Promise<TData>;
  onRowDelete?: (rowId: string) => Promise<void>;
  onRowReorder?: (rowIds: string[]) => Promise<void>;

  // State callbacks (Phase 8.4: Server-side sorting/filtering)
  onFilterChange?: (filters: Record<string, any>) => void; // Simple key-value for API
  onSortChange?: (sorting: SortingState) => void;
  onPaginationChange?: (pagination: { pageIndex: number; pageSize: number }) => void;

  // User preferences
  userId?: string; // For saving user-specific preferences
  onSavePreferences?: (preferences: TablePreferences) => Promise<void>;
  onLoadPreferences?: () => Promise<TablePreferences>;

  // Features
  enableSorting?: boolean;
  enableFiltering?: boolean;
  enableGlobalSearch?: boolean;
  enableRowSelection?: boolean;
  enableRowReordering?: boolean;
  enableInlineEditing?: boolean;
  enableRowCreation?: boolean;
  enableRowDeletion?: boolean;
  enableRowCopy?: boolean;
  enableRowInsertion?: boolean;
  enableVirtualization?: boolean;
  enableStickyFirstColumn?: boolean; // Phase 10.2: Sticky first column for horizontal scroll
  enableRowExpanding?: boolean; // Phase 10.5: Row expanding
  enableColumnResizing?: boolean; // Phase 10.3: Column resizing
  enableColumnReordering?: boolean; // Phase 10.6: Column reordering

  // UI customization
  pageSize?: number;
  pageSizeOptions?: number[]; // Options for page size selector
  minRows?: number; // Minimum rows to display (for empty states)
  rowHeight?: number; // For virtualization

  // Row expanding (Phase 10.5)
  renderExpandedContent?: (row: TData) => React.ReactNode;

  // Validation
  rowValidationSchema?: unknown; // Zod schema for cross-field validation

  // Styling
  className?: string;
  styles?: TableStyles;
}

export interface FetchDataParams {
  page: number;
  pageSize: number;
  filters?: FilterState;
  sorting?: SortingState;
  globalSearch?: string;
}

export interface FetchDataResponse<TData> {
  data: TData[];
  totalCount: number;
  page: number;
  pageSize: number;
}

export interface TablePreferences {
  tableId: string;
  userId: string;
  filters?: FilterState;
  sorting?: SortingState;
  columnVisibility?: Record<string, boolean>;
  columnWidths?: Record<string, number>;
  columnOrder?: string[];
}

export interface TableStyles {
  table?: string;
  header?: string;
  body?: string;
  row?: string;
  cell?: string;
}

// Internal table state
export interface TableState {
  // Data
  data: RowData[];
  totalCount: number;

  // Pagination (for server mode)
  page: number;
  pageSize: number;

  // Filters & Search
  filters: FilterState;

  // Sorting
  sorting: SortingState;

  // Selection
  selectedRowIds: Set<string>;

  // Editing
  editingCellId: string | null;
  editingRowId: string | null;

  // Unsaved changes
  pendingChanges: Map<string, Partial<RowData>>;

  // UI state
  isLoading: boolean;
  error: Error | null;
}

// Cell identifier
export interface CellId {
  rowId: string;
  columnId: string;
}

// Change tracking
export interface RowChanges {
  rowId: string;
  original: RowData;
  modified: Partial<RowData>;
  isNew: boolean;
}
