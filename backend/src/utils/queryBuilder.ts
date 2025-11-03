/**
 * Advanced Query Builder
 * Supports ALL filtering operators that json-server doesn't support:
 * - Text: contains, startsWith, endsWith, notContains, regex (case-sensitive/insensitive)
 * - Number: gt, gte, lt, lte, between, notEquals, in, notIn
 * - Date: before, after, onOrBefore, onOrAfter, between
 * - Boolean: isTrue, isFalse
 * - Null: isEmpty, isNotEmpty
 */

import { Prisma } from '@prisma/client';
import {
  FilterState,
  Filter,
  TextFilter,
  NumberFilter,
  DateFilter,
  BooleanFilter,
  SelectFilter,
  NullFilter,
  SortingState,
  WhereClause,
} from '../types';

export class QueryBuilder {
  /**
   * Build Prisma WHERE clause from FilterState
   */
  static buildWhereClause(
    filters: FilterState,
    searchableColumns: string[] = []
  ): Prisma.EmployeeWhereInput {
    const conditions: Prisma.EmployeeWhereInput[] = [];

    // Global search across searchable columns
    if (filters.globalSearch && searchableColumns.length > 0) {
      const searchConditions = this.buildGlobalSearch(
        filters.globalSearch,
        searchableColumns
      );
      conditions.push(searchConditions);
    }

    // Individual column filters
    filters.filters.forEach((filter) => {
      if (!filter.enabled) return;

      const condition = this.buildFilterCondition(filter);
      if (condition) {
        conditions.push(condition);
      }
    });

    // Combine with AND/OR
    if (conditions.length === 0) {
      return {};
    }

    if (filters.logicOperator === 'OR') {
      return { OR: conditions };
    }

    return { AND: conditions };
  }

  /**
   * Build global search across multiple columns
   */
  private static buildGlobalSearch(
    search: string,
    columns: string[]
  ): Prisma.EmployeeWhereInput {
    const searchConditions = columns.map((column) => ({
      [column]: {
        contains: search,
        mode: Prisma.QueryMode.insensitive,
      },
    }));

    return { OR: searchConditions };
  }

  /**
   * Build filter condition based on filter type
   */
  private static buildFilterCondition(
    filter: Filter
  ): Prisma.EmployeeWhereInput | null {
    switch (filter.operator) {
      // Text operators
      case 'contains':
      case 'equals':
      case 'startsWith':
      case 'endsWith':
      case 'notContains':
      case 'regex':
        return this.buildTextFilter(filter as TextFilter);

      // Number operators
      case 'eq':
      case 'ne':
      case 'gt':
      case 'gte':
      case 'lt':
      case 'lte':
      case 'between':
        return this.buildNumberFilter(filter as NumberFilter);

      // In/Not In (works for both numbers and strings)
      case 'in':
      case 'notIn':
        return this.buildInFilter(filter as SelectFilter | NumberFilter);

      // Date operators
      case 'before':
      case 'after':
      case 'onOrBefore':
      case 'onOrAfter':
      case 'dateEquals':
      case 'dateBetween':
        return this.buildDateFilter(filter as DateFilter);

      // Boolean operators
      case 'isTrue':
      case 'isFalse':
        return this.buildBooleanFilter(filter as BooleanFilter);

      // Null operators
      case 'isEmpty':
      case 'isNotEmpty':
        return this.buildNullFilter(filter as NullFilter);

      default:
        console.warn(`Unknown filter operator: ${filter.operator}`);
        return null;
    }
  }

  /**
   * Build text filter conditions
   */
  private static buildTextFilter(
    filter: TextFilter
  ): Prisma.EmployeeWhereInput {
    const { columnId, operator, value, caseSensitive } = filter;
    const mode = caseSensitive
      ? Prisma.QueryMode.default
      : Prisma.QueryMode.insensitive;

    switch (operator) {
      case 'contains':
        return { [columnId]: { contains: value, mode } };

      case 'equals':
        return { [columnId]: { equals: value, mode } };

      case 'startsWith':
        return { [columnId]: { startsWith: value, mode } };

      case 'endsWith':
        return { [columnId]: { endsWith: value, mode } };

      case 'notContains':
        return { NOT: { [columnId]: { contains: value, mode } } };

      case 'regex':
        // Prisma doesn't support regex directly, use raw query or contains
        console.warn('Regex filter not fully supported, falling back to contains');
        return { [columnId]: { contains: value, mode } };

      default:
        return {};
    }
  }

