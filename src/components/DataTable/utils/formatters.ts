/**
 * Data formatting utilities
 */

import { format, parseISO, isValid } from 'date-fns';
import { DATE_FORMATS, NUMBER_FORMATS } from './constants';

/**
 * Format a number as currency
 */
export function formatCurrency(
  value: number,
  decimals: number = NUMBER_FORMATS.DEFAULT_DECIMALS,
  symbol: string = NUMBER_FORMATS.DEFAULT_CURRENCY_SYMBOL
): string {
  const formatted = value.toFixed(decimals);
  return `${symbol}${formatted}`;
}

/**
 * Format a number as percentage
 */
export function formatPercent(
  value: number,
  decimals: number = NUMBER_FORMATS.DEFAULT_DECIMALS
): string {
  return `${(value * 100).toFixed(decimals)}%`;
}

/**
 * Format a number with thousand separators
 */
export function formatNumber(
  value: number,
  decimals: number = NUMBER_FORMATS.DEFAULT_DECIMALS
): string {
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);
}

/**
 * Format a date using date-fns
 */
export function formatDate(
  date: Date | string,
  formatStr: string = DATE_FORMATS.DEFAULT
): string {
  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    if (!isValid(dateObj)) {
      return '';
    }
    return format(dateObj, formatStr);
  } catch {
    return '';
  }
}

/**
 * Format a date for display
 */
export function formatDateDisplay(date: Date | string): string {
  return formatDate(date, DATE_FORMATS.DISPLAY);
}

/**
 * Format a date with time for display
 */
export function formatDateTimeDisplay(date: Date | string): string {
  return formatDate(date, DATE_FORMATS.DISPLAY_WITH_TIME);
}

/**
 * Parse a date string to Date object
 */
export function parseDate(dateStr: string): Date | null {
  try {
    const date = parseISO(dateStr);
    return isValid(date) ? date : null;
  } catch {
    return null;
  }
}

/**
 * Truncate text with ellipsis
 */
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength - 3) + '...';
}

/**
 * Format boolean as Yes/No
 */
export function formatBoolean(value: boolean, yesText = 'Yes', noText = 'No'): string {
  return value ? yesText : noText;
}

/**
 * Format file size in bytes to human-readable format
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}
