"use client"

import React, { createContext, useContext, useEffect, useState } from 'react'
import { NotificationService, NotificationData, useNotifications } from '@/services/notification.service'
import { useAuth } from '@/app/hooks/useAuth'
import Cookies from 'js-cookie'

interface NotificationContextType {
  isConnected: boolean
  connect: () => void
  disconnect: () => void
  notifications: NotificationData[]
  clearNotifications: () => void
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined)

interface NotificationProviderProps {
  children: React.ReactNode
  baseUrl?: string
}

export function NotificationProvider({ 
  children, 
  baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000' 
}: NotificationProviderProps) {
  const [isConnected, setIsConnected] = useState(false)
  const [notifications, setNotifications] = useState<NotificationData[]>([])
  const [notificationService] = useState(() => new NotificationService(baseUrl))
  const { showNotification } = useNotifications()
  const { user } = useAuth()
  
  // Get token from cookies since your backend uses cookie auth
  const token = Cookies.get('token')
  
  // Debug all cookies
  console.log('🍪 All cookies:', document.cookie)
  console.log('🍪 Available cookie names:', Object.keys(Cookies.get()))
  
  console.log('🔐 NotificationProvider - User:', user?.email || user?.id || 'Not logged in')
  console.log('🍪 NotificationProvider - Token found:', !!token, 'Length:', token?.length || 0)
  console.log('🌐 NotificationProvider - Base URL:', baseUrl)

  // Handle incoming notifications
  const handleNotification = (data: NotificationData) => {
    console.log('🔔 NotificationProvider received notification:', data)
    // Add to notifications list
    setNotifications(prev => [data, ...prev.slice(0, 49)]) // Keep last 50 notifications
    console.log('📝 Notification added to list')
    
    // Show toast notification
    console.log('🍞 Calling showNotification...')
    showNotification(data)
  }

  // Handle connection status changes
  const handleConnectionChange = (connected: boolean) => {
    console.log('🔗 Connection status changed to:', connected)
    setIsConnected(connected)
  }

  // Initialize service callbacks
  useEffect(() => {
    console.log('⚙️ Setting up NotificationService callbacks...')
    notificationService.setCallbacks(handleNotification, handleConnectionChange)
  }, [notificationService])

  // Connect when user is authenticated
  useEffect(() => {
    console.log('🔄 Auth state changed - User:', !!user, 'Token:', !!token)
    
      console.log('✅ User authenticated, connecting to notifications...')
      notificationService.setAuthToken("eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MjgsIm5hbWUiOiJNYXJ5YW0gIiwicm9sZSI6IkFDQ09VTlRfTUFOQUdFUiIsImlhdCI6MTc2MjQxMDYwNSwiZXhwIjoxNzYyNDk3MDA1fQ.pVOrldnqOg7p2Xn590FbggLIng1AuBYjOmkX1dO7eOE")
      notificationService.connect()

    // Cleanup on unmount
    return () => {
      console.log('🧹 NotificationProvider cleanup...')
      notificationService.disconnect()
    }
  }, [user, token, notificationService])

  const connect = () => {
    if (token) {
      notificationService.setAuthToken("eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MjgsIm5hbWUiOiJNYXJ5YW0gIiwicm9sZSI6IkFDQ09VTlRfTUFOQUdFUiIsImlhdCI6MTc2MjQxMDYwNSwiZXhwIjoxNzYyNDk3MDA1fQ.pVOrldnqOg7p2Xn590FbggLIng1AuBYjOmkX1dO7eOE")
      notificationService.connect()
    }
  }

  const disconnect = () => {
    notificationService.disconnect()
  }

  const clearNotifications = () => {
    setNotifications([])
  }

  return (
    <NotificationContext.Provider
      value={{
        isConnected,
        connect,
        disconnect,
        notifications,
        clearNotifications,
      }}
    >
      {children}
    </NotificationContext.Provider>
  )
}

export function useNotificationContext() {
  const context = useContext(NotificationContext)
  if (!context) {
    throw new Error('useNotificationContext must be used within a NotificationProvider')
  }
  return context
}