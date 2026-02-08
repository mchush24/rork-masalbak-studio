/**
 * Auth Hook - Re-exports from AuthContext
 *
 * This file exists for backward compatibility. All auth logic now lives
 * in lib/contexts/AuthContext.tsx as a singleton context provider.
 *
 * New code should import directly from '@/lib/contexts/AuthContext'.
 */

export { useAuth } from '@/lib/contexts/AuthContext';
export type { UserSession, Child } from '@/lib/contexts/AuthContext';
