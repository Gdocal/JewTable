// Main component
export { DataTable } from './components/DataTable/DataTable';

// Types
export type {
  ColumnDef,
  FilterState,
  Filter,
  SortingState,
  DataTableProps,
  PaginationState,
  ServerDataResponse,
} from './components/DataTable/types';

export { CellType } from './components/DataTable/types/cell.types';

export type {
  CellOptions,
  ReferenceOptions,
  SelectOptions,
  CurrencyOptions,
  DateOptions,
  BadgeOptions,
  ProgressOptions,
} from './components/DataTable/types/cell.types';

// Hooks
export { useReferenceData } from './hooks/useReferenceData';
export { useTableSettings } from './hooks/useTableSettings';

// Reference Registry
export { setReferenceRegistry } from './components/utils/referenceRegistry';

// Utils (if needed by users)
export { formatCurrency } from './utils/formatters';
export { formatDate } from './utils/date';
