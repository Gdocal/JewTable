/**
 * API type definitions
 */

import { FilterState } from './filter.types';
import { SortingState } from '@tanstack/react-table';
import { RowData, TablePreferences } from './table.types';

// Generic API response wrapper
export interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
}

export interface ApiError {
  message: string;
  code?: string;
  details?: unknown;
}

// Table data endpoints
export interface GetTableDataRequest {
  tableId: string;
  page?: number;
  pageSize?: number;
  filters?: FilterState;
  sorting?: SortingState;
  search?: string;
}

export interface GetTableDataResponse<TData = RowData> {
  data: TData[];
  totalCount: number;
  page: number;
  pageSize: number;
}

// Row CRUD endpoints
export interface UpdateRowRequest<TData = RowData> {
  tableId: string;
  rowId: string;
  data: Partial<TData>;
  version?: number; // For optimistic locking
}

export interface UpdateRowResponse<TData = RowData> {
  data: TData;
  version: number;
}

export interface CreateRowRequest<TData = RowData> {
  tableId: string;
  data: TData;
}

export interface CreateRowResponse<TData = RowData> {
  data: TData;
}

export interface DeleteRowRequest {
  tableId: string;
  rowId: string;
}

export interface DeleteRowResponse {
  success: boolean;
  deletedId: string;
}

export interface ReorderRowsRequest {
  tableId: string;
  rowIds: string[];
}

export interface ReorderRowsResponse {
  success: boolean;
  newOrder: string[];
}

// User preferences endpoints
export interface GetPreferencesRequest {
  tableId: string;
  userId: string;
}

export interface GetPreferencesResponse {
  preferences: TablePreferences | null;
}

export interface SavePreferencesRequest {
  tableId: string;
  userId: string;
  preferences: TablePreferences;
}

export interface SavePreferencesResponse {
  success: boolean;
}

// Conflict resolution
export interface ConflictError extends ApiError {
  code: 'CONFLICT';
  currentVersion: number;
  currentData: RowData;
  yourData: Partial<RowData>;
}
