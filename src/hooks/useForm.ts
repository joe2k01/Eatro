import { useCallback, useMemo, useRef, useState } from "react";
import type { ZodSchema, ZodError, z } from "zod";

type FieldErrors<T> = Partial<Record<keyof T, string>>;

type UseFormOptions<
  T extends Record<string, unknown>,
  S extends ZodSchema<T>,
> = {
  initialValues: T;
  /** Optional Zod schema for validation - also infers the validated type */
  schema?: S;
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

export function useForm<
  T extends Record<string, unknown>,
  S extends ZodSchema<T> = ZodSchema<T>,
>({
  initialValues,
  schema,
}: UseFormOptions<T, S>): UseFormReturn<z.infer<S> extends T ? z.infer<S> : T> {
  type FormValues = z.infer<S> extends T ? z.infer<S> : T;

  const initialValuesRef = useRef(initialValues as FormValues);
  const schemaRef = useRef(schema);

  const [values, setValuesState] = useState<FormValues>(
    initialValues as FormValues,
  );
  const [errors, setErrors] = useState<FieldErrors<FormValues>>({});

  // Use refs for current values to avoid stale closures
  const valuesRef = useRef(values);
  valuesRef.current = values;

  // Stable setValue that doesn't change between renders
  const setValue = useCallback(
    <K extends keyof FormValues>(field: K, value: FormValues[K]) => {
      setValuesState((prev) => {
        if (prev[field] === value) return prev;
        return { ...prev, [field]: value };
      });
    },
    [],
  );

  // Stable setValues that doesn't change between renders
  const setValues = useCallback((updates: Partial<FormValues>) => {
    setValuesState((prev) => ({ ...prev, ...updates }));
  }, []);

  // Stable validate that uses ref for current values
  const validate = useCallback((): boolean => {
    const currentSchema = schemaRef.current;
    if (!currentSchema) {
      setErrors({});
      return true;
    }

    const result = currentSchema.safeParse(valuesRef.current);

    if (result.success) {
      setErrors({});
      return true;
    }

    const zodError = result.error as ZodError;
    const fieldErrors: FieldErrors<FormValues> = {};

    for (const issue of zodError.issues) {
      const field = issue.path[0] as keyof FormValues;
      if (field && !fieldErrors[field]) {
        fieldErrors[field] = issue.message;
      }
    }

    setErrors(fieldErrors);
    return false;
  }, []);

  // Stable reset
  const reset = useCallback(() => {
    setValuesState(initialValuesRef.current);
    setErrors({});
  }, []);

  // Stable clearErrors
  const clearErrors = useCallback(() => {
    setErrors({});
  }, []);

  // Only values and errors change - functions are stable
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
