/**
 * API client wrapper for table data operations
 */

import {
  GetTableDataRequest,
  GetTableDataResponse,
  UpdateRowRequest,
  UpdateRowResponse,
  CreateRowRequest,
  CreateRowResponse,
  DeleteRowRequest,
  DeleteRowResponse,
  ReorderRowsRequest,
  ReorderRowsResponse,
  GetPreferencesRequest,
  GetPreferencesResponse,
  SavePreferencesRequest,
  SavePreferencesResponse,
  ApiResponse,
  ApiError,
  ConflictError,
} from '../types/api.types';
import { RowData } from '../types/table.types';
import { API, ERROR_MESSAGES } from './constants';

/**
 * API Configuration
 */
interface ApiConfig {
  baseUrl: string;
  timeout?: number;
  headers?: Record<string, string>;
  onError?: (error: ApiError) => void;
}

let apiConfig: ApiConfig = {
  baseUrl: '/api',
  timeout: API.TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  },
};

/**
 * Configure the API client
 */
export function configureApi(config: Partial<ApiConfig>): void {
  apiConfig = { ...apiConfig, ...config };
}

/**
 * API Error class
 */
export class ApiClientError extends Error {
  code?: string;
  details?: unknown;
  statusCode?: number;

  constructor(message: string, code?: string, details?: unknown, statusCode?: number) {
    super(message);
    this.name = 'ApiClientError';
    this.code = code;
    this.details = details;
    this.statusCode = statusCode;
  }
}

/**
 * Generic fetch wrapper with error handling and timeout
 */
async function fetchWithTimeout<T>(
  url: string,
  options: RequestInit = {},
  timeout: number = apiConfig.timeout || API.TIMEOUT
): Promise<T> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        ...apiConfig.headers,
        ...options.headers,
      },
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    // Handle HTTP errors
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));

      // Handle conflict errors specially
      if (response.status === 409) {
        throw new ApiClientError(
          errorData.message || ERROR_MESSAGES.CONFLICT_ERROR,
          'CONFLICT',
          errorData,
          409
        );
      }

      // Handle other errors
      const errorMessage = errorData.message || getErrorMessageForStatus(response.status);
      throw new ApiClientError(errorMessage, errorData.code, errorData.details, response.status);
    }

    // Parse successful response
    const data = await response.json();
    return data;
  } catch (error) {
    clearTimeout(timeoutId);

    // Re-throw API errors
    if (error instanceof ApiClientError) {
      if (apiConfig.onError) {
        apiConfig.onError({
          message: error.message,
          code: error.code,
          details: error.details,
        });
      }
      throw error;
    }

    // Handle network errors
    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        throw new ApiClientError('Request timeout', 'TIMEOUT');
      }

      throw new ApiClientError(
        error.message || ERROR_MESSAGES.NETWORK_ERROR,
        'NETWORK_ERROR'
      );
    }

    throw new ApiClientError(ERROR_MESSAGES.SERVER_ERROR, 'UNKNOWN_ERROR');
  }
}

/**
 * Get error message for HTTP status code
 */
function getErrorMessageForStatus(status: number): string {
  switch (status) {
    case 400:
      return ERROR_MESSAGES.VALIDATION_ERROR;
    case 401:
    case 403:
      return ERROR_MESSAGES.UNAUTHORIZED;
    case 404:
      return ERROR_MESSAGES.NOT_FOUND;
    case 409:
      return ERROR_MESSAGES.CONFLICT_ERROR;
    case 500:
    case 502:
    case 503:
    case 504:
      return ERROR_MESSAGES.SERVER_ERROR;
    default:
      return ERROR_MESSAGES.SERVER_ERROR;
  }
}

/**
 * Serialize query parameters
 */
function serializeQueryParams(params: Record<string, unknown>): string {
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      if (typeof value === 'object') {
        searchParams.append(key, JSON.stringify(value));
      } else {
        searchParams.append(key, String(value));
      }
    }
  });

  return searchParams.toString();
}

/**
 * API Methods
 */

/**
 * Fetch table data
 */
