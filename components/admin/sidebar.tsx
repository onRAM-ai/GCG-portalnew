"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  Crown,
  Users,
  Building,
  Calendar,
  Settings,
  LayoutDashboard,
  Bell,
  BarChart,
  LogOut,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAuth } from "@/lib/auth/hooks";

const navigation = [
  { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { name: "Users", href: "/admin/users", icon: Users },
  { name: "Venues", href: "/admin/venues", icon: Building },
  { name: "Shifts", href: "/admin/shifts", icon: Calendar },
  { name: "Analytics", href: "/admin/analytics", icon: BarChart },
  { name: "Notifications", href: "/admin/notifications", icon: Bell },
  { name: "Settings", href: "/admin/settings", icon: Settings },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const { signOut } = useAuth();

  return (
    <div className="fixed inset-y-0 left-0 w-64 bg-background/50 backdrop-blur-xl border-r border-primary/10">
      <div className="flex flex-col h-full">
        <div className="p-6">
          <Link href="/admin" className="flex items-center">
            <Crown className="h-6 w-6 text-primary" />
            <span className="ml-3 text-xl font-semibold">Admin Portal</span>
          </Link>
        </div>

        <ScrollArea className="flex-1 px-4">
          <nav className="space-y-1">
            {navigation.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors",
                    isActive
                      ? "bg-primary/20 text-primary"
                      : "hover:bg-primary/10 hover:text-primary"
                  )}
                >
                  <item.icon className="h-5 w-5 mr-3" />
                  {item.name}
                </Link>
              );
            })}
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