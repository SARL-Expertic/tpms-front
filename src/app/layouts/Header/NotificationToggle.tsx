'use client'

import { useState, useRef, useEffect } from 'react'
import { FaBell, FaCheckCircle, FaInfoCircle, FaExclamationTriangle } from "react-icons/fa"
import { STREAM_NOTIFICATION_SERVICE } from '@/app/api/tickets'

type Notification = {
  id: string;
  icon: React.ReactElement;
  title: string;
  message: string;
  timestamp?: string;
}

export default function NotificationToggle() {
  const [open, setOpen] = useState(false)
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const ref = useRef<HTMLDivElement>(null)
  const eventSourceRef = useRef<EventSource | null>(null)

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Helper function to get icon based on notification type
  const getIconForType = (type?: string) => {
    switch (type) {
      case 'success':
      case 'completed':
        return <FaCheckCircle className="text-green-500" />
      case 'warning':
        return <FaExclamationTriangle className="text-yellow-500" />
      case 'error':
        return <FaExclamationTriangle className="text-red-500" />
      case 'info':
      default:
        return <FaInfoCircle className="text-blue-500" />
    }
  }

  // Setup EventSource for streaming notifications
  useEffect(() => {
    const streamURL = STREAM_NOTIFICATION_SERVICE()
    
    // Create EventSource connection
    const eventSource = new EventSource(streamURL, {
      withCredentials: true // Include credentials if needed
    })

    eventSourceRef.current = eventSource

    // Handle incoming messages
    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data)
        
        // Create notification based on type
        const newNotification: Notification = {
          id: data.id || Date.now().toString(),
          icon: getIconForType(data.type),
          title: data.title || 'Nouvelle notification',
          message: data.message || '',
          timestamp: data.timestamp || new Date().toISOString()
        }

        setNotifications(prev => [newNotification, ...prev].slice(0, 50)) // Keep last 50
        setUnreadCount(prev => prev + 1)
      } catch (error) {
        console.error('Error parsing notification:', error)
      }
    }

    // Handle connection open
    eventSource.onopen = () => {
      console.log('✅ Notification stream connected')
    }

    // Handle errors
    eventSource.onerror = (error) => {
      console.error('❌ Notification stream error:', error)
      eventSource.close()
      
      // Attempt to reconnect after 5 seconds
      setTimeout(() => {
        console.log('🔄 Attempting to reconnect notification stream...')
      }, 5000)
    }

    // Cleanup on unmount
    return () => {
      eventSource.close()
      eventSourceRef.current = null
    }
  }, [])

  // Mark notifications as read when dropdown opens
  useEffect(() => {
    if (open) {
      setUnreadCount(0)
    }
  }, [open])

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className="w-12 h-12 cursor-pointer hover:scale-110 duration-300 p-0 flex items-center justify-center relative"
      >
        <FaBell className="w-6 h-6 text-[#1B2559]" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
        <span className="sr-only">Toggle notifications</span>
      </button>

      {/* Animated dropdown */}
      <div
        className={`
          absolute right-0 mt-2 w-80 rounded-xl bg-white shadow-lg border z-50 p-4
          transition-all duration-300 origin-top-right
          ${open ? "opacity-100 scale-100" : "opacity-0 scale-95 pointer-events-none"}
        `}
      >
        <h4 className="text-sm font-semibold mb-3">Notifications</h4>
        <ul className="space-y-3">
          {notifications.length === 0 ? (
            <li className="text-center text-gray-500 text-sm py-4">
              Aucune notification
            </li>
          ) : (
            notifications.map((notif) => (
              <li
                key={notif.id}
                className="flex items-start bg-[#F5F9FF] gap-3 p-3 rounded-lg border border-[#9DC0EE] hover:bg-gray-50 transition-colors"
              >
                <div className="mt-1">{notif.icon}</div>
                <div className="flex-1">
                  <p className="text-sm font-semibold">{notif.title}</p>
                  <p className="text-xs text-gray-500">{notif.message}</p>
                  {notif.timestamp && (
                    <p className="text-xs text-gray-400 mt-1">
                      {new Date(notif.timestamp).toLocaleString('fr-FR')}
                    </p>
                  )}
                </div>
              </li>
            ))
          )}
        </ul>
      </div>
    </div>
  )
}
