/**
 * Filter matching and utility functions
 */

import {
  Filter,
  TextFilter,
  NumberFilter,
  DateFilter,
  DateRangeFilter,
  SelectFilter,
  BooleanFilter,
  TextFilterMode,
  NumberFilterMode,
  DateFilterMode,
  FilterType,
} from '../types/filter.types';
import { parseDate } from './formatters';

/**
 * Check if a value matches a text filter
 */
export function matchesTextFilter(value: unknown, filter: TextFilter): boolean {
  if (!filter.enabled) return true;

  const stringValue = String(value ?? '');
  const filterValue = filter.value;

  const compareValue = filter.caseSensitive ? stringValue : stringValue.toLowerCase();
  const compareFilter = filter.caseSensitive ? filterValue : filterValue.toLowerCase();

  switch (filter.mode) {
    case TextFilterMode.CONTAINS:
      return compareValue.includes(compareFilter);
    case TextFilterMode.EQUALS:
      return compareValue === compareFilter;
    case TextFilterMode.STARTS_WITH:
      return compareValue.startsWith(compareFilter);
    case TextFilterMode.ENDS_WITH:
      return compareValue.endsWith(compareFilter);
    case TextFilterMode.NOT_CONTAINS:
      return !compareValue.includes(compareFilter);
    default:
      return true;
  }
}

/**
 * Check if a value matches a number filter
 */
export function matchesNumberFilter(value: unknown, filter: NumberFilter): boolean {
  if (!filter.enabled) return true;

  const numValue = Number(value);
  if (isNaN(numValue)) return false;

  switch (filter.mode) {
    case NumberFilterMode.EQUALS:
      return numValue === filter.value;
    case NumberFilterMode.NOT_EQUALS:
      return numValue !== filter.value;
    case NumberFilterMode.GREATER_THAN:
      return numValue > filter.value;
    case NumberFilterMode.GREATER_THAN_OR_EQUAL:
      return numValue >= filter.value;
    case NumberFilterMode.LESS_THAN:
      return numValue < filter.value;
    case NumberFilterMode.LESS_THAN_OR_EQUAL:
      return numValue <= filter.value;
    case NumberFilterMode.BETWEEN:
      if (filter.valueTo === undefined) return false;
      return numValue >= filter.value && numValue <= filter.valueTo;
    default:
      return true;
  }
}

/**
 * Check if a value matches a date filter
 */
export function matchesDateFilter(value: unknown, filter: DateFilter): boolean {
  if (!filter.enabled) return true;

  const dateValue = typeof value === 'string' ? parseDate(value) : (value as Date);
  const filterDate = typeof filter.value === 'string' ? parseDate(filter.value) : filter.value;

  if (!dateValue || !filterDate) return false;

  const dateTime = dateValue.getTime();
  const filterTime = filterDate.getTime();

  switch (filter.mode) {
    case DateFilterMode.EQUALS:
      return dateTime === filterTime;
    case DateFilterMode.BEFORE:
      return dateTime < filterTime;
    case DateFilterMode.AFTER:
      return dateTime > filterTime;
    default:
      return true;
  }
}

/**
 * Check if a value matches a date range filter
 */
export function matchesDateRangeFilter(value: unknown, filter: DateRangeFilter): boolean {
  if (!filter.enabled) return true;

  const dateValue = typeof value === 'string' ? parseDate(value) : (value as Date);
  const startDate =
    typeof filter.startDate === 'string' ? parseDate(filter.startDate) : filter.startDate;
  const endDate = typeof filter.endDate === 'string' ? parseDate(filter.endDate) : filter.endDate;

  if (!dateValue || !startDate || !endDate) return false;

  const dateTime = dateValue.getTime();
  return dateTime >= startDate.getTime() && dateTime <= endDate.getTime();
}

/**
 * Check if a value matches a select filter
 */
export function matchesSelectFilter(value: unknown, filter: SelectFilter): boolean {
  if (!filter.enabled || filter.selectedValues.length === 0) return true;

  const stringValue = String(value ?? '');
  return filter.selectedValues.includes(stringValue);
}

/**
 * Check if a value matches a boolean filter
 */
export function matchesBooleanFilter(value: unknown, filter: BooleanFilter): boolean {
  if (!filter.enabled) return true;
  return Boolean(value) === filter.value;
}

/**
 * Check if a value matches any filter
 */
export function matchesFilter(value: unknown, filter: Filter): boolean {
  switch (filter.type) {
    case FilterType.TEXT:
      return matchesTextFilter(value, filter as TextFilter);
    case FilterType.NUMBER:
      return matchesNumberFilter(value, filter as NumberFilter);
    case FilterType.DATE:
      return matchesDateFilter(value, filter as DateFilter);
    case FilterType.DATE_RANGE:
      return matchesDateRangeFilter(value, filter as DateRangeFilter);
    case FilterType.SELECT:
      return matchesSelectFilter(value, filter as SelectFilter);
    case FilterType.BOOLEAN:
      return matchesBooleanFilter(value, filter as BooleanFilter);
    default:
      return true;
  }
}

/**
 * Get human-readable description of a filter
 */
export function getFilterDescription(filter: Filter): string {
  if (!filter.enabled) return '';

  switch (filter.type) {
    case FilterType.TEXT: {
      const f = filter as TextFilter;
      return `${f.mode}: "${f.value}"`;
    }
    case FilterType.NUMBER: {
      const f = filter as NumberFilter;
      if (f.mode === NumberFilterMode.BETWEEN && f.valueTo !== undefined) {
        return `${f.value} - ${f.valueTo}`;
      }
      return `${f.mode}: ${f.value}`;
    }
    case FilterType.DATE: {
      const f = filter as DateFilter;
      return `${f.mode}: ${f.value}`;
    }
    case FilterType.DATE_RANGE: {
      const f = filter as DateRangeFilter;
      return `${f.startDate} - ${f.endDate}`;
    }
    case FilterType.SELECT: {
      const f = filter as SelectFilter;
      return f.selectedValues.join(', ');
    }
    case FilterType.BOOLEAN: {
      const f = filter as BooleanFilter;
      return f.value ? 'Yes' : 'No';
    }
    default:
      return '';
  }
}
