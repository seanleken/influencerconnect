"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Megaphone,
  Users,
  MessageSquare,
  Bell,
  CreditCard,
  Settings,
  LogOut,
  ClipboardList,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { AvatarWithFallback } from "@/components/shared/AvatarWithFallback";
import { logout } from "@/actions/auth";
import type { UserRole } from "@prisma/client";

interface SidebarProps {
  user: {
    id: string;
    name: string;
    email: string;
    image?: string | null;
    role: UserRole;
  };
  unreadCount?: number;
}

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard, roles: ["INFLUENCER", "COMPANY", "ADMIN"] },
  { href: "/campaigns", label: "Campaigns", icon: Megaphone, roles: ["INFLUENCER", "COMPANY", "ADMIN"] },
  { href: "/influencers", label: "Influencers", icon: Users, roles: ["COMPANY", "ADMIN"] },
  { href: "/applications", label: "My Applications", icon: ClipboardList, roles: ["INFLUENCER"] },
  { href: "/messages", label: "Messages", icon: MessageSquare, roles: ["INFLUENCER", "COMPANY", "ADMIN"] },
  { href: "/payments", label: "Payments", icon: CreditCard, roles: ["INFLUENCER", "COMPANY", "ADMIN"] },
  { href: "/notifications", label: "Notifications", icon: Bell, roles: ["INFLUENCER", "COMPANY", "ADMIN"] },
];

export function Sidebar({ user, unreadCount = 0 }: SidebarProps) {
  const pathname = usePathname();

  const visibleItems = navItems.filter((item) =>
    item.roles.includes(user.role)
  );

  return (
    <aside className="w-64 h-screen bg-white border-r border-gray-200 flex flex-col fixed left-0 top-0 z-40">
      {/* Logo */}
      <div className="p-6 border-b border-gray-200">
        <Link href="/dashboard" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-brand-600 rounded-lg flex items-center justify-center">
            <Users className="w-4 h-4 text-white" />
          </div>
          <span className="font-heading text-h4 text-gray-950">InfluencerConnect</span>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {visibleItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
          const showBadge = item.href === "/notifications" && unreadCount > 0;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-md text-body transition-colors duration-150",
                isActive
                  ? "bg-brand-100 text-brand-600 font-medium"
                  : "text-gray-600 hover:bg-gray-100 hover:text-gray-800"
              )}
            >
              <Icon className="w-5 h-5 shrink-0" />
              <span className="flex-1">{item.label}</span>
              {showBadge && (
                <span className="bg-brand-600 text-white text-caption font-medium rounded-full w-5 h-5 flex items-center justify-center">
                  {unreadCount > 99 ? "99+" : unreadCount}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* User section */}
      <div className="p-4 border-t border-gray-200 space-y-2">
        <Link
          href="/profile"
          className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-gray-100 transition-colors duration-150"
        >
          <AvatarWithFallback src={user.image} name={user.name} size="sm" />
          <div className="flex-1 min-w-0">
            <p className="text-body-sm font-medium text-gray-800 truncate">{user.name}</p>
            <p className="text-caption text-gray-500 capitalize">{user.role.toLowerCase()}</p>
          </div>
        </Link>
        <Link
          href="/profile/settings"
          className="flex items-center gap-3 px-3 py-2 rounded-md text-gray-600 hover:bg-gray-100 hover:text-gray-800 transition-colors duration-150 text-body"
        >
          <Settings className="w-5 h-5 shrink-0" />
          <span>Settings</span>
        </Link>
        <form action={logout}>
          <button
            type="submit"
            className="w-full flex items-center gap-3 px-3 py-2 rounded-md text-gray-600 hover:bg-gray-100 hover:text-gray-800 transition-colors duration-150 text-body"
          >
            <LogOut className="w-5 h-5 shrink-0" />
            <span>Sign out</span>
          </button>
        </form>
      </div>
    </aside>
  );
}
