/**
 * Form Validation System
 * Phase 4: Advanced Features
 *
 * Provides:
 * - Zod schema integration
 * - Field-level validation
 * - Form-level validation
 * - Real-time validation
 * - Error message formatting
 * - Touched/dirty state tracking
 */

import { useState, useCallback, useMemo, useRef } from 'react';
import { z, ZodSchema, ZodError, ZodIssue } from 'zod';

// Validation error type
export interface FieldError {
  message: string;
  code: string;
  path: string[];
}

// Field state
export interface FieldState {
  value: unknown;
  error: FieldError | null;
  touched: boolean;
  dirty: boolean;
}

// Form state
export interface FormState<T> {
  values: T;
  errors: Record<string, FieldError>;
  touched: Record<string, boolean>;
  dirty: Record<string, boolean>;
  isValid: boolean;
  isSubmitting: boolean;
  submitCount: number;
}

// Validation mode
type ValidationMode = 'onChange' | 'onBlur' | 'onSubmit' | 'all';

// Form options
interface UseFormOptions<T> {
  /** Zod schema for validation */
  schema: ZodSchema<T>;
  /** Initial values */
  initialValues: T;
  /** Validation mode */
  mode?: ValidationMode;
  /** Revalidate on change after submit */
  revalidateOnChange?: boolean;
  /** Custom error messages */
  errorMessages?: Record<string, string>;
  /** On submit handler */
  onSubmit?: (values: T) => void | Promise<void>;
  /** On error handler */
  onError?: (errors: Record<string, FieldError>) => void;
}

// Turkish error messages
const DEFAULT_ERROR_MESSAGES: Record<string, string> = {
  invalid_type: 'Geçersiz değer türü',
  required: 'Bu alan zorunludur',
  too_small: 'Değer çok kısa',
  too_big: 'Değer çok uzun',
  invalid_string: 'Geçersiz metin formatı',
  invalid_email: 'Geçerli bir e-posta adresi girin',
  invalid_url: 'Geçerli bir URL girin',
  invalid_date: 'Geçerli bir tarih girin',
  custom: 'Geçersiz değer',
};

// Format Zod error to user-friendly message
function formatZodError(issue: ZodIssue, customMessages?: Record<string, string>): string {
  const messages = { ...DEFAULT_ERROR_MESSAGES, ...customMessages };

  // Check for custom message first
  if (issue.message && issue.message !== 'Required') {
    return issue.message;
  }

  // Map error codes to messages
  // Use `any` cast because Zod v4 changed issue type shapes
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const iss = issue as any;
  switch (iss.code) {
    case 'invalid_type':
      if (iss.received === 'undefined' || iss.received === 'null') {
        return messages.required;
      }
      return messages.invalid_type;

    case 'too_small':
      if (iss.type === 'string') {
        if (iss.minimum === 1) {
          return messages.required;
        }
        return `En az ${iss.minimum} karakter olmalı`;
      }
      if (iss.type === 'number') {
        return `En az ${iss.minimum} olmalı`;
      }
      if (iss.type === 'array') {
        return `En az ${iss.minimum} öğe seçin`;
      }
      return messages.too_small;

    case 'too_big':
      if (iss.type === 'string') {
        return `En fazla ${iss.maximum} karakter olabilir`;
      }
      if (iss.type === 'number') {
        return `En fazla ${iss.maximum} olabilir`;
      }
      if (iss.type === 'array') {
        return `En fazla ${iss.maximum} öğe seçilebilir`;
      }
      return messages.too_big;

    case 'invalid_string':
    case 'invalid_format':
      if (iss.validation === 'email' || iss.format === 'email') {
        return messages.invalid_email;
      }
      if (iss.validation === 'url' || iss.format === 'url') {
        return messages.invalid_url;
      }
      return messages.invalid_string;

    case 'invalid_date':
      return messages.invalid_date;

    case 'custom':
      return iss.message || messages.custom;

    default:
      return issue.message || messages.custom;
  }
}

// Parse Zod errors to field errors
function parseZodErrors(
  error: ZodError,
  customMessages?: Record<string, string>
): Record<string, FieldError> {
  const errors: Record<string, FieldError> = {};

  error.issues.forEach(issue => {
    const path = issue.path.join('.');
    if (!errors[path]) {
      errors[path] = {
        message: formatZodError(issue, customMessages),
        code: issue.code,
        path: issue.path.map(String),
      };
    }
  });

  return errors;
}

