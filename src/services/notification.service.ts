"use client"

import { useToast } from '@/components/ui/toaster'

export interface NotificationData {
  type: string
  event: 'created' | 'updated' | 'deleted'
  data: any
  timestamp: string
  message: string
}

export class NotificationService {
  private eventSource: EventSource | null = null
  private baseUrl: string
  private token: string | null = null
  private onNotification?: (data: NotificationData) => void
  private onConnectionChange?: (connected: boolean) => void
  private reconnectAttempts = 0
  private maxReconnectAttempts = 5
  private reconnectDelay = 1000

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl
    console.log('🔧 NotificationService initialized with baseUrl:', baseUrl)
  }

  setAuthToken(token: string) {
    this.token = token
    console.log('🔑 Auth token set:', token ? `${token.substring(0, 10)}...` : 'null')
  }

  setCallbacks(
    onNotification?: (data: NotificationData) => void,
    onConnectionChange?: (connected: boolean) => void
  ) {
    this.onNotification = onNotification
    this.onConnectionChange = onConnectionChange
    console.log('📞 Callbacks set - onNotification:', !!onNotification, 'onConnectionChange:', !!onConnectionChange)
  }

  connect() {
    console.log('🚀 Attempting to connect to SSE...')
    
    if (this.eventSource) {
      console.log('📡 Existing connection found, disconnecting first...')
      this.disconnect()
    }

    if (!this.token) {
      console.warn('⚠️ No auth token available for SSE connection')
      return
    }

    try {
      // Create EventSource with auth header using URL approach since EventSource doesn't support custom headers
      const url = "http://localhost:8000/notifications/stream"
      console.log('🌐 Connecting to SSE URL:', url)
      console.log('🍪 Using credentials:', true)
      
      this.eventSource = new EventSource(url, {
        withCredentials: true // This will send cookies including auth token
      })

      console.log('📡 EventSource created, readyState:', this.eventSource.readyState)

      this.eventSource.onopen = () => {
        console.log('✅ SSE connection opened successfully!')
        console.log('📡 Connection readyState:', this.eventSource?.readyState)
        this.reconnectAttempts = 0
        this.onConnectionChange?.(true)
      }

      this.eventSource.onmessage = (event) => {
        console.log('📨 Raw SSE message received:', event)
        console.log('📨 Event data:', event.data)
        console.log('📨 Event type:', event.type)
        console.log('📨 Event lastEventId:', event.lastEventId)
        
        try {
          const data: NotificationData = JSON.parse(event.data)
          console.log('✨ Parsed notification data:', data)
          console.log('🎯 Calling onNotification callback...')
          this.onNotification?.(data)
        } catch (error) {
          console.error('❌ Error parsing notification data:', error)
          console.error('❌ Raw data was:', event.data)
        }
      }

      this.eventSource.onerror = (error) => {
        console.error('❌ SSE connection error:', error)
        console.error('📡 Connection readyState:', this.eventSource?.readyState)
        console.error('📡 ReadyState meanings: 0=CONNECTING, 1=OPEN, 2=CLOSED')
        this.onConnectionChange?.(false)
        
        if (this.eventSource?.readyState === EventSource.CLOSED) {
          console.log('🔄 Connection closed, attempting reconnect...')
          this.handleReconnect()
        }
      }

    } catch (error) {
      console.error('❌ Error creating SSE connection:', error)
      console.error('❌ Error details:', error)
      this.onConnectionChange?.(false)
    }
  }

  private handleReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++
      console.log(`🔄 Attempting to reconnect... (${this.reconnectAttempts}/${this.maxReconnectAttempts})`)
      
      setTimeout(() => {
        console.log(`⏰ Reconnect timeout fired, calling connect()...`)
        this.connect()
      }, this.reconnectDelay * this.reconnectAttempts)
    } else {
      console.error('❌ Max reconnection attempts reached')
    }
  }

  disconnect() {
    console.log('🔌 Disconnecting SSE...')
    if (this.eventSource) {
      console.log('📡 Closing existing EventSource, current state:', this.eventSource.readyState)
      this.eventSource.close()
      this.eventSource = null
      console.log('📡 EventSource closed and nullified')
    }
    this.onConnectionChange?.(false)
  }

  isConnected(): boolean {
    const connected = this.eventSource?.readyState === EventSource.OPEN
    console.log('🔍 Connection status check - connected:', connected, 'readyState:', this.eventSource?.readyState)
    return connected
  }
}

// Hook for using notifications in React components
export function useNotifications() {
  console.log('🎣 useNotifications hook called')
  const { toast } = useToast()
  
  const showNotification = (data: NotificationData) => {
    console.log('🍞 showNotification called with data:', data)
    const variant = getNotificationVariant(data.type, data.event)
    const title = getNotificationTitle(data.type, data.event)
    
    console.log('🍞 Toast params - title:', title, 'variant:', variant, 'message:', data.message)
    
    toast({
      title,
      description: data.message,
      variant,
      duration: 6000, // 6 seconds
    })
    
    console.log('🍞 Toast called successfully')
  }

  return { showNotification }
}

function getNotificationVariant(type: string, event: string): 'default' | 'success' | 'warning' | 'destructive' {
  if (type === 'ticket') {
    switch (event) {
      case 'created':
        return 'success'
      case 'updated':
        return 'default'
      case 'deleted':
        return 'warning'
      default:
        return 'default'
    }
  }
  
  if (type === 'dead_stock') {
    return 'warning'
  }

  return 'default'
}

function getNotificationTitle(type: string, event: string): string {
  if (type === 'ticket') {
    switch (event) {
      case 'created':
        return 'New Ticket Created'
      case 'updated':
        return 'Ticket Updated'
      case 'deleted':
        return 'Ticket Deleted'
      default:
        return 'Ticket Notification'
    }
  }
  
  if (type === 'dead_stock') {
    return 'Dead Stock Update'
  }

  return 'Notification'
}