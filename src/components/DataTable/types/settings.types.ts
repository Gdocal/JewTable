/**
 * Table Settings Types
 * Enhancement 1: Configurable Settings Persistence
 */

import { ColumnOrderState, ColumnSizingState, SortingState, ColumnFiltersState, VisibilityState } from '@tanstack/react-table';
import { PaginationState } from './table.types';

/**
 * Complete table settings that can be persisted
 */
export interface TableSettings {
  columnOrder?: ColumnOrderState;
  columnVisibility?: VisibilityState;
  columnSizing?: ColumnSizingState;
  sorting?: SortingState;
  columnFilters?: ColumnFiltersState;
  globalFilter?: string;
  pagination?: PaginationState;
}

/**
 * Abstract interface for table settings storage
 * Implement this interface to create custom storage adapters
 */
export interface TableSettingsStorage {
  /**
   * Save table settings for a specific user and table
   * @param tableId - Unique identifier for the table
   * @param userId - User identifier (optional for localStorage)
   * @param settings - Settings to save
   */
  save(tableId: string, userId: string | undefined, settings: TableSettings): Promise<void> | void;

  /**
   * Load table settings for a specific user and table
   * @param tableId - Unique identifier for the table
   * @param userId - User identifier (optional for localStorage)
   * @returns Saved settings or null if not found
   */
  load(tableId: string, userId: string | undefined): Promise<TableSettings | null> | TableSettings | null;

  /**
   * Clear table settings for a specific user and table
   * @param tableId - Unique identifier for the table
   * @param userId - User identifier (optional for localStorage)
   */
  clear(tableId: string, userId: string | undefined): Promise<void> | void;
}
