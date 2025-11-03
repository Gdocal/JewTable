/**
 * API Client utilities
 * Phase 8: Server Integration
 */

import { SortingState } from '@tanstack/react-table';
import type { RowData } from '../components/DataTable/types/table.types';

/**
 * API Configuration
 */
export const API_CONFIG = {
  baseURL: 'http://localhost:3001',
  timeout: 10000,
  retryAttempts: 3,
  retryDelay: 1000,
};

/**
 * API Error class
 */
export class APIError extends Error {
  constructor(
    message: string,
    public status?: number,
    public data?: unknown
  ) {
    super(message);
    this.name = 'APIError';
  }
}

/**
 * Fetch with timeout
 */
async function fetchWithTimeout(
  url: string,
  options: RequestInit = {},
  timeout = API_CONFIG.timeout
): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    if (error instanceof Error && error.name === 'AbortError') {
      throw new APIError('Request timeout', 408);
    }
    throw error;
  }
}

/**
 * Fetch with retry logic
 */
async function fetchWithRetry(
  url: string,
  options: RequestInit = {},
  retryAttempts = API_CONFIG.retryAttempts
): Promise<Response> {
  let lastError: Error | undefined;

  for (let attempt = 0; attempt <= retryAttempts; attempt++) {
    try {
      const response = await fetchWithTimeout(url, options);

      // Don't retry on 4xx errors (client errors)
      if (response.status >= 400 && response.status < 500) {
        return response;
      }

      // Retry on 5xx errors (server errors)
      if (response.status >= 500 && attempt < retryAttempts) {
        await delay(API_CONFIG.retryDelay * (attempt + 1));
        continue;
      }

      return response;
    } catch (error) {
      lastError = error as Error;
      if (attempt < retryAttempts) {
        await delay(API_CONFIG.retryDelay * (attempt + 1));
        continue;
      }
    }
  }

  throw lastError || new APIError('Request failed after retries');
}

/**
 * Delay helper
 */
function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Build query string from params
 */
function buildQueryString(params: Record<string, any>): string {
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      if (Array.isArray(value)) {
        value.forEach((v) => searchParams.append(key, String(v)));
      } else {
        searchParams.set(key, String(value));
      }
    }
  });

  const queryString = searchParams.toString();
  return queryString ? `?${queryString}` : '';
}

/**
 * Parse pagination params for json-server 1.0
 * json-server 1.0 uses _start and _end instead of _page and _limit
 */
export interface PaginationParams {
  page?: number;
  pageSize?: number;
}

function parsePaginationParams(params: PaginationParams): Record<string, any> {
  const { page = 1, pageSize = 100 } = params;
  const start = (page - 1) * pageSize;
  const end = start + pageSize;
  return {
    _start: start,
    _end: end,
  };
}

/**
 * Parse sorting params for json-server 1.x
 * json-server 1.x uses prefix notation: _sort=field (asc) or _sort=-field (desc)
 * This is different from 0.x which used _sort=field&_order=asc/desc
 */
export function parseSortingParams(sorting: SortingState): Record<string, any> {
  if (!sorting || sorting.length === 0) {
    return {};
  }

  const sort = sorting[0]!; // json-server supports single column sort
  // json-server 1.x: use minus prefix for descending sort
  return {
    _sort: sort.desc ? `-${sort.id}` : sort.id,
  };
}

/**
 * Parse filter params for json-server
 */
export interface FilterParams {
  [key: string]: any;
}

/**
 * Parse filter params for json-server 1.x
 *
 * IMPORTANT: json-server 1.x only supports basic equality filtering (field=value)
 * It does NOT support operators like _lt, _gt, _gte, _lte, _ne (removed in 1.x)
 *
 * For production apps, use a real backend that supports complex filtering.
 * For this demo:
 * - Equality filters: ✅ Supported
 * - Text search (q param): ✅ Supported
 * - Comparison operators (>, <, >=, <=): ❌ NOT supported (client-side only)
 * - Between: ❌ NOT supported (client-side only)
 */
