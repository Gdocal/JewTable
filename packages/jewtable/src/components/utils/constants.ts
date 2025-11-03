/**
 * Constants and configuration values
 */

// Table mode threshold
export const CLIENT_MODE_MAX_ROWS = 300;

// Debounce timings (milliseconds)
export const DEBOUNCE_DELAYS = {
  SEARCH: 300,
  FILTER: 300,
  SERVER_SYNC: 3000,
  COLUMN_RESIZE: 150,
} as const;

// Pagination defaults
export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 50,
  PAGE_SIZE_OPTIONS: [25, 50, 100, 200],
  MAX_PAGE_SIZE: 500,
} as const;

// Virtualization settings
export const VIRTUALIZATION = {
  ENABLED_THRESHOLD: 300, // Enable virtualization for tables with more than 300 rows
  DEFAULT_ROW_HEIGHT: 48,
  OVERSCAN: 5, // Number of rows to render outside viewport
  MAX_VIRTUAL_ROWS: 10000, // Maximum rows to virtualize (prevents browser scroll height limits)
} as const;

// Mobile breakpoints (pixels)
export const BREAKPOINTS = {
  MOBILE: 768,
  TABLET: 1024,
} as const;

// Touch targets (pixels) - for mobile accessibility
export const TOUCH_TARGET = {
  MIN_SIZE: 44,
} as const;

// Animation durations (milliseconds)
export const ANIMATIONS = {
  FAST: 150,
  MEDIUM: 300,
  SLOW: 500,
} as const;

// Validation
export const VALIDATION = {
  MAX_TEXT_LENGTH: 1000,
  MAX_NUMBER_VALUE: Number.MAX_SAFE_INTEGER,
  MIN_NUMBER_VALUE: Number.MIN_SAFE_INTEGER,
} as const;

// Storage keys
export const STORAGE_KEYS = {
  TABLE_PREFERENCES: 'jewtable_preferences',
  COLUMN_VISIBILITY: 'jewtable_column_visibility',
  COLUMN_WIDTHS: 'jewtable_column_widths',
} as const;

// API defaults
export const API = {
  TIMEOUT: 30000, // 30 seconds
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000,
} as const;

// Date formats (using date-fns)
export const DATE_FORMATS = {
  DEFAULT: 'yyyy-MM-dd',
  WITH_TIME: 'yyyy-MM-dd HH:mm:ss',
  DISPLAY: 'MMM dd, yyyy',
  DISPLAY_WITH_TIME: 'MMM dd, yyyy HH:mm',
} as const;

// Number formats
export const NUMBER_FORMATS = {
  DEFAULT_DECIMALS: 2,
  DEFAULT_CURRENCY: 'USD',
  DEFAULT_CURRENCY_SYMBOL: '$',
} as const;

// Z-index layers
export const Z_INDEX = {
  BASE: 1,
  DROPDOWN: 1000,
  MODAL: 2000,
  POPOVER: 3000,
  TOAST: 4000,
} as const;

// Error messages
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Network error. Please check your connection.',
  SERVER_ERROR: 'Server error. Please try again later.',
  VALIDATION_ERROR: 'Validation failed. Please check your input.',
  CONFLICT_ERROR: 'This data has been modified by another user.',
  NOT_FOUND: 'The requested resource was not found.',
  UNAUTHORIZED: 'You are not authorized to perform this action.',
} as const;
