"use client";

import { getNavItems } from "@/constants/sidebar";
import SidebarItem from "./SidebarItem";
import { FiSettings } from "react-icons/fi";
import { MdHelpOutline } from "react-icons/md";
import ProfileAvatar from "./ProfileAvatar";
import { useSidebar } from "@/providers/SidebarContext";
import SidebarToggle from "./SidebarToggle";
import { useAuth } from "@/providers/AuthContext";

export default function Sidebar() {
  const { collapsed } = useSidebar();
  const { user } = useAuth(); // ✅ get user from context
  const role_current = user?.role || "Client"; // ✅ fallback if no user yet

  const navItems = getNavItems(role_current);

  return (
      <div
      className={`fixed flex justify-between shadow-xl top-0 left-0 h-full transition-all duration-300 ${collapsed
          ? "w-16 sm:w-18 md:w-20 lg:w-22 xl:w-24"  // Responsive collapsed widths
          : "w-56 sm:w-60 md:w-64 lg:w-68 xl:w-72"   // Responsive expanded widths
        } bg-white rounded-r-3xl p-2 sm:p-3 md:p-4 lg:p-5 xl:p-6 flex-col gap-2 sm:gap-3 md:gap-4 lg:gap-5 xl:gap-6 text-black min-h-screen z-50 
        [@media(max-width:1024px)_and_(min-width:768px)]:w-56 
        [@media(max-width:1024px)_and_(min-width:768px)]:${collapsed ? 'w-16' : 'w-56'}`}
      style={{
        minWidth: collapsed ? '4rem' : '14rem',
        maxWidth: collapsed ? '6rem' : '18rem'
      }}
    >
      <SidebarToggle />

      <div className="flex flex-col gap-3 sm:gap-4 md:gap-5 lg:gap-6 mt-4 sm:mt-5 md:mt-6">
        <h1 className="text-lg sm:text-xl md:text-2xl lg:text-3xl px-1 sm:px-2 font-bold flex gap-1 sm:gap-2 items-center">
          <img alt="logo" src="/photos/logo_vs/logo.svg" className="h-6 sm:h-7 md:h-8 lg:h-9 xl:h-10" />
          <span
            className={`overflow-hidden transition-all duration-300 ${
              collapsed ? "opacity-0 w-0" : "opacity-100 w-auto"
            }`}
          >
            EXPERTIC
          </span>
        </h1>

        <nav className="flex flex-col gap-1 sm:gap-2 md:gap-3">
          {navItems.map(({ icon, label, href }) => (
            <SidebarItem key={label} icon={icon} label={label} href={href} />
          ))}
        </nav>

        <hr className="my-2 sm:my-3 md:my-4 border-slate-200" />

        <div className="flex flex-col gap-1 sm:gap-2">
          <SidebarItem  icon={FiSettings} label="Paramètres" href="/settings" />
        </div>
      </div>

      <div>
        <hr className="my-2 sm:my-3 md:my-4 border-slate-200" />
        <ProfileAvatar />
      </div>
    </div>
  );
}
