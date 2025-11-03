/**
 * useTotalCount hook
 * Phase 8.3: Get total count from API
 */

import { useQuery } from '@tanstack/react-query';

interface UseTotalCountOptions {
  resource: string;
  enabled?: boolean;
}

export function useTotalCount(options: UseTotalCountOptions) {
  const { resource, enabled = true } = options;

  return useQuery<number, Error>({
    queryKey: [resource, 'count'],
    queryFn: async () => {
      // Fetch all records to count them
      // In production, API should have dedicated /count endpoint
      const response = await fetch(`http://localhost:3001/${resource}`);
      if (!response.ok) {
        throw new Error('Failed to fetch count');
      }
      const data = await response.json();
      return Array.isArray(data) ? data.length : 0;
    },
    enabled,
    staleTime: 5 * 60 * 1000, // 5 minutes - count doesn't change often
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
}
