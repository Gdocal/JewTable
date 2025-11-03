/**
 * useInfiniteData hook with TanStack Query
 * Phase 8.2: Server Integration with Infinite Scroll
 */

import { useInfiniteQuery } from '@tanstack/react-query';
import { fetchData, FetchDataOptions, FetchDataResponse } from '../utils/api';
import type { RowData } from '../components/DataTable/types/table.types';

export interface UseInfiniteDataOptions extends Omit<FetchDataOptions, 'page'> {
  resource: string;
  enabled?: boolean;
}

export function useInfiniteData<TData extends RowData>(
  options: UseInfiniteDataOptions
) {
  const { resource, enabled = true, ...fetchOptions } = options;

  // Build a stable query key by extracting individual params
  const queryKey = [
    resource,
    'infinite',
    fetchOptions.pageSize,
    JSON.stringify(fetchOptions.sorting || []), // Serialize sorting for stable key
    JSON.stringify(fetchOptions.filters || {}), // Serialize filters for stable key
    fetchOptions.search,
  ];

  return useInfiniteQuery<FetchDataResponse<TData>, Error>({
    queryKey,
    queryFn: ({ pageParam = 1 }) =>
      fetchData<TData>(resource, {
        ...fetchOptions,
        page: pageParam as number,
      }),
    getNextPageParam: (lastPage) => {
      // If there's more data, return next page number
      return lastPage.hasMore ? lastPage.page + 1 : undefined;
    },
    initialPageParam: 1,
    enabled,
  });
}
