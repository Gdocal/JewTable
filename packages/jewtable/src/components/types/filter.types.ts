/**
 * Filter type definitions
 */

export enum FilterType {
  TEXT = 'text',
  NUMBER = 'number',
  DATE = 'date',
  DATE_RANGE = 'dateRange',
  SELECT = 'select',
  BOOLEAN = 'boolean',
}

export enum TextFilterMode {
  CONTAINS = 'contains',
  EQUALS = 'equals',
  STARTS_WITH = 'startsWith',
  ENDS_WITH = 'endsWith',
  NOT_CONTAINS = 'notContains',
}

export enum NumberFilterMode {
  EQUALS = 'equals',
  NOT_EQUALS = 'notEquals',
  GREATER_THAN = 'greaterThan',
  GREATER_THAN_OR_EQUAL = 'greaterThanOrEqual',
  LESS_THAN = 'lessThan',
  LESS_THAN_OR_EQUAL = 'lessThanOrEqual',
  BETWEEN = 'between',
}

export enum DateFilterMode {
  EQUALS = 'equals',
  BEFORE = 'before',
  AFTER = 'after',
  BETWEEN = 'between',
}

// Base filter interface
export interface BaseFilter {
  columnId: string;
  type: FilterType;
  enabled: boolean;
}

// Text filter
export interface TextFilter extends BaseFilter {
  type: FilterType.TEXT;
  mode: TextFilterMode;
  value: string;
  caseSensitive?: boolean;
}

// Number filter
export interface NumberFilter extends BaseFilter {
  type: FilterType.NUMBER;
  mode: NumberFilterMode;
  value: number;
  valueTo?: number; // For BETWEEN mode
}

// Date filter
export interface DateFilter extends BaseFilter {
  type: FilterType.DATE;
  mode: DateFilterMode;
  value: Date | string;
}

// Date range filter
export interface DateRangeFilter extends BaseFilter {
  type: FilterType.DATE_RANGE;
  startDate: Date | string;
  endDate: Date | string;
}

// Select filter (multi-select)
export interface SelectFilter extends BaseFilter {
  type: FilterType.SELECT;
  selectedValues: string[];
}

// Boolean filter
export interface BooleanFilter extends BaseFilter {
  type: FilterType.BOOLEAN;
  value: boolean;
}

export type Filter =
  | TextFilter
  | NumberFilter
  | DateFilter
  | DateRangeFilter
  | SelectFilter
  | BooleanFilter;

// Filter state for a table
export interface FilterState {
  filters: Filter[];
  globalSearch: string;
  logicOperator: 'AND' | 'OR'; // Between columns
}

// Filter chip display
export interface FilterChip {
  columnId: string;
  columnName: string;
  displayText: string;
  onRemove: () => void;
}
