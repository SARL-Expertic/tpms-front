'use client'

import { FaChevronRight } from 'react-icons/fa'
import { useSidebar } from '@/providers/SidebarContext'
import { cn } from '@/lib/utils' // Optional if using classnames

export default function SidebarToggle() {
  const { collapsed, toggleCollapsed } = useSidebar()
  return (

    <div
  onClick={toggleCollapsed}
      className={cn(
        'absolute -right-4 top-6 z-50 cursor-pointer rounded-full bg-white shadow-md p-2 transition-all duration-300',
        collapsed ? 'rotate-180' : ''
      )}
    >
      <FaChevronRight className="text-gray-600" />
    </div>
  )
}
