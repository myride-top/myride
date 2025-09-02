import React from 'react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Loader2 } from 'lucide-react'

interface FormAction {
  label: string
  onClick?: () => void
  type?: 'button' | 'submit' | 'reset'
  variant?:
    | 'default'
    | 'destructive'
    | 'outline'
    | 'secondary'
    | 'ghost'
    | 'link'
  size?: 'sm' | 'md' | 'lg'
  disabled?: boolean
  loading?: boolean
  icon?: React.ReactNode
  className?: string
}

interface FormActionsProps {
  primaryAction?: FormAction
  secondaryActions?: FormAction[]
  className?: string
  layout?: 'left' | 'right' | 'center' | 'space-between'
  size?: 'sm' | 'md' | 'lg'
  showDivider?: boolean
  loading?: boolean
}

export default function FormActions({
  primaryAction,
  secondaryActions = [],
  className = '',
  layout = 'right',
  size = 'md',
  showDivider = false,
  loading = false,
}: FormActionsProps) {
  const sizeClasses = {
    sm: 'gap-2',
    md: 'gap-3',
    lg: 'gap-4',
  }

  const layoutClasses = {
    left: 'justify-start',
    right: 'justify-end',
    center: 'justify-center',
    'space-between': 'justify-between',
  }

  const renderAction = (action: FormAction, isPrimary: boolean = false) => {
    const {
      label,
      onClick,
      type = 'button',
      variant = isPrimary ? 'default' : 'outline',
      size: actionSize = size,
      disabled = false,
      loading: actionLoading = false,
      icon,
      className: actionClassName = '',
    } = action

    const isDisabled = disabled || loading || actionLoading

    return (
      <Button
        key={label}
        type={type}
        variant={variant}
        size={actionSize === 'md' ? 'default' : actionSize}
        onClick={onClick}
        disabled={isDisabled}
        className={cn(
          'flex items-center gap-2',
          isPrimary && 'min-w-[120px]',
          actionClassName
        )}
      >
        {actionLoading && <Loader2 className='w-4 h-4 animate-spin' />}
        {!actionLoading && icon}
        {label}
      </Button>
    )
  }

  return (
    <div className={cn('space-y-4', className)}>
      {showDivider && <div className='w-full h-px bg-border' />}

      <div
        className={cn(
          'flex items-center',
          sizeClasses[size],
          layoutClasses[layout]
        )}
      >
        {/* Secondary Actions (Left side) */}
        {layout === 'space-between' && secondaryActions.length > 0 && (
          <div className='flex items-center gap-2'>
            {secondaryActions.map(action => renderAction(action, false))}
          </div>
        )}

        {/* All Actions (Right side or center) */}
        <div className={cn('flex items-center', sizeClasses[size])}>
          {/* Secondary Actions (if not space-between layout) */}
          {layout !== 'space-between' &&
            secondaryActions.map(action => renderAction(action, false))}

          {/* Primary Action */}
          {primaryAction && renderAction(primaryAction, true)}
        </div>
      </div>
    </div>
  )
}

// Specialized form actions for common patterns
interface SaveCancelActionsProps {
  onSave: () => void
  onCancel: () => void
  saveLabel?: string
  cancelLabel?: string
  saving?: boolean
  disabled?: boolean
  className?: string
}

export function SaveCancelActions({
  onSave,
  onCancel,
  saveLabel = 'Save',
  cancelLabel = 'Cancel',
  saving = false,
  disabled = false,
  className = '',
}: SaveCancelActionsProps) {
  return (
    <FormActions
      className={className}
      primaryAction={{
        label: saveLabel,
        onClick: onSave,
        type: 'submit',
        loading: saving,
        disabled: disabled,
      }}
      secondaryActions={[
        {
          label: cancelLabel,
          onClick: onCancel,
          variant: 'outline',
        },
      ]}
    />
  )
}

interface CreateUpdateActionsProps {
  mode: 'create' | 'update'
  onSubmit: () => void
  onCancel: () => void
  submitting?: boolean
  disabled?: boolean
  className?: string
}

export function CreateUpdateActions({
  mode,
  onSubmit,
  onCancel,
  submitting = false,
  disabled = false,
  className = '',
}: CreateUpdateActionsProps) {
  return (
    <FormActions
      className={className}
      primaryAction={{
        label: mode === 'create' ? 'Create' : 'Update',
        onClick: onSubmit,
        type: 'submit',
        loading: submitting,
        disabled: disabled,
      }}
      secondaryActions={[
        {
          label: 'Cancel',
          onClick: onCancel,
          variant: 'outline',
        },
      ]}
    />
  )
}

interface DeleteActionsProps {
  onDelete: () => void
  onCancel: () => void
  deleteLabel?: string
  cancelLabel?: string
  deleting?: boolean
  className?: string
}

export function DeleteActions({
  onDelete,
  onCancel,
  deleteLabel = 'Delete',
  cancelLabel = 'Cancel',
  deleting = false,
  className = '',
}: DeleteActionsProps) {
  return (
    <FormActions
      className={className}
      primaryAction={{
        label: deleteLabel,
        onClick: onDelete,
        variant: 'destructive',
        loading: deleting,
      }}
      secondaryActions={[
        {
          label: cancelLabel,
          onClick: onCancel,
          variant: 'outline',
        },
      ]}
    />
  )
}
