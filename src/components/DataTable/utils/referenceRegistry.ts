/**
 * Reference Registry
 * Phase 11: ERP Integration Features
 *
 * Central registry for all reference data configurations
 */

import {
  ReferenceConfig,
  ReferenceRegistry,
  DefineReferenceConfig,
} from '../types/reference.types';

/**
 * Helper function to define a reference configuration with type safety
 *
 * @example
 * ```typescript
 * const departments = defineReference<Department>(
 *   '/api/references/departments',
 *   {
 *     cache: { ttl: 10 * 60 * 1000 },
 *     search: { enabled: true },
 *   }
 * );
 * ```
 */
export function defineReference<T = any>(
  endpoint: string,
  config?: DefineReferenceConfig<T>
): Omit<ReferenceConfig<T>, 'type'> {
  return {
    endpoint,
    label: 'name',
    value: 'id',
    cache: 'ttl',
    ...config,
  };
}

/**
 * Create a reference registry
 *
 * @example
 * ```typescript
 * export const referenceRegistry = createReferenceRegistry({
 *   statuses: defineReference('/api/references/statuses'),
 *   departments: defineReference('/api/references/departments'),
 * });
 * ```
 */
export function createReferenceRegistry<T extends Record<string, any>>(
  definitions: T
): { [K in keyof T]: ReferenceConfig } {
  const registry: any = {};

  for (const [key, definition] of Object.entries(definitions)) {
    registry[key] = {
      type: key,
      ...definition,
    };
  }

  return registry;
}

/**
 * Get a reference config from the registry
 */
export function getReferenceConfig(
  registry: ReferenceRegistry,
  type: string
): ReferenceConfig {
  const config = registry[type];

  if (!config) {
    throw new Error(
      `Reference type "${type}" not found in registry. ` +
      `Available types: ${Object.keys(registry).join(', ')}`
    );
  }

  return config;
}

/**
 * Merge config with overrides
 */
export function mergeReferenceConfig<T = any>(
  baseConfig: ReferenceConfig<T>,
  overrides?: Partial<ReferenceConfig<T>>
): ReferenceConfig<T> {
  if (!overrides) {
    return baseConfig;
  }

  return {
    ...baseConfig,
    ...overrides,
    // Deep merge for nested objects
    cache: overrides.cache ?? baseConfig.cache,
    search: overrides.search ? { ...baseConfig.search, ...overrides.search } : baseConfig.search,
    create: overrides.create ? { ...baseConfig.create, ...overrides.create } : baseConfig.create,
    render: overrides.render ? { ...baseConfig.render, ...overrides.render } : baseConfig.render,
  };
}