// Main form hook
export function useForm<T extends Record<string, unknown>>({
  schema,
  initialValues,
  mode = 'onBlur',
  revalidateOnChange = true,
  errorMessages,
  onSubmit,
  onError,
}: UseFormOptions<T>) {
  const [values, setValues] = useState<T>(initialValues);
  const [errors, setErrors] = useState<Record<string, FieldError>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [dirty, setDirty] = useState<Record<string, boolean>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitCount, setSubmitCount] = useState(0);

  const initialValuesRef = useRef(initialValues);

  // Check if form is valid
  const isValid = useMemo(() => {
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (schema as any).parse(values);
      return true;
    } catch {
      return false;
    }
  }, [schema, values]);

  // Validate single field
  const validateField = useCallback(
    (name: string, value: unknown): FieldError | null => {
      try {
        // Create partial schema for single field
        const fieldSchema = (schema as z.ZodObject<z.ZodRawShape>).shape?.[name];
        if (fieldSchema) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (fieldSchema as any).parse(value);
        }
        return null;
      } catch (error) {
        if (error instanceof ZodError) {
          const fieldErrors = parseZodErrors(error, errorMessages);
          return fieldErrors[name] || null;
        }
        return null;
      }
    },
    [schema, errorMessages]
  );

  // Validate entire form
  const validateForm = useCallback((): Record<string, FieldError> => {
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (schema as any).parse(values);
      return {};
    } catch (error) {
      if (error instanceof ZodError) {
        return parseZodErrors(error, errorMessages);
      }
      return {};
    }
  }, [schema, values, errorMessages]);

  // Set field value
  const setValue = useCallback(
    (name: string, value: unknown) => {
      setValues(prev => ({ ...prev, [name]: value }));

      // Mark as dirty if different from initial
      const isDirty = value !== initialValuesRef.current[name as keyof T];
      setDirty(prev => ({ ...prev, [name]: isDirty }));

      // Validate on change if mode is 'onChange' or 'all'
      // Or if submitted and revalidateOnChange is true
      if (mode === 'onChange' || mode === 'all' || (submitCount > 0 && revalidateOnChange)) {
        const error = validateField(name, value);
        setErrors(prev => {
          if (error) {
            return { ...prev, [name]: error };
          }
          const { [name]: _removed, ...rest } = prev;
          return rest;
        });
      }
    },
    [mode, submitCount, revalidateOnChange, validateField]
  );

  // Set field touched
  const setFieldTouched = useCallback(
    (name: string, isTouched = true) => {
      setTouched(prev => ({ ...prev, [name]: isTouched }));

      // Validate on blur if mode is 'onBlur' or 'all'
      if ((mode === 'onBlur' || mode === 'all') && isTouched) {
        const error = validateField(name, values[name as keyof T]);
        setErrors(prev => {
          if (error) {
            return { ...prev, [name]: error };
          }
          const { [name]: _removed, ...rest } = prev;
          return rest;
        });
      }
    },
    [mode, values, validateField]
  );

  // Set multiple values at once
  const setMultipleValues = useCallback((newValues: Partial<T>) => {
    setValues(prev => ({ ...prev, ...newValues }));

    // Update dirty state
    Object.keys(newValues).forEach(key => {
      const isDirty = newValues[key as keyof T] !== initialValuesRef.current[key as keyof T];
      setDirty(prev => ({ ...prev, [key]: isDirty }));
    });
  }, []);

  // Reset form
  const reset = useCallback((newValues?: T) => {
    const resetValues = newValues || initialValuesRef.current;
    setValues(resetValues);
    setErrors({});
    setTouched({});
    setDirty({});
    setIsSubmitting(false);
    if (newValues) {
      initialValuesRef.current = newValues;
    }
  }, []);

  // Handle submit
  const handleSubmit = useCallback(async () => {
    setSubmitCount(c => c + 1);

    // Mark all fields as touched
    const allTouched: Record<string, boolean> = {};
    Object.keys(values).forEach(key => {
      allTouched[key] = true;
    });
    setTouched(allTouched);

    // Validate all fields
    const validationErrors = validateForm();
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) {
      onError?.(validationErrors);
      return false;
    }

    if (onSubmit) {
      setIsSubmitting(true);
      try {
        await onSubmit(values);
        return true;
      } catch (error) {
        console.error('[Form] Submit error:', error);
        return false;
      } finally {
        setIsSubmitting(false);
      }
    }

    return true;
  }, [values, validateForm, onSubmit, onError]);

  // Get field props for input
  const getFieldProps = useCallback(
    (name: string) => ({
      value: values[name as keyof T],
      onChangeText: (text: string) => setValue(name, text),
      onBlur: () => setFieldTouched(name, true),
      error: touched[name] ? errors[name]?.message : undefined,
    }),
    [values, errors, touched, setValue, setFieldTouched]
  );

  // Get field state
  const getFieldState = useCallback(
    (name: string): FieldState => ({
      value: values[name as keyof T],
      error: errors[name] || null,
      touched: touched[name] || false,
      dirty: dirty[name] || false,
    }),
    [values, errors, touched, dirty]
  );

  // Check if specific field has error
  const hasError = useCallback(
    (name: string): boolean => {
      return touched[name] && !!errors[name];
    },
    [touched, errors]
  );

  // Get error message for field
  const getError = useCallback(
    (name: string): string | undefined => {
      return touched[name] ? errors[name]?.message : undefined;
    },
    [touched, errors]
  );

  return {
    // State
    values,
    errors,
    touched,
    dirty,
    isValid,
    isSubmitting,
    submitCount,

    // Actions
    setValue,
    setFieldTouched,
    setMultipleValues,
    reset,
    handleSubmit,
    validateField,
    validateForm,

    // Helpers
    getFieldProps,
    getFieldState,
    hasError,
    getError,
  };
}

