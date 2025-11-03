import { StatusMessage } from '@/components/common/status-message'
import { type StatusMessageProps } from '@/components/common/status-message'

type LoadingStateProps = Omit<StatusMessageProps, 'type' | 'message'> & {
  message?: string
}

export const LoadingState = ({
  message = 'Loading...',
  className = '',
  size = 'md',
  variant = 'default',
}: LoadingStateProps) => {
  return (
    <StatusMessage
      type='loading'
      message={message}
      className={className}
      size={size}
      variant={variant}
    />
  )
}
