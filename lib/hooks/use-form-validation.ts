import { useState, useCallback, useEffect } from 'react'

export interface ValidationRule {
  required?: boolean
  minLength?: number
  maxLength?: number
  pattern?: RegExp
  custom?: (value: string | number | boolean | null) => string | null
  min?: number
  max?: number
  email?: boolean
  url?: boolean
  numeric?: boolean
}

export interface ValidationSchema {
  [fieldName: string]: ValidationRule
}

export interface ValidationErrors {
  [fieldName: string]: string
}

export interface UseFormValidationOptions {
  schema: ValidationSchema
  initialValues?: {
    [K in keyof ValidationSchema]: string | number | boolean | null
  }
  validateOnChange?: boolean
  validateOnBlur?: boolean
  validateOnSubmit?: boolean
}

export function useFormValidation({
  schema,
  initialValues = {},
  validateOnChange = true,
  validateOnBlur = true,
  validateOnSubmit = true,
}: UseFormValidationOptions) {
  const [values, setValues] = useState(initialValues)
  const [errors, setErrors] = useState<ValidationErrors>({})
  const [touched, setTouched] = useState<Record<string, boolean>>({})
  const [isValid, setIsValid] = useState(false)

  // Validation functions
  const validateField = useCallback(
    (
      fieldName: string,
      value: string | number | boolean | null
    ): string | null => {
      const rule = schema[fieldName]
      if (!rule) return null

      // Required validation
      if (
        rule.required &&
        (!value || (typeof value === 'string' && value.trim() === ''))
      ) {
        return `${fieldName} is required`
      }

      if (value === null || value === undefined || value === '') {
        return null // Skip other validations if field is empty and not required
      }

      // Type validation
      if (rule.email && typeof value === 'string') {
        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!emailPattern.test(value)) {
          return 'Invalid email format'
        }
      }

      if (rule.url && typeof value === 'string') {
        try {
          new URL(value.startsWith('http') ? value : `https://${value}`)
        } catch {
          return 'Invalid URL format'
        }
      }

      if (rule.numeric && typeof value === 'string') {
        if (isNaN(Number(value))) {
          return 'Must be a number'
        }
      }

      // Length validation
      if (typeof value === 'string') {
        if (rule.minLength && value.length < rule.minLength) {
          return `Must be at least ${rule.minLength} characters`
        }
        if (rule.maxLength && value.length > rule.maxLength) {
          return `Must be no more than ${rule.maxLength} characters`
        }
      }

      // Numeric range validation
      if (
        typeof value === 'number' ||
        (typeof value === 'string' && !isNaN(Number(value)))
      ) {
        const numValue = typeof value === 'string' ? Number(value) : value
        if (rule.min !== undefined && numValue < rule.min) {
          return `Must be at least ${rule.min}`
        }
        if (rule.max !== undefined && numValue > rule.max) {
          return `Must be no more than ${rule.max}`
        }
      }

      // Pattern validation
      if (
        rule.pattern &&
        typeof value === 'string' &&
        !rule.pattern.test(value)
      ) {
        return 'Invalid format'
      }

      // Custom validation
      if (rule.custom) {
        const customError = rule.custom(value)
        if (customError) return customError
      }

      return null
    },
    [schema]
  )

  const validateForm = useCallback((): ValidationErrors => {
    const newErrors: ValidationErrors = {}

    Object.keys(schema).forEach(fieldName => {
      const error = validateField(fieldName, values[fieldName])
      if (error) {
        newErrors[fieldName] = error
      }
    })

    return newErrors
  }, [schema, values, validateField])

  // Update validation state
  useEffect(() => {
    const newErrors = validateForm()
    setErrors(newErrors)
    setIsValid(Object.keys(newErrors).length === 0)
  }, [values, validateForm])

  // Field change handler
  const handleChange = useCallback(
    (fieldName: string, value: string | number | boolean | null) => {
      setValues(prev => ({ ...prev, [fieldName]: value }))

      if (validateOnChange) {
        const error = validateField(fieldName, value)
        setErrors(prev => ({
          ...prev,
          [fieldName]: error || '',
        }))
      }
    },
    [validateOnChange, validateField]
  )

  // Field blur handler
  const handleBlur = useCallback(
    (fieldName: string) => {
      setTouched(prev => ({ ...prev, [fieldName]: true }))

      if (validateOnBlur) {
        const error = validateField(fieldName, values[fieldName])
        setErrors(prev => ({
          ...prev,
          [fieldName]: error || '',
        }))
      }
    },
    [validateOnBlur, validateField, values]
  )

  // Form submission handler
  const handleSubmit = useCallback(
    (
      onSubmit: (
        values: Record<string, string | number | boolean | null>
      ) => void
    ) => {
      if (validateOnSubmit) {
        const newErrors = validateForm()
        setErrors(newErrors)

        if (Object.keys(newErrors).length === 0) {
          onSubmit(values)
        }
      } else {
        onSubmit(values)
      }
    },
    [validateOnSubmit, validateForm, values]
  )

  // Reset form
  const reset = useCallback(
    (newValues?: Record<string, string | number | boolean | null>) => {
      const resetValues = newValues || initialValues
      setValues(resetValues)
      setErrors({})
      setTouched({})
      setIsValid(false)
    },
    [initialValues]
  )

  // Set field error manually
  const setFieldError = useCallback(
    (fieldName: string, error: string | null) => {
      setErrors(prev => ({
        ...prev,
        [fieldName]: error || '',
      }))
    },
    []
  )

  // Check if field has error
  const hasError = useCallback(
    (fieldName: string): boolean => {
      return !!errors[fieldName]
    },
    [errors]
  )

  // Get field error
  const getFieldError = useCallback(
    (fieldName: string): string | null => {
      return errors[fieldName] || null
    },
    [errors]
  )

  // Check if field is touched
  const isTouched = useCallback(
    (fieldName: string): boolean => {
      return !!touched[fieldName]
    },
    [touched]
  )

  return {
    values,
    errors,
    touched,
    isValid,
    handleChange,
    handleBlur,
    handleSubmit,
    reset,
    setFieldError,
    hasError,
    getFieldError,
    isTouched,
    validateField,
    validateForm,
  }
}

// Predefined validation schemas for common use cases
export const commonValidations = {
  required: { required: true },
  email: { required: true, email: true },
  url: { url: true },
  numeric: { numeric: true },
  minLength: (min: number) => ({ minLength: min }),
  maxLength: (max: number) => ({ maxLength: max }),
  range: (min: number, max: number) => ({ min, max }),
  pattern: (regex: RegExp) => ({ pattern: regex }),
}

// Example usage:
// const validationSchema: ValidationSchema = {
//   name: { ...commonValidations.required, ...commonValidations.minLength(2) },
//   email: commonValidations.email,
//   age: { ...commonValidations.required, ...commonValidations.range(18, 100) },
// }
