/**
 * useValidatedForm Hook
 *
 * A wrapper around React Hook Form with Zod validation
 * Provides consistent form handling across the app
 */

import { useCallback, useState } from 'react';
import { useForm, UseFormProps, FieldValues, UseFormReturn } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

interface UseValidatedFormOptions<T extends FieldValues> extends Omit<UseFormProps<T>, 'resolver'> {
  schema: z.ZodSchema<T>;
  onSubmit: (data: T) => Promise<void> | void;
  onError?: (error: Error) => void;
}

interface UseValidatedFormReturn<T extends FieldValues> extends UseFormReturn<T> {
  isSubmitting: boolean;
  submitError: string | null;
  handleFormSubmit: () => Promise<void>;
  clearSubmitError: () => void;
}

/**
 * Custom hook for validated forms with consistent error handling
 *
 * @example
 * const form = useValidatedForm({
 *   schema: loginSchema,
 *   defaultValues: { email: '', password: '' },
 *   onSubmit: async (data) => {
 *     await signIn(data.email, data.password);
 *   },
 * });
 *
 * return (
 *   <View>
 *     <Controller
 *       control={form.control}
 *       name="email"
 *       render={({ field, fieldState }) => (
 *         <Input
 *           value={field.value}
 *           onChangeText={field.onChange}
 *           error={fieldState.error?.message}
 *         />
 *       )}
 *     />
 *     <Button onPress={form.handleFormSubmit} loading={form.isSubmitting} />
 *     {form.submitError && <Text>{form.submitError}</Text>}
 *   </View>
 * );
 */
export function useValidatedForm<T extends FieldValues>({
  schema,
  onSubmit,
  onError,
  ...formOptions
}: UseValidatedFormOptions<T>): UseValidatedFormReturn<T> {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const form = useForm<T>({
    ...formOptions,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(schema as any) as any,
  });

  const clearSubmitError = useCallback(() => {
    setSubmitError(null);
  }, []);

  const handleFormSubmit = useCallback(async () => {
    setSubmitError(null);
    setIsSubmitting(true);

    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await form.handleSubmit(async (data: any) => {
        await onSubmit(data);
      })();
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Bir hata oluştu. Lütfen tekrar deneyin.';
      setSubmitError(errorMessage);
      onError?.(error instanceof Error ? error : new Error(errorMessage));
    } finally {
      setIsSubmitting(false);
    }
  }, [form, onSubmit, onError]);

  return {
    ...form,
    isSubmitting,
    submitError,
    handleFormSubmit,
    clearSubmitError,
  } as UseValidatedFormReturn<T>;
}

/**
 * Type helper for extracting form data type from schema
 */
export type InferFormData<T extends z.ZodSchema> = z.infer<T>;
