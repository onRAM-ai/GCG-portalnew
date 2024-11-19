"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Calendar,
  Clock,
  LogOut,
  Settings,
  User,
  MapPin,
  Crown,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { signOut } from "@/lib/auth";

const mainNavItems = [
  {
    title: "Overview",
    href: "/dashboard",
    icon: Crown,
  },
  {
    title: "Availability",
    href: "/dashboard/availability",
    icon: Clock,
  },
  {
    title: "Bookings",
    href: "/dashboard/bookings",
    icon: Calendar,
  },
  {
    title: "Venues",
    href: "/dashboard/venues",
    icon: MapPin,
  },
  {
    title: "Profile",
    href: "/dashboard/profile",
    icon: User,
  },
  {
    title: "Settings",
    href: "/dashboard/settings",
    icon: Settings,
  },
];

export function DashboardSidebar() {
  const pathname = usePathname();

  return (
    <div className="fixed inset-y-0 left-0 w-64 bg-background/50 backdrop-blur-xl border-r border-primary/10">
      <div className="flex flex-col h-full">
        <div className="p-6">
          <Link href="/dashboard" className="flex items-center">
            <Crown className="h-6 w-6 text-primary" />
            <span className="ml-3 text-xl font-semibold">Dashboard</span>
          </Link>
        </div>

        <ScrollArea className="flex-1 px-4">
          <nav className="space-y-1">
            {mainNavItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors",
                  pathname === item.href
                    ? "bg-primary/20 text-primary"
                    : "hover:bg-primary/10 hover:text-primary"
                )}
              >
                <item.icon className="h-5 w-5 mr-3" />
                {item.title}
              </Link>
            ))}
          </nav>
        </ScrollArea>

        <div className="p-4 mt-auto">
          <Button
            variant="ghost"
            className="w-full justify-start text-red-500 hover:text-red-600 hover:bg-red-500/10"
            onClick={() => signOut()}
          >
            <LogOut className="h-5 w-5 mr-3" />
            Sign Out
          </Button>
        </div>
      </div>
    </div>
  );
}