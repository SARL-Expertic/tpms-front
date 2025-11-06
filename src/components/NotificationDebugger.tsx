"use client"

import React from 'react'
import { useNotificationContext } from '@/providers/NotificationProvider'
import { useAuth } from '@/app/hooks/useAuth'
import Cookies from 'js-cookie'

export function NotificationDebugger() {
  const { isConnected, notifications } = useNotificationContext()
  const { user } = useAuth()
  const token = Cookies.get('access_token') || Cookies.get('token') || Cookies.get('accessToken') || Cookies.get('jwt')

  const testNotification = () => {
    // Create a fake notification for testing
    console.log('🧪 Creating test notification...')
    const testData = {
      type: 'ticket',
      event: 'created' as const,
      data: { id: 123, type: 'INTERVENTION' },
      timestamp: new Date().toISOString(),
      message: 'Test notification from debugger'
    }
    
    // Manually trigger the notification
    window.dispatchEvent(new CustomEvent('test-notification', { detail: testData }))
  }

  return (
    <div className="fixed bottom-4 left-4 bg-white border border-gray-300 rounded-lg p-4 shadow-lg z-50 max-w-sm">
      <h3 className="font-bold text-sm mb-2">🔧 Notification Debug</h3>
      
      <div className="text-xs space-y-1">
        <div>
          <strong>Connection:</strong> 
          <span className={isConnected ? 'text-green-600' : 'text-red-600'}>
            {isConnected ? ' ✅ Connected' : ' ❌ Disconnected'}
          </span>
        </div>
        
        <div>
          <strong>User:</strong> {user ? '✅ Logged in' : '❌ Not logged in'}
        </div>
        
        <div>
          <strong>Token:</strong> {token ? '✅ Found' : '❌ Missing'}
        </div>
        
        <div>
          <strong>Notifications:</strong> {notifications.length} received
        </div>
        
        <div>
          <strong>Cookies:</strong> {document.cookie ? '✅ Present' : '❌ None'}
        </div>
      </div>

      <div className="mt-3 space-y-1">
        <button 
          onClick={testNotification}
          className="bg-blue-500 text-white px-2 py-1 rounded text-xs w-full"
        >
          Test Notification
        </button>
        
        <button 
          onClick={() => (window as any).testNotifications?.()}
          className="bg-green-500 text-white px-2 py-1 rounded text-xs w-full"
        >
          Test Connection
        </button>
        
        <button 
          onClick={() => console.clear()}
          className="bg-gray-500 text-white px-2 py-1 rounded text-xs w-full"
        >
          Clear Console
        </button>
      </div>

      {notifications.length > 0 && (
        <div className="mt-2 text-xs">
          <strong>Latest:</strong> {notifications[0]?.message.substring(0, 30)}...
        </div>
      )}
    </div>
  )
}