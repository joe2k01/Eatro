import { useCallback, useMemo, useRef, useState } from "react";
import type { ZodSchema, ZodError } from "zod";

type FieldErrors<T> = Partial<Record<keyof T, string>>;

type UseFormOptions<T extends Record<string, unknown>> = {
  initialValues: T;
  /** Optional Zod schema for validation */
  schema?: ZodSchema<T>;
};

type UseFormReturn<T extends Record<string, unknown>> = {
  /** Current form values */
  values: T;
  /** Field-level error messages (populated after validate() call) */
  errors: FieldErrors<T>;
  /** Update a single field value */
  setValue: <K extends keyof T>(field: K, value: T[K]) => void;
  /** Update multiple field values at once */
  setValues: (updates: Partial<T>) => void;
  /** Run validation, returns true if valid. Populates errors if invalid. */
  validate: () => boolean;
  /** Reset form to initial values and clear errors */
  reset: () => void;
  /** Clear all errors */
  clearErrors: () => void;
};

export function useForm<T extends Record<string, unknown>>({
  initialValues,
  schema,
}: UseFormOptions<T>): UseFormReturn<T> {
  // Use ref for initialValues to avoid recreating callbacks when it changes
  const initialValuesRef = useRef(initialValues);

  const [values, setValuesState] = useState<T>(initialValues);
  const [errors, setErrors] = useState<FieldErrors<T>>({});

  const setValue = useCallback(<K extends keyof T>(field: K, value: T[K]) => {
    setValuesState((prev) => {
      // Only update if value actually changed
      if (prev[field] === value) return prev;
      return { ...prev, [field]: value };
    });
  }, []);

  const setValues = useCallback((updates: Partial<T>) => {
    setValuesState((prev) => ({ ...prev, ...updates }));
  }, []);

  const validate = useCallback((): boolean => {
    if (!schema) {
      // No schema = always valid
      setErrors({});
      return true;
    }

    const result = schema.safeParse(values);

    if (result.success) {
      setErrors({});
      return true;
    }

    // Extract field-level errors from Zod
    const zodError = result.error as ZodError;
    const fieldErrors: FieldErrors<T> = {};

    for (const issue of zodError.issues) {
      const field = issue.path[0] as keyof T;
      // Only keep first error per field
      if (field && !fieldErrors[field]) {
        fieldErrors[field] = issue.message;
      }
    }

    setErrors(fieldErrors);
    return false;
  }, [schema, values]);

  const reset = useCallback(() => {
    setValuesState(initialValuesRef.current);
    setErrors({});
  }, []);

  const clearErrors = useCallback(() => {
    setErrors({});
  }, []);

  return useMemo(
    () => ({
      values,
      errors,
      setValue,
      setValues,
      validate,
      reset,
      clearErrors,
    }),
    [values, errors, setValue, setValues, validate, reset, clearErrors],
  );
}
