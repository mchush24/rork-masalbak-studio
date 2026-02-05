/**
 * Validation Module
 *
 * Centralized form validation using Zod schemas
 * Integrates with React Hook Form via @hookform/resolvers
 *
 * @example
 * import { loginSchema, LoginFormData } from '@/lib/validation';
 * import { useForm } from 'react-hook-form';
 * import { zodResolver } from '@hookform/resolvers/zod';
 *
 * const { control, handleSubmit } = useForm<LoginFormData>({
 *   resolver: zodResolver(loginSchema),
 * });
 */

// All schemas and types
export * from './schemas';

// Form hooks
export { useValidatedForm } from './useValidatedForm';
export type { InferFormData } from './useValidatedForm';

// Re-export zod for convenience
export { z } from 'zod';
