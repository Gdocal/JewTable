/**
 * useData hook with TanStack Query
 * Phase 8.3: Traditional pagination (non-infinite)
 */

import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { fetchData, FetchDataOptions, FetchDataResponse } from '../utils/api';
import type { RowData } from '../components/DataTable/types/table.types';

export interface UseDataOptions extends FetchDataOptions {
  resource: string;
  enabled?: boolean;
}

export function useData<TData extends RowData>(
  options: UseDataOptions
) {
  const { resource, enabled = true, ...fetchOptions } = options;

  // Build a stable query key by extracting individual params
  const queryKey = [
    resource,
    'paginated',
    fetchOptions.page,
    fetchOptions.pageSize,
    JSON.stringify(fetchOptions.sorting || []), // Serialize sorting for stable key
    JSON.stringify(fetchOptions.filters || {}), // Serialize filters for stable key
    fetchOptions.search,
  ];

  return useQuery<FetchDataResponse<TData>, Error>({
    queryKey,
    queryFn: () => fetchData<TData>(resource, fetchOptions),
    enabled,
    placeholderData: keepPreviousData, // Keep previous data while loading new page
  });
}
