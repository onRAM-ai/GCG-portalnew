"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Martini, MapPin, Users, Menu, X, Crown, Calendar, Settings } from "lucide-react";
import { useAuth } from "@/lib/auth/hooks";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const { user, signOut } = useAuth();

  // Define navigation items based on user role
  const getNavItems = () => {
    if (!user) {
      return [
        { href: "/venues", icon: MapPin, label: "Venues" },
        { href: "/skimpies", icon: Users, label: "Skimpies" },
      ];
    }

    switch (user.role) {
      case "admin":
        return [
          { href: "/admin", icon: Crown, label: "Dashboard" },
          { href: "/admin/users", icon: Users, label: "Users" },
          { href: "/admin/venues", icon: MapPin, label: "Venues" },
          { href: "/admin/shifts", icon: Calendar, label: "Shifts" },
          { href: "/admin/settings", icon: Settings, label: "Settings" },
        ];
      case "venue":
        return [
          { href: "/venue", icon: Crown, label: "Dashboard" },
          { href: "/venue/shifts", icon: Calendar, label: "Shifts" },
          { href: "/venue/settings", icon: Settings, label: "Settings" },
        ];
      default:
        return [
          { href: "/dashboard", icon: Crown, label: "Dashboard" },
          { href: "/shifts", icon: Calendar, label: "Shifts" },
          { href: "/settings", icon: Settings, label: "Settings" },
        ];
    }
  };

  const navItems = getNavItems();

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 bg-background/40 backdrop-blur-xl border-b border-primary/10 z-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-20">
            <div className="flex items-center">
              <Link href={user ? `/${user.role}` : "/"} className="flex items-center group">
                <Martini className="h-8 w-8 text-primary transition-transform group-hover:scale-110" />
                <span className="ml-2 text-xl font-bold gold-glow">Gold Class Girls</span>
              </Link>
            </div>

            <div className="hidden md:flex items-center space-x-1">
              {navItems.map((item) => (
                <Link key={item.href} href={item.href}>
                  <Button 
                    variant="ghost" 
                    className="flex items-center h-12 px-4 transition-colors rounded-full hover:bg-primary/20 hover:text-primary group"
                  >
                    <item.icon className="h-5 w-5 mr-2 group-hover:scale-110 transition-transform" />
                    <span>{item.label}</span>
                  </Button>
                </Link>
              ))}
              <div className="ml-4">
                {user ? (
                  <Button 
                    variant="outline" 
                    className="h-12 px-6 rounded-full hover:bg-primary/20 hover:text-primary hover:border-primary"
                    onClick={() => signOut()}
                  >
                    Sign Out
                  </Button>
                ) : (
                  <Link href="/login">
                    <Button variant="outline" className="h-12 px-6 rounded-full hover:bg-primary/20 hover:text-primary hover:border-primary">
                      Sign In
                    </Button>
                  </Link>
                )}
              </div>
            </div>

            <div className="md:hidden flex items-center">
              <Button variant="ghost" onClick={() => setIsOpen(!isOpen)} className="rounded-full hover:bg-primary/20 hover:text-primary">
                {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </Button>
            </div>
          </div>
        </div>

        {isOpen && (
          <div className="md:hidden bg-background/95 backdrop-blur-xl">
            <div className="px-4 pt-2 pb-3 space-y-1">
              {navItems.map((item) => (
                <Link key={item.href} href={item.href}>
                  <Button 
                    variant="ghost" 
                    className="w-full justify-start rounded-full hover:bg-primary/20 hover:text-primary group"
                  >
                    <item.icon className="mr-2 h-4 w-4 group-hover:scale-110 transition-transform" />
                    {item.label}
                  </Button>
                </Link>
              ))}
              <div className="flex items-center justify-end gap-2 px-2 pt-2">
                {user ? (
                  <Button 
                    variant="outline" 
                    className="rounded-full hover:bg-primary/20 hover:text-primary hover:border-primary"
                    onClick={() => signOut()}
                  >
                    Sign Out
                  </Button>
                ) : (
                  <Link href="/login">
                    <Button variant="outline" className="rounded-full hover:bg-primary/20 hover:text-primary hover:border-primary">
                      Sign In
                    </Button>
                  </Link>
                )}
              </div>
            </div>
          </div>
        )}
      </nav>
      {/* Add padding to account for fixed navbar height */}
      <div className="h-20"></div>
    </>
  );
}