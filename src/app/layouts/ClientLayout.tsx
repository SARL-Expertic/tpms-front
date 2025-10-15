'use client'

import { useSidebar } from '@/providers/SidebarContext'
import Sidebar from './SideBar/Sidebar'
import Topbar from './Header/topbar'
export default function MainLayout({ children }: { children: React.ReactNode }) {
  const { collapsed } = useSidebar()

  return (
    <div className="flex">
      <Sidebar />
  <main
        className={`transition-all duration-300 w-full p-2 sm:p-3 md:p-4 lg:p-5 xl:p-6 ${
          collapsed 
            ? "ml-16 sm:ml-18 md:ml-20 lg:ml-22 xl:ml-24"  // Match responsive collapsed widths
            : "ml-56 sm:ml-60 md:ml-64 lg:ml-68 xl:ml-72"   // Match responsive expanded widths
        } [@media(max-width:1024px)_and_(min-width:768px)]:${collapsed ? 'ml-16' : 'ml-56'}`}
        style={{
          marginLeft: collapsed ? 'clamp(4rem, 4vw, 6rem)' : 'clamp(14rem, 20vw, 18rem)',
          minHeight: '100vh'
        }}
      >
        
        <Topbar />

        {children}
      </main>
    </div>
  )
}
