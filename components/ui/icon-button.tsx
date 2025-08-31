import * as React from "react"
import { cn } from "@/lib/utils"
import { Button, ButtonProps } from "./button"

export interface IconButtonProps extends Omit<ButtonProps, 'size'> {
  icon: React.ReactNode
  size?: 'sm' | 'md' | 'lg'
  variant?: ButtonProps['variant']
  className?: string
  onClick?: () => void
  disabled?: boolean
  loading?: boolean
  title?: string
}

const IconButton = React.forwardRef<HTMLButtonElement, IconButtonProps>(
  ({ 
    icon, 
    size = 'md', 
    variant = 'ghost',
    className,
    onClick,
    disabled,
    loading,
    title,
    ...props 
  }, ref) => {
    const sizeClasses = {
      sm: 'h-8 w-8',
      md: 'h-9 w-9',
      lg: 'h-10 w-10',
    }

    return (
      <Button
        ref={ref}
        variant={variant}
        size="icon"
        className={cn(sizeClasses[size], className)}
        onClick={onClick}
        disabled={disabled}
        loading={loading}
        title={title}
        {...props}
      >
        {icon}
      </Button>
    )
  }
)
IconButton.displayName = "IconButton"

export { IconButton }
