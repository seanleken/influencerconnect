"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, Bell, Users } from "lucide-react";
import { cn } from "@/lib/utils";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Sidebar } from "./Sidebar";
import type { UserRole } from "@prisma/client";

interface MobileNavProps {
  user: {
    id: string;
    name: string;
    email: string;
    image?: string | null;
    role: UserRole;
  };
  unreadCount?: number;
}

export function MobileNav({ user, unreadCount = 0 }: MobileNavProps) {
  const [open, setOpen] = useState(false);

  return (
    <header className="h-14 bg-white border-b border-gray-200 flex items-center justify-between px-4 lg:hidden sticky top-0 z-50">
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <button className="p-2 text-gray-600 hover:text-gray-800">
            <Menu className="w-5 h-5" />
          </button>
        </SheetTrigger>
        <SheetContent side="left" className="p-0 w-64">
          <Sidebar user={user} unreadCount={unreadCount} />
        </SheetContent>
      </Sheet>

      <Link href="/dashboard" className="flex items-center gap-2">
        <div className="w-7 h-7 bg-brand-600 rounded-lg flex items-center justify-center">
          <Users className="w-3.5 h-3.5 text-white" />
        </div>
        <span className="font-heading text-h4 text-gray-950">InfluencerConnect</span>
      </Link>

      <Link href="/notifications" className="relative p-2 text-gray-600 hover:text-gray-800">
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 bg-brand-600 text-white text-[10px] rounded-full w-4 h-4 flex items-center justify-center">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </Link>
    </header>
  );
}
