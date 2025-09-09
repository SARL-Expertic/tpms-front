'use client'

import { useState, useRef, useEffect } from 'react'
import { FaBell, FaCheckCircle, FaInfoCircle } from "react-icons/fa"

export default function NotificationToggle() {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

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

  const notifications = [
    {
      icon: <FaInfoCircle className="text-blue-500" />,
      title: "Nouvelle intervention",
      message: "Une nouvelle intervention a été créée"
    },
    {
      icon: <FaCheckCircle className="text-green-500" />,
      title: "Intervention terminée",
      message: "L’intervention #245 est validée"
    },
    {
      icon: <FaInfoCircle className="text-blue-500" />,
      title: "Matériel reçu",
      message: "Le matériel pour #201 a été livré"
    }
  ]

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className="w-12 h-12 cursor-pointer hover:scale-110 duration-300 p-0 flex items-center justify-center"
      >
        <FaBell className="w-6 h-6 text-[#1B2559]" />
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
          {notifications.map((notif, i) => (
            <li
              key={i}
              className="flex items-start bg-[#F5F9FF] gap-3 p-3 rounded-lg border border-[#9DC0EE] hover:bg-gray-50 transition-colors"
            >
              <div className="mt-1">{notif.icon}</div>
              <div>
                <p className="text-sm font-semibold">{notif.title}</p>
                <p className="text-xs text-gray-500">{notif.message}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
