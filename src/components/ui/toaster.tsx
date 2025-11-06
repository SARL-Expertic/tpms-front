"use client"

import * as React from "react"
import { Toast, ToastProps } from "@/components/ui/toast"

interface ToastContextType {
  toast: (props: Omit<ToastProps, 'id' | 'onDismiss'>) => void
  dismiss: (id: string) => void
  toasts: ToastProps[]
}

const ToastContext = React.createContext<ToastContextType | undefined>(undefined)

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = React.useState<ToastProps[]>([])

  const toast = React.useCallback((props: Omit<ToastProps, 'id' | 'onDismiss'>) => {
    const id = Math.random().toString(36).substr(2, 9)
    const duration = props.duration ?? 5000

    const newToast: ToastProps = {
      ...props,
      id,
      onDismiss: () => dismiss(id)
    }

    setToasts(current => [...current, newToast])

    // Auto dismiss after duration
    if (duration > 0) {
      setTimeout(() => {
        dismiss(id)
      }, duration)
    }
  }, [])

  const dismiss = React.useCallback((id: string) => {
    setToasts(current => current.filter(toast => toast.id !== id))
  }, [])

  return (
    <ToastContext.Provider value={{ toast, dismiss, toasts }}>
      {children}
      <Toaster toasts={toasts} />
    </ToastContext.Provider>
  )
}

export function useToast() {
  const context = React.useContext(ToastContext)
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider')
  }
  return context
}

function Toaster({ toasts }: { toasts: ToastProps[] }) {
  return (
    <div className="fixed top-0 right-0 z-[100] flex max-h-screen w-full flex-col-reverse p-4 sm:top-4 sm:right-4 sm:flex-col md:max-w-[420px]">
      {toasts.map((toast) => (
        <Toast key={toast.id} {...toast} />
      ))}
    </div>
  )
}