/**
 * Shared utility functions for backend operations
 */

/**
 * Escape HTML special characters to prevent XSS
 * @param s - String to escape
 * @returns Escaped string safe for HTML insertion
 */
export function escapeHtml(s: string): string {
  return s.replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c] as string));
}
