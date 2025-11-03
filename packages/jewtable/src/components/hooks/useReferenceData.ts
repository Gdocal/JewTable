/**
 * useReferenceData Hook
 * Phase 11: ERP Integration Features
 *
 * Hook for fetching and caching reference data (довідники)
 */

import { useQuery, UseQueryResult } from '@tanstack/react-query';
import {
  ReferenceConfig,
  UseReferenceDataResult,
  UseReferenceDataOptions,
  ReferenceAPIResponse,
  CacheStrategy,
} from '../types/reference.types';

/**
 * Default API fetch function
 */
async function defaultFetchFn<T>(
  endpoint: string,
  searchQuery?: string
): Promise<T[]> {
  const url = new URL(endpoint, window.location.origin);

  if (searchQuery) {
    url.searchParams.set('search', searchQuery);
  }

  const response = await fetch(url.toString());

  if (!response.ok) {
    throw new Error(`Failed to fetch reference data: ${response.statusText}`);
  }

  const data = await response.json();

  // Support both direct array and { items: [] } format
  if (Array.isArray(data)) {
    return data;
  }

  if (data.items && Array.isArray(data.items)) {
    return data.items;
  }

  throw new Error('Invalid API response format. Expected array or { items: [] }');
}

/**
 * Get cache configuration from strategy
 */
function getCacheConfig(strategy: CacheStrategy = 'ttl') {
  if (strategy === 'static') {
    return {
      staleTime: Infinity,
      cacheTime: Infinity,
      refetchOnWindowFocus: false,
      refetchOnMount: false,
    };
  }

  if (strategy === 'ttl') {
    return {
      staleTime: 5 * 60 * 1000,        // 5 minutes
      cacheTime: 10 * 60 * 1000,       // 10 minutes
      refetchOnWindowFocus: false,
      refetchOnMount: false,
    };
  }

  if (strategy === 'always-fresh') {
    return {
      staleTime: 2 * 60 * 1000,        // 2 minutes
      cacheTime: 5 * 60 * 1000,        // 5 minutes
      refetchOnWindowFocus: true,
      refetchOnMount: true,
    };
  }

  // Custom strategy object
  return {
    staleTime: strategy.ttl,
    cacheTime: strategy.ttl * 2,
    refetchOnWindowFocus: strategy.refetchOnFocus ?? false,
    refetchOnMount: strategy.refetchOnMount ?? false,
    refetchInterval: strategy.refetchInterval,
  };
}

/**
 * Hook for fetching reference data with caching
 *
 * @example
 * ```typescript
 * const { data, isLoading, refetch } = useReferenceData(
 *   departmentsConfig,
 *   { enabled: isDropdownOpen }
 * );
 * ```
 */
export function useReferenceData<T = any>(
  config: ReferenceConfig<T>,
  options: UseReferenceDataOptions = {}
): UseReferenceDataResult<T> {
  const {
    enabled = true,
    filter,
    searchQuery,
  } = options;

  // Get cache configuration
  const cacheConfig = getCacheConfig(config.cache);

  // Build query key
  const queryKey = [
    'reference',
    config.type,
    searchQuery || null,
    filter || null,
  ];

  // Use custom fetch function or default
  const fetchFn = config.fetchFn || (() => defaultFetchFn<T>(config.endpoint, searchQuery));

  // React Query
  const query: UseQueryResult<T[], Error> = useQuery({
    queryKey,
    queryFn: async () => {
      let data = await fetchFn(config);

      // Apply data transformation if provided
      if (config.transformData) {
        data = config.transformData(data);
      }

      // Apply filter if provided
      if (config.filter && filter) {
        data = config.filter(data, filter);
      }

      return data;
    },
    enabled,
    ...cacheConfig,
  });

  return {
    data: query.data,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: async () => {
      await query.refetch();
    },
    isFetching: query.isFetching,
  };
}

/**
 * Hook for server-side search with debouncing
 *
 * @example
 * ```typescript
 * const { data, isLoading } = useReferenceSearch(
 *   goodsConfig,
 *   searchQuery,
 *   { debounce: 300, minChars: 3 }
 * );
 * ```
 */
export function useReferenceSearch<T = any>(
  config: ReferenceConfig<T>,
  searchQuery: string,
  options: {
    debounce?: number;
    minChars?: number;
    enabled?: boolean;
  } = {}
): UseReferenceDataResult<T> {
  const { debounce = 300, minChars = 3, enabled = true } = options;

  // Only search if query meets minimum length
  const shouldSearch = enabled && searchQuery.length >= minChars;

  return useReferenceData(config, {
    enabled: shouldSearch,
    searchQuery,
  });
}
