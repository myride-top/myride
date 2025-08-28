import { cn } from '@/lib/utils'

interface FormFieldProps {
  label: string
  name: string
  type?: 'text' | 'number' | 'email' | 'password' | 'textarea'
  value: string | number
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void
  placeholder?: string
  required?: boolean
  min?: number
  max?: number
  step?: number
  rows?: number
  className?: string
  labelClassName?: string
  inputClassName?: string
  disabled?: boolean
  error?: string
  helperText?: string
}

export default function FormField({
  label,
  name,
  type = 'text',
  value,
  onChange,
  placeholder,
  required = false,
  min,
  max,
  step,
  rows = 4,
  className,
  labelClassName,
  inputClassName,
  disabled = false,
  error,
  helperText,
}: FormFieldProps) {
  const baseInputClasses = 'mt-1 block w-full px-3 py-2 border border-input rounded-md shadow-sm focus:outline-none focus:ring-ring focus:border-ring bg-background text-foreground'
  const errorInputClasses = 'border-red-500 focus:border-red-500 focus:ring-red-500'
  const disabledInputClasses = 'opacity-50 cursor-not-allowed'

  const inputClasses = cn(
    baseInputClasses,
    error && errorInputClasses,
    disabled && disabledInputClasses,
    inputClassName
  )

  return (
    <div className={className}>
      <label
        htmlFor={name}
        className={cn(
          'block text-sm font-medium text-foreground',
          labelClassName
        )}
      >
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      
      {type === 'textarea' ? (
        <textarea
          id={name}
          name={name}
          value={value}
          onChange={onChange}
          rows={rows}
          className={inputClasses}
          placeholder={placeholder}
          required={required}
          disabled={disabled}
        />
      ) : (
        <input
          type={type}
          id={name}
          name={name}
          value={value}
          onChange={onChange}
          className={inputClasses}
          placeholder={placeholder}
          required={required}
          min={min}
          max={max}
          step={step}
          disabled={disabled}
        />
      )}
      
      {helperText && (
        <p className="mt-1 text-xs text-muted-foreground">
          {helperText}
        </p>
      )}
      
      {error && (
        <p className="mt-1 text-sm text-red-600">
          {error}
        </p>
      )}
    </div>
  )
}
