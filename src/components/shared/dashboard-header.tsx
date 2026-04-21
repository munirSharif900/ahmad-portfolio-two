"use client";

import { usePathname } from "next/navigation";
import NotificationsDropdown from "./NotificationsDropdown";
import ProfileDropdown from "./ProfileDropdown";
import ThemeToggle from "./ThemeToggle";
import { useUserStore } from "@/src/store/useUserStore";
import useAuth from "@/src/api/hooks/useAuth";

const titles: Record<string, string> = {
  "/admin/dashboard": "Dashboard",
  "/admin/roles": "Manage Roles",
  "/admin/projects": "Projects",
  "/admin/testimonials": "Testimonials",
  "/admin/contact-queries": "Contact Queries",
  "/admin/notifications": "Notifications",
};

interface DashboardHeaderProps {
  onMenuClick?: () => void;
}

export default function DashboardHeader({ onMenuClick }: DashboardHeaderProps) {
  const pathname = usePathname();
  const title = titles[pathname] ?? "Admin";
  const user = useUserStore((state) => state.user)
  const clearUser = useUserStore((state) => state.clearUser)
  const { logoutUser } = useAuth()

  return (
    <header className="h-16 bg-white dark:bg-gray-950 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between px-6 sticky top-0 z-30 transition-colors duration-300">
      <div className="flex items-center gap-4">
        {/* Mobile menu button */}
        <button
          onClick={onMenuClick}
          className="lg:hidden text-gray-500 dark:text-gray-400 hover:text-violet-400 transition-colors"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        <div>
          <h1 className="text-lg font-semibold text-gray-900 dark:text-white">{title}</h1>
          <p className="text-xs text-gray-500">Welcome back, {user?.name || 'Muhammad Ahmad'}</p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <ThemeToggle />
        <NotificationsDropdown />
        <ProfileDropdown logout={logoutUser} user={user} clearUser={clearUser} />
      </div>
    </header>
  );
}