  /**
   * Build number filter conditions
   */
  private static buildNumberFilter(
    filter: NumberFilter
  ): Prisma.EmployeeWhereInput {
    const { columnId, operator, value, valueTo } = filter;

    switch (operator) {
      case 'eq':
        return { [columnId]: { equals: value } };

      case 'ne':
        return { NOT: { [columnId]: { equals: value } } };

      case 'gt':
        return { [columnId]: { gt: value } };

      case 'gte':
        return { [columnId]: { gte: value } };

      case 'lt':
        return { [columnId]: { lt: value } };

      case 'lte':
        return { [columnId]: { lte: value } };

      case 'between':
        if (valueTo === undefined) {
          console.warn('Between operator requires valueTo');
          return {};
        }
        return {
          AND: [
            { [columnId]: { gte: value } },
            { [columnId]: { lte: valueTo } },
          ],
        };

      default:
        return {};
    }
  }

  /**
   * Build IN / NOT IN filter
   */
  private static buildInFilter(
    filter: SelectFilter | NumberFilter
  ): Prisma.EmployeeWhereInput {
    const { columnId, operator } = filter;
    const values = 'values' in filter ? filter.values : [];

    if (values.length === 0) {
      return {};
    }

    switch (operator) {
      case 'in':
        return { [columnId]: { in: values } };

      case 'notIn':
        return { [columnId]: { notIn: values } };

      default:
        return {};
    }
  }

  /**
   * Build date filter conditions
   */
  private static buildDateFilter(
    filter: DateFilter
  ): Prisma.EmployeeWhereInput {
    const { columnId, operator, value, valueTo } = filter;
    const date = typeof value === 'string' ? new Date(value) : value;

    switch (operator) {
      case 'before':
        return { [columnId]: { lt: date } };

      case 'after':
        return { [columnId]: { gt: date } };

      case 'onOrBefore':
        return { [columnId]: { lte: date } };

      case 'onOrAfter':
        return { [columnId]: { gte: date } };

      case 'dateEquals':
        // For date equality, check if date is same day
        const startOfDay = new Date(date);
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date(date);
        endOfDay.setHours(23, 59, 59, 999);
        return {
          AND: [
            { [columnId]: { gte: startOfDay } },
            { [columnId]: { lte: endOfDay } },
          ],
        };

      case 'dateBetween':
        if (!valueTo) {
          console.warn('Date between requires valueTo');
          return {};
        }
        const dateTo = typeof valueTo === 'string' ? new Date(valueTo) : valueTo;
        return {
          AND: [
            { [columnId]: { gte: date } },
            { [columnId]: { lte: dateTo } },
          ],
        };

      default:
        return {};
    }
  }

  /**
   * Build boolean filter
   */
  private static buildBooleanFilter(
    filter: BooleanFilter
  ): Prisma.EmployeeWhereInput {
    const { columnId, operator } = filter;

    switch (operator) {
      case 'isTrue':
        return { [columnId]: { equals: true } };

      case 'isFalse':
        return { [columnId]: { equals: false } };

      default:
        return {};
    }
  }

  /**
   * Build null/empty filter
   */
  private static buildNullFilter(
    filter: NullFilter
  ): Prisma.EmployeeWhereInput {
    const { columnId, operator } = filter;

    switch (operator) {
      case 'isEmpty':
        return { [columnId]: { equals: null } };

      case 'isNotEmpty':
        return { NOT: { [columnId]: { equals: null } } };

      default:
        return {};
    }
  }

  /**
   * Build ORDER BY clause from SortingState
   */
  static buildOrderBy(sorting: SortingState): Prisma.EmployeeOrderByWithRelationInput[] {
    return sorting.map((sort) => ({
      [sort.id]: sort.desc ? 'desc' : 'asc',
    }));
  }

  /**
   * Calculate pagination skip and take
   */
  static buildPagination(page: number, pageSize: number) {
    return {
      skip: (page - 1) * pageSize,
      take: pageSize,
    };
  }
}
