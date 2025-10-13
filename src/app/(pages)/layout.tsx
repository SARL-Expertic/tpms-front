import { SidebarProvider } from "@/providers/SidebarContext"

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        
        <SidebarProvider>
          <div className="w-full h-full p-4 ">
            {children}
            </div>
          </SidebarProvider>
       
        
      </body>
    </html>
  )
}
