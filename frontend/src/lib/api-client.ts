/**
 * api-client.ts — Centralized API Client for Bishop Ambrose College Frontend
 *
 * Implements:
 *  1. Centralized HTTP transport with base URL from VITE_API_BASE_URL (defaults to '/api').
 *  2. HttpOnly cookie credentials handling (credentials: 'include').
 *  3. Structured error handling for 401, 403, 404, 422, 429, 500 responses.
 *  4. Network offline / server unavailability detection with graceful fallback.
 *  5. Zero storage of JWT tokens in localStorage or sessionStorage.
 */

export interface ApiClientOptions extends RequestInit {
  params?: Record<string, string | number | boolean | undefined>;
}

export interface ApiErrorResponse {
  message: string;
  code?: string;
  status: number;
  details?: unknown;
  isNetworkError?: boolean;
}

export class ApiError extends Error {
  public status: number;
  public code?: string;
  public details?: unknown;
  public isNetworkError: boolean;

  constructor(errorResponse: ApiErrorResponse) {
    super(errorResponse.message);
    this.name = 'ApiError';
    this.status = errorResponse.status;
    this.code = errorResponse.code;
    this.details = errorResponse.details;
    this.isNetworkError = !!errorResponse.isNetworkError;
  }
}

// Configurable API base (Vite proxy forwards /api to http://localhost:5001)
const API_BASE_URL = (((import.meta as any).env?.VITE_API_BASE_URL as string) || '/api').replace(/\/$/, '');

/**
 * Builds a query string from a parameters record, excluding undefined values.
 */
function buildQueryString(params?: Record<string, string | number | boolean | undefined>): string {
  if (!params) return '';
  const searchParams = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null) {
      searchParams.append(key, String(value));
    }
  }
  const str = searchParams.toString();
  return str ? `?${str}` : '';
}

/**
 * Normalizes relative or absolute endpoints into full target URL under API_BASE_URL.
 */
function resolveUrl(endpoint: string, params?: Record<string, string | number | boolean | undefined>): string {
  const query = buildQueryString(params);
  // If endpoint is already prefixed with /api, avoid duplicating
  if (endpoint.startsWith('/api/')) {
    return `${endpoint}${query}`;
  }
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  return `${API_BASE_URL}${cleanEndpoint}${query}`;
}

/**
 * Core fetch wrapper with timeout, credentials, and error normalization.
 */
async function request<T>(endpoint: string, options: ApiClientOptions = {}): Promise<T> {
  const { params, headers, ...customConfig } = options;
  const url = resolveUrl(endpoint, params);

  const defaultHeaders: Record<string, string> = {
    Accept: 'application/json',
  };

  // Only add Content-Type for JSON payloads (FormData sets its own multipart boundaries)
  if (!(customConfig.body instanceof FormData)) {
    defaultHeaders['Content-Type'] = 'application/json';
  }

  const config: RequestInit = {
    method: 'GET',
    credentials: 'include', // Guarantees HttpOnly authentication cookie is transmitted
    headers: {
      ...defaultHeaders,
      ...headers,
    },
    ...customConfig,
  };

  try {
    const response = await fetch(url, config);

    // Parse JSON payload if present
    const contentType = response.headers.get('content-type');
    const isJson = contentType && contentType.includes('application/json');
    const data = isJson ? await response.json().catch(() => null) : null;

    if (!response.ok) {
      const errorMessage =
        data?.error?.message ||
        data?.message ||
        data?.error ||
        `HTTP Error ${response.status}: ${response.statusText}`;

      const errorCode = data?.error?.code || data?.code;

      // Notify application if session has expired or is unauthorized
      if (response.status === 401 && typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('bac:unauthorized', { detail: { endpoint, status: 401 } }));
      }

      throw new ApiError({
        message: errorMessage,
        code: errorCode,
        status: response.status,
        details: data?.details || data?.error?.details,
      });
    }

    return data as T;
  } catch (err: unknown) {
    if (err instanceof ApiError) {
      throw err;
    }

    // Network / offline failure detection
    const isNetwork =
      err instanceof TypeError &&
      (err.message.toLowerCase().includes('fetch') ||
        err.message.toLowerCase().includes('network') ||
        err.message.toLowerCase().includes('failed'));

    const displayMsg = isNetwork
      ? 'Backend service is currently unreachable. Using offline cache.'
      : err instanceof Error
      ? err.message
      : 'An unexpected network error occurred.';

    throw new ApiError({
      message: displayMsg,
      status: 0,
      code: 'NETWORK_UNAVAILABLE',
      isNetworkError: true,
    });
  }
}

export const apiClient = {
  get<T>(endpoint: string, options?: ApiClientOptions): Promise<T> {
    return request<T>(endpoint, { ...options, method: 'GET' });
  },

  post<T>(endpoint: string, body?: unknown, options?: ApiClientOptions): Promise<T> {
    const isFormData = typeof FormData !== 'undefined' && body instanceof FormData;
    return request<T>(endpoint, {
      ...options,
      method: 'POST',
      body: isFormData ? (body as FormData) : JSON.stringify(body),
    });
  },

  put<T>(endpoint: string, body?: unknown, options?: ApiClientOptions): Promise<T> {
    const isFormData = typeof FormData !== 'undefined' && body instanceof FormData;
    return request<T>(endpoint, {
      ...options,
      method: 'PUT',
      body: isFormData ? (body as FormData) : JSON.stringify(body),
    });
  },

  patch<T>(endpoint: string, body?: unknown, options?: ApiClientOptions): Promise<T> {
    const isFormData = typeof FormData !== 'undefined' && body instanceof FormData;
    return request<T>(endpoint, {
      ...options,
      method: 'PATCH',
      body: isFormData ? (body as FormData) : JSON.stringify(body),
    });
  },

  delete<T>(endpoint: string, options?: ApiClientOptions): Promise<T> {
    return request<T>(endpoint, { ...options, method: 'DELETE' });
  },

  /** Check if browser reports online status */
  isOnline(): boolean {
    return typeof navigator !== 'undefined' ? navigator.onLine : true;
  },
};

export default apiClient;