// Field-level validation hook
export function useFieldValidation<T>(
  schema: ZodSchema<T>,
  customMessages?: Record<string, string>
) {
  const validate = useCallback(
    (value: unknown): FieldError | null => {
      try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (schema as any).parse(value);
        return null;
      } catch (error) {
        if (error instanceof ZodError && error.issues[0]) {
          return {
            message: formatZodError(error.issues[0], customMessages),
            code: error.issues[0].code,
            path: error.issues[0].path.map(String),
          };
        }
        return null;
      }
    },
    [schema, customMessages]
  );

  const isValid = useCallback(
    (value: unknown): boolean => {
      try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (schema as any).parse(value);
        return true;
      } catch {
        return false;
      }
    },
    [schema]
  );

  return { validate, isValid };
}

// Common validation schemas
export const commonSchemas = {
  // Email
  email: z.string().email('Geçerli bir e-posta adresi girin'),

  // Password
  password: z
    .string()
    .min(8, 'Şifre en az 8 karakter olmalı')
    .regex(/[A-Z]/, 'En az bir büyük harf içermeli')
    .regex(/[a-z]/, 'En az bir küçük harf içermeli')
    .regex(/[0-9]/, 'En az bir rakam içermeli'),

  // Simple password (less strict)
  simplePassword: z.string().min(6, 'Şifre en az 6 karakter olmalı'),

  // Name
  name: z
    .string()
    .min(2, 'İsim en az 2 karakter olmalı')
    .max(50, 'İsim en fazla 50 karakter olabilir'),

  // Phone (Turkish format)
  phone: z.string().regex(/^(\+90|0)?[0-9]{10}$/, 'Geçerli bir telefon numarası girin'),

  // Age
  age: z.number().min(1, 'Geçerli bir yaş girin').max(18, 'Yaş 1-18 arasında olmalı'),

  // Child age (for the app)
  childAge: z
    .number()
    .min(3, 'Çocuk yaşı en az 3 olmalı')
    .max(12, 'Çocuk yaşı en fazla 12 olabilir'),

  // Required string
  required: z.string().min(1, 'Bu alan zorunludur'),

  // Optional string
  optional: z.string().optional(),

  // URL
  url: z.string().url('Geçerli bir URL girin'),

  // Date string (YYYY-MM-DD)
  dateString: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Geçerli bir tarih girin'),
};

// Create password confirmation schema
export function createPasswordConfirmSchema(_passwordFieldName = 'password') {
  return z.string().refine(val => val.length > 0, { message: 'Şifre tekrarı zorunludur' });
}

// Create form schema helper
export function createFormSchema<T extends z.ZodRawShape>(shape: T) {
  return z.object(shape);
}

export default useForm;
