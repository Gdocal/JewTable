/**
 * Example Reference Registry Configuration
 * Phase 11: ERP Integration Features
 *
 * This file shows how to configure reference data (довідники) for your ERP system.
 * Copy this file to `references.ts` and customize for your needs.
 */

import { createReferenceRegistry, defineReference } from '../components/DataTable/utils/referenceRegistry';

/**
 * Define your reference data types
 */

// Example type definitions (optional, for TypeScript)
interface Status {
  id: number;
  name: string;
  color: string;
}

interface Department {
  id: string;
  name: string;
  code: string;
  managerId?: string;
}

interface Product {
  id: string;
  name: string;
  sku: string;
  categoryId: string;
  price: number;
  inStock: boolean;
}

/**
 * Create reference registry
 *
 * Each reference type is configured with its own behavior:
 * - Cache strategy (static, ttl, always-fresh)
 * - Search configuration (client/server)
 * - Creation rules (optional)
 * - Custom rendering (optional)
 */
export const referenceRegistry = createReferenceRegistry({
  /**
   * Example 1: Static List (Never changes)
   * - Cached forever
   * - No search needed (small list)
   */
  statuses: defineReference<Status>('/api/references/statuses', {
    cache: 'static',
  }),

  priorities: defineReference('/api/references/priorities', {
    cache: 'static',
  }),

  /**
   * Example 2: Medium Dynamic List (Changes occasionally)
   * - 10 minute cache
   * - Client-side search
   * - Refetch when user returns to tab
   */
  departments: defineReference<Department>('/api/references/departments', {
    cache: {
      ttl: 10 * 60 * 1000,       // 10 minutes
      refetchOnFocus: true,       // Refresh when tab gains focus
    },

    search: {
      enabled: true,
      type: 'client',             // Search in loaded data
      fields: ['name', 'code'],   // Search by name or code
      highlightMatches: true,
    },

    // Creation will be enabled in Phase B
    // create: {
    //   enabled: true,
    //   permission: 'departments.create',
    //   form: {
    //     type: 'modal',
    //     fields: [
    //       { name: 'name', type: 'text', required: true },
    //       { name: 'code', type: 'text', required: true },
    //     ],
    //   },
    // },
  }),

  /**
   * Example 3: Large Dynamic List (Changes frequently)
   * - Short cache (2 minutes)
   * - Server-side search (too large for client-side)
   * - Always fresh data
   */
  goods: defineReference<Product>('/api/references/goods', {
    cache: 'always-fresh',

    search: {
      enabled: true,
      type: 'server',             // Server-side search
      minChars: 3,                // Start searching after 3 characters
      debounce: 300,              // Wait 300ms after typing stops
      fields: ['name', 'sku', 'description'],
      placeholder: 'Search by name or SKU...',
    },

    // Custom rendering (Phase B)
    // render: {
    //   option: (item, searchQuery) => (
    //     <div>
    //       <strong>{item.name}</strong>
    //       <small>{item.sku}</small>
    //       {item.inStock && <span>✓ In Stock</span>}
    //     </div>
    //   ),
    // },
  }),

  /**
   * Example 4: Categories (Simple list)
   * - Default TTL cache (5 minutes)
   * - No search (small list)
   */
  categories: defineReference('/api/references/categories'),

  /**
   * Example 5: Employees (Searchable)
   * - Server-side search
   * - Short cache
   */
  employees: defineReference('/api/references/employees', {
    cache: 'always-fresh',

    search: {
      enabled: true,
      type: 'server',
      minChars: 2,
      fields: ['name', 'email', 'position'],
      placeholder: 'Search employees...',
    },
  }),

  /**
   * Example 6: Teams (Dependent on Departments)
   * - Filters based on selected department
   * - Will be implemented in Phase B
   */
  // teams: defineReference('/api/references/teams', {
  //   cache: { ttl: 10 * 60 * 1000 },
  //   dependsOn: 'departments',
  //   filter: (items, { departmentId }) =>
  //     items.filter(team => team.departmentId === departmentId),
  // }),
});

/**
 * Export types for TypeScript autocomplete
 */
export type ReferenceType = keyof typeof referenceRegistry;
