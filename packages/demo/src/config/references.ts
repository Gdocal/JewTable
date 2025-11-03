/**
 * Reference Registry Configuration
 * Phase 11: ERP Integration Features
 */

import { createReferenceRegistry, defineReference } from '../components/DataTable/utils/referenceRegistry';
import { z } from 'zod';

/**
 * Type definitions
 */
interface Department {
  id: number;
  name: string;
  code: string;
  managerId?: number;
}

interface Status {
  id: number;
  name: string;
  color: string;
}

interface Product {
  id: string;
  name: string;
  sku: string;
  price: number;
  inStock: boolean;
}

/**
 * Validation schemas
 */
const departmentValidation = z.object({
  name: z.string().min(3, 'Name must be at least 3 characters'),
  code: z.string().min(2, 'Code must be at least 2 characters').max(10, 'Code too long'),
  managerId: z.number().optional(),
});

const statusValidation = z.object({
  name: z.string().min(2, 'Name is required'),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Must be valid hex color'),
});

const productValidation = z.object({
  name: z.string().min(3, 'Product name required'),
  sku: z.string().min(3, 'SKU required'),
  price: z.number().min(0, 'Price must be positive'),
  inStock: z.boolean(),
});

/**
 * Create reference registry
 */
export const referenceRegistry = createReferenceRegistry({
  /**
   * Statuses - Small static list with inline creation
   */
  statuses: defineReference<Status>('/api/references/statuses', {
    cache: 'static',
    create: {
      enabled: true,
      form: {
        type: 'inline',
        fields: [
          {
            name: 'name',
            type: 'text',
            required: true,
            placeholder: 'Enter status name...',
          },
        ],
        validation: statusValidation,
      },
    },
  }),

  /**
   * Departments - Medium list with modal creation and validation
   */
  departments: defineReference<Department>('/api/references/departments', {
    cache: {
      ttl: 10 * 60 * 1000,       // 10 minutes
      refetchOnFocus: true,
    },

    search: {
      enabled: true,
      type: 'client',
      fields: ['name', 'code'],
      highlightMatches: true,
      placeholder: 'Search departments...',
    },

    create: {
      enabled: true,
      form: {
        type: 'modal',
        layout: 'vertical',
        fields: [
          {
            name: 'name',
            type: 'text',
            label: 'Department Name',
            required: true,
            placeholder: 'e.g., Engineering',
            hint: 'Full department name',
          },
          {
            name: 'code',
            type: 'text',
            label: 'Department Code',
            required: true,
            placeholder: 'e.g., ENG',
            hint: 'Short code (2-10 characters)',
          },
          {
            name: 'managerId',
            type: 'number',
            label: 'Manager ID',
            required: false,
            placeholder: 'Optional',
          },
        ],
        validation: departmentValidation,
      },
    },
  }),

  /**
   * Products - Large list with server search and grid layout
   */
  products: defineReference<Product>('/api/references/products', {
    cache: 'always-fresh',

    search: {
      enabled: true,
      type: 'server',
      minChars: 2,
      debounce: 300,
      fields: ['name', 'sku'],
      placeholder: 'Search products by name or SKU...',
    },

    create: {
      enabled: true,
      form: {
        type: 'modal',
        layout: 'grid',
        columns: 2,
        fields: [
          {
            name: 'name',
            type: 'text',
            label: 'Product Name',
            required: true,
            placeholder: 'e.g., Laptop Dell XPS 15',
          },
          {
            name: 'sku',
            type: 'text',
            label: 'SKU',
            required: true,
            placeholder: 'e.g., LAP-DELL-001',
          },
          {
            name: 'price',
            type: 'number',
            label: 'Price',
            required: true,
            min: 0,
            step: 0.01,
            placeholder: '0.00',
          },
          {
            name: 'inStock',
            type: 'boolean',
            label: 'In Stock',
            hint: 'Is this product currently available?',
          },
        ],
        validation: productValidation,
      },
    },
  }),

  /**
   * Categories - Simple list with no creation
   */
  categories: defineReference('/api/references/categories', {
    cache: 'ttl',
  }),
});

export type ReferenceType = keyof typeof referenceRegistry;