export async function fetchTableData<TData = RowData>(
  request: GetTableDataRequest
): Promise<GetTableDataResponse<TData>> {
  const { tableId, ...params } = request;
  const queryString = serializeQueryParams(params);
  const url = `${apiConfig.baseUrl}/tables/${tableId}/data${queryString ? `?${queryString}` : ''}`;

  const response = await fetchWithTimeout<ApiResponse<GetTableDataResponse<TData>>>(url, {
    method: 'GET',
  });

  return response.data;
}

/**
 * Update a row
 */
export async function updateRow<TData = RowData>(
  request: UpdateRowRequest<TData>
): Promise<UpdateRowResponse<TData>> {
  const { tableId, rowId, data, version } = request;
  const url = `${apiConfig.baseUrl}/tables/${tableId}/rows/${rowId}`;

  const response = await fetchWithTimeout<ApiResponse<UpdateRowResponse<TData>>>(url, {
    method: 'PUT',
    body: JSON.stringify({ data, version }),
  });

  return response.data;
}

/**
 * Create a new row
 */
export async function createRow<TData = RowData>(
  request: CreateRowRequest<TData>
): Promise<CreateRowResponse<TData>> {
  const { tableId, data } = request;
  const url = `${apiConfig.baseUrl}/tables/${tableId}/rows`;

  const response = await fetchWithTimeout<ApiResponse<CreateRowResponse<TData>>>(url, {
    method: 'POST',
    body: JSON.stringify({ data }),
  });

  return response.data;
}

/**
 * Delete a row
 */
export async function deleteRow(request: DeleteRowRequest): Promise<DeleteRowResponse> {
  const { tableId, rowId } = request;
  const url = `${apiConfig.baseUrl}/tables/${tableId}/rows/${rowId}`;

  const response = await fetchWithTimeout<ApiResponse<DeleteRowResponse>>(url, {
    method: 'DELETE',
  });

  return response.data;
}

/**
 * Reorder rows
 */
export async function reorderRows(request: ReorderRowsRequest): Promise<ReorderRowsResponse> {
  const { tableId, rowIds } = request;
  const url = `${apiConfig.baseUrl}/tables/${tableId}/rows/reorder`;

  const response = await fetchWithTimeout<ApiResponse<ReorderRowsResponse>>(url, {
    method: 'PUT',
    body: JSON.stringify({ rowIds }),
  });

  return response.data;
}

/**
 * Get user preferences for a table
 */
export async function getTablePreferences(
  request: GetPreferencesRequest
): Promise<GetPreferencesResponse> {
  const { tableId, userId } = request;
  const url = `${apiConfig.baseUrl}/tables/${tableId}/preferences/${userId}`;

  const response = await fetchWithTimeout<ApiResponse<GetPreferencesResponse>>(url, {
    method: 'GET',
  });

  return response.data;
}

/**
 * Save user preferences for a table
 */
export async function saveTablePreferences(
  request: SavePreferencesRequest
): Promise<SavePreferencesResponse> {
  const { tableId, userId, preferences } = request;
  const url = `${apiConfig.baseUrl}/tables/${tableId}/preferences/${userId}`;

  const response = await fetchWithTimeout<ApiResponse<SavePreferencesResponse>>(url, {
    method: 'PUT',
    body: JSON.stringify(preferences),
  });

  return response.data;
}

/**
 * Check if error is a conflict error
 */
export function isConflictError(error: unknown): error is ConflictError {
  return error instanceof ApiClientError && error.code === 'CONFLICT';
}

/**
 * Retry a failed request with exponential backoff
 */
export async function retryRequest<T>(
  fn: () => Promise<T>,
  maxAttempts: number = API.RETRY_ATTEMPTS,
  baseDelay: number = API.RETRY_DELAY
): Promise<T> {
  let lastError: Error;

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;

      // Don't retry on validation or conflict errors
      if (error instanceof ApiClientError && (error.code === 'VALIDATION_ERROR' || error.code === 'CONFLICT')) {
        throw error;
      }

      // Don't retry on last attempt
      if (attempt === maxAttempts - 1) {
        throw error;
      }

      // Exponential backoff
      const delay = baseDelay * Math.pow(2, attempt);
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }

  throw lastError!;
}
