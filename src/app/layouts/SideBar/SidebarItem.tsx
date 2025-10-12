'use client'

import { useSidebar } from '@/providers/SidebarContext'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { IconType } from 'react-icons'

interface SidebarItemProps {
    icon: IconType
    label: string
    href: string
}

export default function SidebarItem({ icon: Icon, label, href }: SidebarItemProps) {
    const { collapsed } = useSidebar()
    const pathname = usePathname()
    const isActive = pathname === href

    return (
        <Link
            href={href}
            className={`group flex items-center gap-2 sm:gap-3 md:gap-4 px-1 py-1.5 sm:py-2 transition-all duration-300 
                ${collapsed ? 'rounded-2xl sm:rounded-3xl md:rounded-4xl' : 'rounded-2xl sm:rounded-3xl'}
                ${isActive ? 'bg-[#EEF2FF] text-blue-500 font-semibold' : 'text-[#64748B] font-medium hover:text-black'}
                hover:bg-[#EEF2FF]`}
        >
            <div
                className={`p-1.5 sm:p-2 rounded-lg transition-colors duration-300
                ${isActive ? 'text-blue-500' : 'text-[#64748B]'}`}
            >
                <Icon size={16} className="sm:w-5 sm:h-5 md:w-5 md:h-5 lg:w-6 lg:h-6" />
            </div>
            <span
                className={`
                    text-sm sm:text-base transition-all duration-300 overflow-hidden whitespace-nowrap
                    ${collapsed ? 'opacity-0 w-0 scale-95' : 'opacity-100 w-auto scale-100 translate-x-0 group-hover:translate-x-1'}
                `}
            >
                {label}
            </span>
        </Link>
    )
}
