"use client"

import React, { useState } from 'react'
import { Bell, BellOff } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useNotificationContext } from '@/providers/NotificationProvider'
import { cn } from '@/lib/utils'

export function NotificationBell() {
  const { isConnected, notifications, clearNotifications } = useNotificationContext()
  const [isOpen, setIsOpen] = useState(false)
  
  const unreadCount = notifications.length
  
  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp)
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    })
  }

  const formatDate = (timestamp: string) => {
    const date = new Date(timestamp)
    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const notificationDate = new Date(date.getFullYear(), date.getMonth(), date.getDate())
    
    if (notificationDate.getTime() === today.getTime()) {
      return 'Today'
    } else if (notificationDate.getTime() === today.getTime() - 24 * 60 * 60 * 1000) {
      return 'Yesterday'
    } else {
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric' 
      })
    }
  }

  const getNotificationIcon = (type: string, event: string) => {
    if (type === 'ticket') {
      switch (event) {
        case 'created':
          return '🎫'
        case 'updated':
          return '📝'
        case 'deleted':
          return '🗑️'
        default:
          return '📋'
      }
    }
    
    if (type === 'dead_stock') {
      return '📦'
    }

    return '🔔'
  }

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className={cn(
            "relative h-9 w-9",
            !isConnected && "opacity-50"
          )}
          title={isConnected ? "Notifications" : "Notifications (disconnected)"}
        >
          {isConnected ? (
            <Bell className="h-4 w-4" />
          ) : (
            <BellOff className="h-4 w-4" />
          )}
          
          {unreadCount > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-[10px]"
            >
              {unreadCount > 99 ? '99+' : unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent align="end" className="w-80">
        <div className="p-4 font-semibold border-b">
          <div className="flex items-center justify-between">
            <span>Notifications</span>
            <div className="flex items-center gap-2">
              {!isConnected && (
                <Badge variant="secondary" className="text-xs">
                  Offline
                </Badge>
              )}
              {unreadCount > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 text-xs"
                  onClick={() => clearNotifications()}
                >
                  Clear all
                </Button>
              )}
            </div>
          </div>
        </div>
        
        <DropdownMenuSeparator />
        
        <div className="max-h-96 overflow-y-auto">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <Bell className="h-8 w-8 text-muted-foreground mb-2" />
              <p className="text-sm text-muted-foreground">No notifications</p>
            </div>
          ) : (
            notifications.map((notification) => (
              <DropdownMenuItem
                key={`${notification.timestamp}-${notification.type}`}
                className="flex flex-col items-start p-4 cursor-pointer hover:bg-accent"
              >
                <div className="flex items-start gap-3 w-full">
                  <span className="text-lg flex-shrink-0 mt-0.5">
                    {getNotificationIcon(notification.type, notification.event)}
                  </span>
                  
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground leading-tight">
                      {notification.message}
                    </p>
                    
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-muted-foreground">
                        {formatDate(notification.timestamp)}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {formatTime(notification.timestamp)}
                      </span>
                      
                      <Badge variant="outline" className="text-xs">
                        {notification.type}
                      </Badge>
                    </div>
                  </div>
                </div>
              </DropdownMenuItem>
            ))
          )}
        </div>
        
        {!isConnected && (
          <>
            <DropdownMenuSeparator />
            <div className="p-4 text-center">
              <p className="text-xs text-muted-foreground">
                Connection lost. Notifications will resume when connection is restored.
              </p>
            </div>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}