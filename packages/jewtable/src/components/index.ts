/**
 * Main export file for DataTable component
 */

// Export the main component
export { DataTable } from './DataTable';

// Export types
export * from './types';

// Export stores
export { useTableStore } from './store/tableStore';
export { useUserPreferencesStore } from './store/userPreferencesStore';

// Export utilities
export * from './utils/constants';
export * from './utils/formatters';
export * from './utils/validation';
export * from './utils/api';

// Export hooks (will be created in later phases)
// export * from './hooks';
