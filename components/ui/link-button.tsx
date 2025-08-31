import * as React from "react"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { Button, ButtonProps } from "./button"

export interface LinkButtonProps extends Omit<ButtonProps, 'asChild'> {
  href: string
  external?: boolean
  children: React.ReactNode
  className?: string
}

const LinkButton = React.forwardRef<HTMLAnchorElement, LinkButtonProps>(
  ({ 
    href, 
    external = false, 
    children, 
    className,
    variant = 'default',
    size = 'default',
    rounded,
    ...props 
  }, ref) => {
    if (external) {
      return (
        <a
          ref={ref}
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className={cn(className)}
          {...props}
        >
          <Button
            variant={variant}
            size={size}
            rounded={rounded}
            asChild
            {...props}
          >
            {children}
          </Button>
        </a>
      )
    }

    return (
      <Button
        ref={ref}
        variant={variant}
        size={size}
        rounded={rounded}
        asChild
        className={className}
        {...props}
      >
        <Link href={href}>
          {children}
        </Link>
      </Button>
    )
  }
)
LinkButton.displayName = "LinkButton"

export { LinkButton }
