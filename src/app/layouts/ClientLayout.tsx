'use client'

import { useSidebar } from '@/providers/SidebarContext'
import Sidebar from './SideBar/Sidebar'
import Topbar from './Header/topbar'
export default function MainLayout({ children }: { children: React.ReactNode }) {
  const { collapsed } = useSidebar()

  return (
    <div className="flex">
      <Sidebar />
      <main className={`transition-all duration-300 w-full p-4 ${collapsed ? 'ml-28' : 'ml-74'}`}>
             <Topbar/>

        {children}
      </main>
    </div>
  )
}
