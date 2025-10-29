/**
 * Column type definitions
 */

import { ColumnDef } from '@tanstack/react-table';
import { z } from 'zod';
import { CellType, SelectOption } from './cell.types';
import { FilterType } from './filter.types';

export interface DataTableColumnDef<TData = unknown, TValue = unknown>
  extends Omit<ColumnDef<TData, TValue>, 'id'> {
  id?: string;
  // Cell type configuration
  cellType?: CellType;
  editable?: boolean;

  // Filter configuration
  filterable?: boolean;
  filterType?: FilterType;

  // Sort configuration
  sortable?: boolean;

  // Validation
  validationSchema?: z.ZodType<TValue>;

  // Cell type specific options
  cellOptions?: CellOptions;

  // Display options
  width?: number;
  minWidth?: number;
  maxWidth?: number;
  resizable?: boolean;

  // Visibility
  hideable?: boolean; // Can user hide this column?
  defaultHidden?: boolean;
}

export interface CellOptions {
  // For number cells
  numberFormat?: 'decimal' | 'currency' | 'percent';
  decimals?: number;
  currencySymbol?: string;

  // For date cells
  dateFormat?: string; // date-fns format string

  // For select cells
  selectOptions?: SelectOption[];
  options?: SelectOption[]; // Alias for selectOptions (backwards compatibility)

  // For badge cells (Phase 10.4)
  badgeVariant?: 'primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'info' | 'light' | 'dark';

  // For progress bar cells (Phase 10.10)
  showPercentage?: boolean;
  showProgressLabel?: boolean;
  progressLabel?: string;
  progressThresholds?: {
    danger?: number; // Below this is red
    warning?: number; // Below this is yellow
    success?: number; // Above warning is green
  };
  animatedProgress?: boolean;

  // For custom cells
  customRenderer?: React.ComponentType<unknown>;
  customEditor?: React.ComponentType<unknown>;
}

export interface ColumnVisibility {
  [columnId: string]: boolean;
}

export interface ColumnWidth {
  [columnId: string]: number;
}

export interface ColumnOrder {
  orderedIds: string[];
}