function parseFilterParams(filters: FilterParams): Record<string, any> {
  console.log('[API] Raw filters:', filters);

  const params: Record<string, any> = {};

  Object.entries(filters).forEach(([key, value]) => {
    // Skip empty/undefined values
    if (value === undefined || value === null || value === '') {
      return;
    }

    // Handle complex filter objects (NumberFilter, TextFilter, DateFilter)
    if (typeof value === 'object' && !Array.isArray(value) && 'operator' in value) {
      const filterValue = value as { operator: string; value: any };

      console.log(`[API] Converting filter for ${key}:`, filterValue);

      // json-server 1.x limitation: only 'equals' is supported
      // Other operators (lessThan, greaterThan, etc.) are ignored
      if (filterValue.operator === 'equals') {
        params[key] = filterValue.value;
      } else {
        console.warn(
          `[API] Filter operator '${filterValue.operator}' not supported by json-server 1.x.`,
          `Only 'equals' is supported. For production, use a real backend.`
        );
        // Don't send unsupported filters to avoid confusion
      }
    }
    // Handle array values (SelectFilter)
    else if (Array.isArray(value)) {
      // For multiple values, json-server doesn't have great support
      // We'll just use the first value for now
      if (value.length > 0) {
        params[key] = value[0];
      }
    }
    // Handle simple values (direct equality)
    else {
      params[key] = value;
    }
  });

  console.log('[API] Converted filter params:', params);
  return params;
}

/**
 * Fetch paginated data
 */
export interface FetchDataOptions extends PaginationParams {
  sorting?: SortingState;
  filters?: FilterParams;
  search?: string;
}

export interface FetchDataResponse<TData> {
  data: TData[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

export async function fetchData<TData extends RowData>(
  resource: string,
  options: FetchDataOptions = {}
): Promise<FetchDataResponse<TData>> {
  const { page = 1, pageSize = 100, sorting, filters, search } = options;

  // Build query params
  const params: Record<string, any> = {
    ...parsePaginationParams({ page, pageSize }),
    ...(sorting ? parseSortingParams(sorting) : {}),
    ...(filters ? parseFilterParams(filters) : {}),
  };

  // json-server full-text search with q parameter
  if (search) {
    params.q = search;
  }

  const queryString = buildQueryString(params);
  const url = `${API_CONFIG.baseURL}/${resource}${queryString}`;

  try {
    const response = await fetchWithRetry(url);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new APIError(
        `Failed to fetch ${resource}`,
        response.status,
        errorData
      );
    }

    const data = await response.json();

    // json-server 1.0 doesn't return total count in headers or response body
    // In production, this would come from API response or X-Total-Count header
    // For now, we can only determine if there's more data
    const hasMore = data.length === pageSize;

    // Total is unknown without additional API call
    // Caller should provide total from separate source
    const total = 0; // Unknown - set by caller

    return {
      data,
      total,
      page,
      pageSize,
      hasMore,
    };
  } catch (error) {
    if (error instanceof APIError) {
      throw error;
    }
    throw new APIError(
      error instanceof Error ? error.message : 'Unknown error occurred'
    );
  }
}

/**
 * Create a new record
 */
export async function createRecord<TData extends RowData>(
  resource: string,
  data: Omit<TData, 'id'>
): Promise<TData> {
  const url = `${API_CONFIG.baseURL}/${resource}`;

  try {
    const response = await fetchWithRetry(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new APIError(`Failed to create ${resource}`, response.status, errorData);
    }

    return await response.json();
  } catch (error) {
    if (error instanceof APIError) {
      throw error;
    }
    throw new APIError(error instanceof Error ? error.message : 'Unknown error occurred');
  }
}

/**
 * Update a record
 */
export async function updateRecord<TData extends RowData>(
  resource: string,
  id: string,
  data: Partial<TData>
): Promise<TData> {
  const url = `${API_CONFIG.baseURL}/${resource}/${id}`;

  try {
    const response = await fetchWithRetry(url, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new APIError(`Failed to update ${resource}`, response.status, errorData);
    }

    return await response.json();
  } catch (error) {
    if (error instanceof APIError) {
      throw error;
    }
    throw new APIError(error instanceof Error ? error.message : 'Unknown error occurred');
  }
}

/**
 * Delete a record
 */
export async function deleteRecord(resource: string, id: string): Promise<void> {
  const url = `${API_CONFIG.baseURL}/${resource}/${id}`;

  try {
    const response = await fetchWithRetry(url, {
      method: 'DELETE',
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new APIError(`Failed to delete ${resource}`, response.status, errorData);
    }
  } catch (error) {
    if (error instanceof APIError) {
      throw error;
    }
    throw new APIError(error instanceof Error ? error.message : 'Unknown error occurred');
  }
}
