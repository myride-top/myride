import { StatusMessage } from '@/components/common/status-message'
import { type StatusMessageProps } from '@/components/common/status-message'

type ErrorStateProps = Omit<StatusMessageProps, 'type'> & {
  message: string
}

export const ErrorState = ({
  title = 'Something went wrong',
  message,
  onRetry,
  className = '',
  variant = 'default',
}: ErrorStateProps) => {
  return (
    <StatusMessage
      type='error'
      title={title}
      message={message}
      onRetry={onRetry}
      className={className}
      variant={variant}
    />
  )
}
