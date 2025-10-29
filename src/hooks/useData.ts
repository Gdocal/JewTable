/**
 * useData hook with TanStack Query
 * Phase 8.3: Traditional pagination (non-infinite)
 */

import { useQuery } from '@tanstack/react-query';
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

  return useQuery<FetchDataResponse<TData>, Error>({
    queryKey: [resource, fetchOptions],
    queryFn: () => fetchData<TData>(resource, fetchOptions),
    enabled,
  });
}
