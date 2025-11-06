"use client"

import * as React from "react"
import { X } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

export interface ToastProps {
  id: string
  title?: string
  description?: string
  variant?: 'default' | 'destructive' | 'success' | 'warning'
  duration?: number
  onDismiss?: () => void
}

const Toast = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & ToastProps
>(({ className, variant = 'default', title, description, onDismiss, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn(
        "group pointer-events-auto relative flex w-full items-center justify-between space-x-2 overflow-hidden rounded-md border p-4 pr-6 shadow-lg transition-all",
        {
          'border-border bg-background text-foreground': variant === 'default',
          'border-destructive/50 bg-destructive text-destructive-foreground': variant === 'destructive',
          'border-green-500/50 bg-green-50 text-green-900 dark:bg-green-950 dark:text-green-50': variant === 'success',
          'border-yellow-500/50 bg-yellow-50 text-yellow-900 dark:bg-yellow-950 dark:text-yellow-50': variant === 'warning',
        },
        className
      )}
      {...props}
    >
      <div className="grid gap-1">
        {title && (
          <div className="text-sm font-semibold [&+div]:text-xs">
            {title}
          </div>
        )}
        {description && (
          <div className="text-sm opacity-90">
            {description}
          </div>
        )}
      </div>
      {onDismiss && (
        <Button
          size="sm"
          variant="ghost"
          className="absolute right-1 top-1 h-6 w-6 rounded-md p-0 opacity-70 hover:opacity-100"
          onClick={onDismiss}
        >
          <X className="h-3 w-3" />
        </Button>
      )}
    </div>
  )
})
Toast.displayName = "Toast"

export { Toast }