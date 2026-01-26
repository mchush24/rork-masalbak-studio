/**
 * Standardized API Response Wrapper
 *
 * Provides consistent response format across all API endpoints
 */

import { createLogger } from './logger';

const log = createLogger('API');

// ============================================
// TYPES
// ============================================

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: ApiError;
  meta?: ApiMeta;
}

export interface ApiError {
  code: string;
  message: string;
  details?: unknown;
}

export interface ApiMeta {
  timestamp: string;
  requestId?: string;
  pagination?: PaginationMeta;
}

export interface PaginationMeta {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

// ============================================
// ERROR CODES
// ============================================

export const ErrorCodes = {
  // Client errors (4xx)
  BAD_REQUEST: 'BAD_REQUEST',
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',
  NOT_FOUND: 'NOT_FOUND',
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  RATE_LIMITED: 'RATE_LIMITED',
  CONFLICT: 'CONFLICT',

  // Server errors (5xx)
  INTERNAL_ERROR: 'INTERNAL_ERROR',
  SERVICE_UNAVAILABLE: 'SERVICE_UNAVAILABLE',
  DATABASE_ERROR: 'DATABASE_ERROR',
  EXTERNAL_SERVICE_ERROR: 'EXTERNAL_SERVICE_ERROR',
  AI_PROVIDER_ERROR: 'AI_PROVIDER_ERROR',

  // Business logic errors
  USER_NOT_FOUND: 'USER_NOT_FOUND',
  CHILD_NOT_FOUND: 'CHILD_NOT_FOUND',
  QUOTA_EXCEEDED: 'QUOTA_EXCEEDED',
  INVALID_TOKEN: 'INVALID_TOKEN',
  SESSION_EXPIRED: 'SESSION_EXPIRED',
} as const;

export type ErrorCode = typeof ErrorCodes[keyof typeof ErrorCodes];

// ============================================
// RESPONSE BUILDERS
// ============================================

/**
 * Create a success response
 */
export function success<T>(data: T, meta?: Partial<ApiMeta>): ApiResponse<T> {
  return {
    success: true,
    data,
    meta: {
      timestamp: new Date().toISOString(),
      ...meta,
    },
  };
}

/**
 * Create a success response with pagination
 */
export function paginated<T>(
  data: T[],
  pagination: {
    page: number;
    pageSize: number;
    total: number;
  },
  meta?: Partial<ApiMeta>
): ApiResponse<T[]> {
  const totalPages = Math.ceil(pagination.total / pagination.pageSize);

  return {
    success: true,
    data,
    meta: {
      timestamp: new Date().toISOString(),
      ...meta,
      pagination: {
        page: pagination.page,
        pageSize: pagination.pageSize,
        total: pagination.total,
        totalPages,
        hasNext: pagination.page < totalPages,
        hasPrev: pagination.page > 1,
      },
    },
  };
}

/**
 * Create an error response
 */
export function error(
  code: ErrorCode,
  message: string,
  details?: unknown
): ApiResponse<never> {
  return {
    success: false,
    error: {
      code,
      message,
      details,
    },
    meta: {
      timestamp: new Date().toISOString(),
    },
  };
}

// ============================================
// ERROR HELPERS
// ============================================

/**
 * Create a validation error response
 */
export function validationError(
  message: string,
  fieldErrors?: Record<string, string>
): ApiResponse<never> {
  return error(ErrorCodes.VALIDATION_ERROR, message, fieldErrors);
}

/**
 * Create a not found error response
 */
export function notFound(resource: string): ApiResponse<never> {
  return error(ErrorCodes.NOT_FOUND, `${resource} not found`);
}

/**
 * Create an unauthorized error response
 */
export function unauthorized(message = 'Authentication required'): ApiResponse<never> {
  return error(ErrorCodes.UNAUTHORIZED, message);
}

/**
 * Create a forbidden error response
 */
export function forbidden(message = 'Access denied'): ApiResponse<never> {
  return error(ErrorCodes.FORBIDDEN, message);
}

/**
 * Create a rate limited error response
 */
export function rateLimited(retryAfterSeconds?: number): ApiResponse<never> {
  return error(
    ErrorCodes.RATE_LIMITED,
    'Too many requests',
    retryAfterSeconds ? { retryAfter: retryAfterSeconds } : undefined
  );
}

/**
 * Create an internal error response (logs the error)
 */
export function internalError(err: unknown, requestId?: string): ApiResponse<never> {
  // Log the actual error for debugging
  log.error('Internal server error', err as Error, { requestId });

  // Return generic message to client
  return error(
    ErrorCodes.INTERNAL_ERROR,
    'An unexpected error occurred'
  );
}

// ============================================
// TYPE GUARDS
// ============================================

/**
 * Check if response is successful
 */
export function isSuccess<T>(response: ApiResponse<T>): response is ApiResponse<T> & { data: T } {
  return response.success && response.data !== undefined;
}

/**
 * Check if response is an error
 */
export function isError<T>(response: ApiResponse<T>): response is ApiResponse<T> & { error: ApiError } {
  return !response.success && response.error !== undefined;
}

// ============================================
// TRPC ERROR MAPPING
// ============================================

import { TRPCError } from '@trpc/server';

/**
 * Convert TRPCError to ApiResponse
 */
export function fromTRPCError(err: TRPCError): ApiResponse<never> {
  const codeMap: Record<string, ErrorCode> = {
    BAD_REQUEST: ErrorCodes.BAD_REQUEST,
    UNAUTHORIZED: ErrorCodes.UNAUTHORIZED,
    FORBIDDEN: ErrorCodes.FORBIDDEN,
    NOT_FOUND: ErrorCodes.NOT_FOUND,
    CONFLICT: ErrorCodes.CONFLICT,
    TOO_MANY_REQUESTS: ErrorCodes.RATE_LIMITED,
    INTERNAL_SERVER_ERROR: ErrorCodes.INTERNAL_ERROR,
  };

  return error(
    codeMap[err.code] || ErrorCodes.INTERNAL_ERROR,
    err.message
  );
}

/**
 * Convert ApiError to TRPCError
 */
export function toTRPCError(apiError: ApiError): TRPCError {
  const codeMap: Record<ErrorCode, TRPCError['code']> = {
    [ErrorCodes.BAD_REQUEST]: 'BAD_REQUEST',
    [ErrorCodes.UNAUTHORIZED]: 'UNAUTHORIZED',
    [ErrorCodes.FORBIDDEN]: 'FORBIDDEN',
    [ErrorCodes.NOT_FOUND]: 'NOT_FOUND',
    [ErrorCodes.VALIDATION_ERROR]: 'BAD_REQUEST',
    [ErrorCodes.RATE_LIMITED]: 'TOO_MANY_REQUESTS',
    [ErrorCodes.CONFLICT]: 'CONFLICT',
    [ErrorCodes.INTERNAL_ERROR]: 'INTERNAL_SERVER_ERROR',
    [ErrorCodes.SERVICE_UNAVAILABLE]: 'INTERNAL_SERVER_ERROR',
    [ErrorCodes.DATABASE_ERROR]: 'INTERNAL_SERVER_ERROR',
    [ErrorCodes.EXTERNAL_SERVICE_ERROR]: 'INTERNAL_SERVER_ERROR',
    [ErrorCodes.AI_PROVIDER_ERROR]: 'INTERNAL_SERVER_ERROR',
    [ErrorCodes.USER_NOT_FOUND]: 'NOT_FOUND',
    [ErrorCodes.CHILD_NOT_FOUND]: 'NOT_FOUND',
    [ErrorCodes.QUOTA_EXCEEDED]: 'FORBIDDEN',
    [ErrorCodes.INVALID_TOKEN]: 'UNAUTHORIZED',
    [ErrorCodes.SESSION_EXPIRED]: 'UNAUTHORIZED',
  };

  return new TRPCError({
    code: codeMap[apiError.code] || 'INTERNAL_SERVER_ERROR',
    message: apiError.message,
  });
}

export default {
  success,
  paginated,
  error,
  validationError,
  notFound,
  unauthorized,
  forbidden,
  rateLimited,
  internalError,
  ErrorCodes,
};
