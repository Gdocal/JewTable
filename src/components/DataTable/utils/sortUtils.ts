/**
 * Sort utility functions and comparators
 */

import { parseDate } from './formatters';

/**
 * Compare two values for sorting
 */
export type CompareFn<T = unknown> = (a: T, b: T) => number;

/**
 * Text comparator (locale-aware)
 */
export function compareText(a: unknown, b: unknown, desc = false): number {
  const strA = String(a ?? '');
  const strB = String(b ?? '');

  const result = strA.localeCompare(strB, undefined, { sensitivity: 'base' });
  return desc ? -result : result;
}

/**
 * Number comparator
 */
export function compareNumber(a: unknown, b: unknown, desc = false): number {
  const numA = Number(a);
  const numB = Number(b);

  // Handle NaN values
  if (isNaN(numA) && isNaN(numB)) return 0;
  if (isNaN(numA)) return desc ? -1 : 1;
  if (isNaN(numB)) return desc ? 1 : -1;

  const result = numA - numB;
  return desc ? -result : result;
}

/**
 * Date comparator
 */
export function compareDate(a: unknown, b: unknown, desc = false): number {
  const dateA = typeof a === 'string' ? parseDate(a) : (a as Date);
  const dateB = typeof b === 'string' ? parseDate(b) : (b as Date);

  // Handle null/invalid dates
  if (!dateA && !dateB) return 0;
  if (!dateA) return desc ? -1 : 1;
  if (!dateB) return desc ? 1 : -1;

  const result = dateA.getTime() - dateB.getTime();
  return desc ? -result : result;
}

/**
 * Boolean comparator
 */
export function compareBoolean(a: unknown, b: unknown, desc = false): number {
  const boolA = Boolean(a);
  const boolB = Boolean(b);

  if (boolA === boolB) return 0;

  const result = boolA ? 1 : -1;
  return desc ? -result : result;
}

/**
 * Generic comparator that handles null/undefined
 */
export function compareWithNulls<T>(
  a: T | null | undefined,
  b: T | null | undefined,
  compareFn: CompareFn<T>,
  desc = false
): number {
  // Handle null/undefined
  if (a == null && b == null) return 0;
  if (a == null) return desc ? -1 : 1;
  if (b == null) return desc ? 1 : -1;

  return compareFn(a, b);
}

/**
 * Create a multi-column comparator
 */
export function createMultiComparator<T>(
  comparators: Array<{ fn: CompareFn<T>; desc?: boolean }>
): CompareFn<T> {
  return (a: T, b: T) => {
    for (const { fn, desc = false } of comparators) {
      const result = fn(a, b);
      if (result !== 0) {
        return desc ? -result : result;
      }
    }
    return 0;
  };
}

/**
 * Natural sort for strings with numbers (e.g., "item1", "item2", "item10")
 */
export function compareNatural(a: unknown, b: unknown, desc = false): number {
  const strA = String(a ?? '');
  const strB = String(b ?? '');

  const result = strA.localeCompare(strB, undefined, { numeric: true, sensitivity: 'base' });
  return desc ? -result : result;
}
