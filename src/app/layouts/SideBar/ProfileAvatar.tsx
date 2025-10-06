"use client"

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { FaChevronRight } from "react-icons/fa6"

import { useSidebar } from "@/providers/SidebarContext"
import { useRouter } from "next/navigation"
import { useAuth } from "@/providers/AuthContext"
// import { apiPost } from "@/lib/services/api"
import Cookies from "js-cookie";

export default function ProfileAvatar() {
  const { user , setUser } = useAuth(); // ✅ using context user
  const { collapsed } = useSidebar()
  const router = useRouter()


  const handleLogout = () => {
    try {
      // Remove token cookie
      Cookies.remove("token", { path: "/" });
  
      // Clear stored user
      localStorage.removeItem("user");
      setUser(null);
  
      // Redirect to login
      router.push("/auth/login");
    } catch (err) {
      console.error("Error logging out:", err);
    }
  };
  

  // ✅ Fallbacks if user is null
  var name = user?.name ?? "";

  const avatar = "" // optionally set to user.avatar if available
  const initials = name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <div className="flex justify-between items-center gap-3 cursor-pointer">
          <div className="flex items-center">
            <Avatar className="h-12 w-12 border-2 border-white shadow-lg">
              <AvatarImage src={avatar} alt="Profile Picture" className="object-cover" />
              <AvatarFallback>{initials}</AvatarFallback>
            </Avatar>

            <div
              className={`
                overflow-hidden transition-all duration-300 ease-in-out
                ${collapsed ? "max-w-0 opacity-0 scale-95" : "max-w-[200px] opacity-100 scale-100 ml-2"}
              `}
              style={{ transitionProperty: "max-width, opacity, transform" }}
            >
              <p className="text-xs text-muted-foreground">Welcome back 👋</p>
              <p className="font-semibold text-sm text-foreground">{name}</p>
            </div>
          </div>

          <FaChevronRight
            size={18}
            className={`text-muted-foreground transition-transform duration-300 ${
              collapsed ? "rotate-180" : ""
            }`}
          />
        </div>
      </DropdownMenuTrigger>

      <DropdownMenuContent side="left" align="end" className="w-48 mt-2">
        <DropdownMenuLabel>My Account</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => router.push("/settings")}>Profile</DropdownMenuItem>
        <DropdownMenuItem onClick={() => router.push("/settings")}  >Settings</DropdownMenuItem>
        <DropdownMenuItem
          onClick={handleLogout}
          className="text-red-500 font-bold hover:text-red-500"
        >
          Logout
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
