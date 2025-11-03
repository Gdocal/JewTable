/**
 * Shared TypeScript types and interfaces
 */

import { Request } from 'express';

// ==================== Filter Types ====================

export type FilterOperator =
  // Text
  | 'contains'
  | 'equals'
  | 'startsWith'
  | 'endsWith'
  | 'notContains'
  | 'regex'
  // Number
  | 'eq'
  | 'ne'
  | 'gt'
  | 'gte'
  | 'lt'
  | 'lte'
  | 'between'
  | 'in'
  | 'notIn'
  // Date
  | 'before'
  | 'after'
  | 'onOrBefore'
  | 'onOrAfter'
  | 'dateEquals'
  | 'dateBetween'
  // Boolean
  | 'isTrue'
  | 'isFalse'
  // Null checks
  | 'isEmpty'
  | 'isNotEmpty';

export interface BaseFilter {
  columnId: string;
  operator: FilterOperator;
  enabled: boolean;
}

export interface TextFilter extends BaseFilter {
  operator: 'contains' | 'equals' | 'startsWith' | 'endsWith' | 'notContains' | 'regex';
  value: string;
  caseSensitive?: boolean;
}

export interface NumberFilter extends BaseFilter {
  operator: 'eq' | 'ne' | 'gt' | 'gte' | 'lt' | 'lte' | 'between' | 'in' | 'notIn';
  value: number;
  valueTo?: number; // For 'between'
  values?: number[]; // For 'in' / 'notIn'
}

export interface DateFilter extends BaseFilter {
  operator: 'before' | 'after' | 'onOrBefore' | 'onOrAfter' | 'dateEquals' | 'dateBetween';
  value: string | Date;
  valueTo?: string | Date; // For 'dateBetween'
}

export interface BooleanFilter extends BaseFilter {
  operator: 'isTrue' | 'isFalse';
}

export interface SelectFilter extends BaseFilter {
  operator: 'in' | 'notIn';
  values: string[];
}

export interface NullFilter extends BaseFilter {
  operator: 'isEmpty' | 'isNotEmpty';
}

export type Filter =
  | TextFilter
  | NumberFilter
  | DateFilter
  | BooleanFilter
  | SelectFilter
  | NullFilter;

export interface FilterState {
  filters: Filter[];
  globalSearch?: string;
  logicOperator: 'AND' | 'OR';
}

// ==================== Sorting Types ====================

export interface SortColumn {
  id: string;
  desc: boolean;
}

export type SortingState = SortColumn[];

// ==================== Pagination Types ====================

export interface PaginationParams {
  page: number;
  pageSize: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

// ==================== API Response Types ====================

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    message: string;
    code?: string;
    details?: any;
  };
  meta?: {
    timestamp: string;
    requestId?: string;
  };
}

export interface ApiError {
  message: string;
  statusCode: number;
  code?: string;
  details?: any;
}

// ==================== Query Builder Types ====================

export interface WhereClause {
  sql: string;
  params: any[];
}

export interface QueryOptions {
  filters?: FilterState;
  sorting?: SortingState;
  pagination?: PaginationParams;
  search?: string;
  select?: string[];
  include?: string[];
}

// ==================== Authentication Types ====================

export interface JWTPayload {
  userId: string;
  organizationId: string;
  email: string;
  role: string;
}

export interface AuthenticatedRequest extends Request {
  user?: JWTPayload;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  name: string;
  organizationName?: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

// ==================== Optimistic Locking ====================

export interface VersionedUpdate<T> {
  data: Partial<T>;
  version: number;
}

// ==================== Audit Log Types ====================

export type AuditAction = 'CREATE' | 'UPDATE' | 'DELETE' | 'LOGIN' | 'LOGOUT' | 'EXPORT' | 'IMPORT';

export interface AuditLogData {
  tableName: string;
  recordId?: string;
  action: AuditAction;
  changes?: any;
  ipAddress?: string;
  userAgent?: string;
}

// ==================== Table Settings Types ====================

export interface TableSettings {
  filters?: FilterState;
  sorting?: SortingState;
  columnVisibility?: Record<string, boolean>;
  columnOrder?: string[];
  columnWidths?: Record<string, number>;
}
