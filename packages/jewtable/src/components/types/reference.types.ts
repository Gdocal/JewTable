/**
 * Reference Data System Types
 * Phase 11: ERP Integration Features
 *
 * Type definitions for the reference data (довідники) system
 */

import { ReactNode } from 'react';
import { UseQueryOptions } from '@tanstack/react-query';
import { z } from 'zod';

/**
 * Cache strategies for reference data
 */
export type CacheStrategy =
  | 'static'                                    // Cache forever (never changes)
  | 'ttl'                                       // Default TTL (5 minutes)
  | 'always-fresh'                              // Short TTL + refetch on focus
  | {
      ttl: number;                              // Custom TTL in milliseconds
      refetchOnFocus?: boolean;                 // Refetch when window gains focus
      refetchOnMount?: boolean;                 // Refetch on component mount
      refetchInterval?: number;                 // Poll interval
    };

/**
 * Search configuration
 */
export interface SearchConfig {
  enabled: boolean;
  type?: 'client' | 'server';                   // Default: 'client'

  // Server-side search options
  minChars?: number;                            // Minimum characters to start search (default: 3)
  debounce?: number;                            // Debounce delay in ms (default: 300)
  limit?: number;                               // Max results (default: 50)

  // Fields to search in
  fields?: string[];

  // Client-side options
  fuzzy?: boolean;                              // Enable fuzzy matching
  threshold?: number;                           // Fuzzy threshold 0-1 (default: 0.3)

  // UI options
  highlightMatches?: boolean;                   // Highlight matching text
  placeholder?: string;                         // Search input placeholder
  saveHistory?: boolean;                        // Save recent searches
  maxHistory?: number;                          // Max history items (default: 5)
}

/**
 * Form field configuration for creation
 */
export interface FormFieldConfig {
  name: string;
  type: 'text' | 'number' | 'select' | 'textarea' | 'boolean' | 'date';
  label?: string;
  required?: boolean;
  placeholder?: string;
  hint?: string;
  pattern?: RegExp;

  // For select fields
  referenceType?: string;                       // Reference to another type
  options?: Array<{ label: string; value: any }>;

  // For number fields
  min?: number;
  max?: number;
  step?: number;
  format?: 'currency' | 'percentage' | 'decimal';
}

/**
 * Creation form configuration
 */
export interface CreateFormConfig {
  type: 'inline' | 'modal' | 'external';

  // For inline/modal
  fields?: FormFieldConfig[];
  validation?: z.ZodSchema;
  layout?: 'vertical' | 'grid' | 'horizontal';
  columns?: number;                             // For grid layout

  // Lifecycle hooks
  hooks?: {
    beforeSave?: (data: any) => Promise<any> | any;
    afterSave?: (item: any) => Promise<void> | void;
  };

  // For external
  url?: string;                                 // Redirect URL
  onClick?: () => void;                         // Custom handler
}

/**
 * Creation configuration
 */
export interface CreateConfig {
  enabled: boolean;
  permission?: string;                          // Required permission
  canCreate?: (user: any) => boolean;          // Custom permission check

  form?: CreateFormConfig;

  // OR custom component
  component?: React.ComponentType<CustomModalProps>;

  // Post-creation behavior
  autoSelect?: boolean;                         // Auto-select created item
  onSuccess?: (item: any) => void;             // Success callback
}

/**
 * Custom rendering configuration
 */
export interface RenderConfig<T = any> {
  option?: (item: T, searchQuery?: string) => ReactNode;
  value?: (item: T) => ReactNode;
  empty?: () => ReactNode;
  loading?: () => ReactNode;
}

/**
 * Main reference configuration
 */
export interface ReferenceConfig<T = any> {
  type: string;                                 // Unique type identifier
  endpoint: string;                             // API endpoint

  // Display fields
  label?: keyof T | string;                     // Field to display (default: 'name')
  value?: keyof T | string;                     // Field to use as value (default: 'id')

  // Cache strategy
  cache?: CacheStrategy;

  // Search
  search?: SearchConfig;

  // Creation
  create?: CreateConfig;

  // Rendering
  render?: RenderConfig<T>;

  // Relationships
  dependsOn?: string;                           // Parent reference type
  filter?: (items: T[], context: any) => T[];  // Filter function

  // Data transformation
  transformData?: (data: any[]) => T[];        // Transform API response

  // Custom API functions
  fetchFn?: (config: ReferenceConfig<T>) => Promise<T[]>;
  createFn?: (config: ReferenceConfig<T>, data: any) => Promise<T>;
}

/**
 * Reference registry type
 */
export type ReferenceRegistry = Record<string, ReferenceConfig>;

/**
 * Props for custom modal components
 */
export interface CustomModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: any) => Promise<void>;
  config: ReferenceConfig;
  user?: any;
  api?: {
    create: (data: any) => Promise<any>;
    validate: (data: any) => Promise<any>;
  };
  defaultFormState?: any;                       // Pre-configured react-hook-form
}

/**
 * Props for ReferenceCell component
 */
export interface ReferenceCellProps {
  type: string;                                 // Reference type from registry
  value: any;                                   // Current value
  onChange: (value: any) => void;              // Change handler

  // Optional overrides
  config?: Partial<ReferenceConfig>;
  filter?: Record<string, any>;                // Filter context (for dependent refs)
  disabled?: boolean;
  placeholder?: string;
  variant?: 'default' | 'minimal';             // UI variant (default: 'default')

  // Callbacks
  onCreateSuccess?: (item: any) => void;
  onSearchChange?: (query: string) => void;
}

/**
 * Return type for useReferenceData hook
 */
export interface UseReferenceDataResult<T = any> {
  data: T[] | undefined;
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
  isFetching: boolean;
}

/**
 * Options for useReferenceData hook
 */
export interface UseReferenceDataOptions {
  enabled?: boolean;                            // Enable/disable query
  filter?: Record<string, any>;                // Filter context
  searchQuery?: string;                        // Search query
}

/**
 * API response format
 */
export interface ReferenceAPIResponse<T = any> {
  items: T[];
  total?: number;
  hasMore?: boolean;
}

/**
 * Helper type for defining references with type safety
 */
export type DefineReferenceConfig<T> = Omit<ReferenceConfig<T>, 'type' | 'endpoint'>;
