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
      className={`fixed flex justify-between shadow-xl top-0 left-0 h-full transition-all duration-300 ${
        collapsed ? "w-24" : "w-72"
      } bg-white rounded-r-3xl p-6 flex-col gap-6 text-black min-h-[90vh]`}
    >
      <SidebarToggle />

      <div className="flex flex-col gap-6 mt-6">
        <h1 className="text-3xl px-2 font-bold flex gap-2 items-center">
          <img alt="logo" src="/photos/logo_vs/logo.svg" className="h-8" />
          <span
            className={`overflow-hidden transition-all duration-300 ${
              collapsed ? "opacity-0 w-0" : "opacity-100 w-auto"
            }`}
          >
            EXPERTIC
          </span>
        </h1>

        <nav className="flex flex-col gap-3">
          {navItems.map(({ icon, label, href }) => (
            <SidebarItem key={label} icon={icon} label={label} href={href} />
          ))}
        </nav>

        <hr className="my-4 border-slate-200" />

        <div className="flex flex-col gap-2">
          <SidebarItem  icon={FiSettings} label="Paramètres" href="/settings" />
        </div>
      </div>

      <div>
        <hr className="my-4 border-slate-200" />
        <ProfileAvatar />
      </div>
    </div>
  );
}
