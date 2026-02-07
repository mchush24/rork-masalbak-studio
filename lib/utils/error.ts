/**
 * Error Handling Utilities
 *
 * Type-safe error message extraction
 */

/**
 * Extract error message from an unknown error type
 * Useful for catch blocks where error type is unknown
 */
export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  if (typeof error === 'string') {
    return error;
  }
  if (error && typeof error === 'object' && 'message' in error) {
    return String((error as { message: unknown }).message);
  }
  return 'An unknown error occurred';
}

/**
 * Check if error has a specific status code
 */
export function hasStatusCode(error: unknown, statusCode: number): boolean {
  if (error && typeof error === 'object' && 'status' in error) {
    return (error as { status: unknown }).status === statusCode;
  }
  if (error && typeof error === 'object' && 'statusCode' in error) {
    return (error as { statusCode: unknown }).statusCode === statusCode;
  }
  return false;
}

/**
 * Type guard to check if error is an Error object
 */
export function isError(error: unknown): error is Error {
  return error instanceof Error;
}

/**
 * Safe error logging that extracts useful information
 */
export function logError(context: string, error: unknown): void {
  const message = getErrorMessage(error);
  console.error(`[${context}]`, message);

  // Log stack trace if available
  if (error instanceof Error && error.stack) {
    console.error(`[${context}] Stack:`, error.stack);
  }
}
