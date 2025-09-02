import React from 'react'
import { cn } from '@/lib/utils'

interface FormFieldProps {
  label: string
  name: string
  type?:
    | 'text'
    | 'email'
    | 'password'
    | 'number'
    | 'date'
    | 'url'
    | 'tel'
    | 'textarea'
  value: string | number
  onChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => void
  placeholder?: string
  required?: boolean
  disabled?: boolean
  error?: string
  className?: string
  labelClassName?: string
  inputClassName?: string
  rows?: number
  min?: number
  max?: number
  step?: number
  pattern?: string
  autoComplete?: string
  autoFocus?: boolean
  readOnly?: boolean
  size?: 'sm' | 'md' | 'lg'
  variant?: 'default' | 'outline' | 'filled'
}

export default function FormField({
  label,
  name,
  type = 'text',
  value,
  onChange,
  placeholder,
  required = false,
  disabled = false,
  error,
  className = '',
  labelClassName = '',
  inputClassName = '',
  rows = 4,
  min,
  max,
  step,
  pattern,
  autoComplete,
  autoFocus = false,
  readOnly = false,
  size = 'md',
  variant = 'default',
}: FormFieldProps) {
  const sizeClasses = {
    sm: {
      label: 'text-sm',
      input: 'px-2 py-1.5 text-sm',
    },
    md: {
      label: 'text-sm',
      input: 'px-3 py-2 text-sm',
    },
    lg: {
      label: 'text-base',
      input: 'px-4 py-3 text-base',
    },
  }

  const variantClasses = {
    default: 'border-input bg-background text-foreground',
    outline: 'border-border bg-transparent text-foreground',
    filled: 'border-transparent bg-muted text-foreground',
  }

  const currentSize = sizeClasses[size]

  const baseInputClasses = cn(
    'w-full border rounded-md transition-colors duration-200',
    'focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring',
    'disabled:opacity-50 disabled:cursor-not-allowed',
    'placeholder:text-muted-foreground',
    currentSize.input,
    variantClasses[variant],
    error && 'border-destructive focus:ring-destructive/20',
    inputClassName
  )

  return (
    <div className={cn('space-y-2', className)}>
      <label
        htmlFor={name}
        className={cn(
          'block font-medium text-foreground',
          currentSize.label,
          labelClassName
        )}
      >
        {label}
        {required && <span className='text-destructive ml-1'>*</span>}
      </label>

      {type === 'textarea' ? (
        <textarea
          id={name}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          disabled={disabled}
          rows={rows}
          autoComplete={autoComplete}
          autoFocus={autoFocus}
          readOnly={readOnly}
          className={baseInputClasses}
        />
      ) : (
        <input
          id={name}
          name={name}
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          disabled={disabled}
          min={min}
          max={max}
          step={step}
          pattern={pattern}
          autoComplete={autoComplete}
          autoFocus={autoFocus}
          readOnly={readOnly}
          className={baseInputClasses}
        />
      )}

      {error && <p className='text-sm text-destructive'>{error}</p>}
    </div>
  )
}

// Specialized form field components
interface TextFieldProps extends Omit<FormFieldProps, 'type'> {
  multiline?: boolean
}

export function TextField({ multiline = false, ...props }: TextFieldProps) {
  return <FormField {...props} type={multiline ? 'textarea' : 'text'} />
}

interface NumberFieldProps extends Omit<FormFieldProps, 'type'> {
  allowDecimals?: boolean
  minValue?: number
  maxValue?: number
}

export function NumberField({
  allowDecimals = false,
  minValue,
  maxValue,
  ...props
}: NumberFieldProps) {
  return (
    <FormField
      {...props}
      type='number'
      step={allowDecimals ? 0.01 : 1}
      min={minValue}
      max={maxValue}
    />
  )
}

export function DateField(props: Omit<FormFieldProps, 'type' | 'min' | 'max'>) {
  return <FormField {...props} type='date' />
}

interface UrlFieldProps extends Omit<FormFieldProps, 'type'> {
  showProtocol?: boolean
}

export function UrlField({
  showProtocol = false,
  placeholder,
  ...props
}: UrlFieldProps) {
  const defaultPlaceholder = showProtocol
    ? 'https://example.com'
    : 'example.com'

  return (
    <FormField
      {...props}
      type='url'
      placeholder={placeholder || defaultPlaceholder}
    />
  )
}
