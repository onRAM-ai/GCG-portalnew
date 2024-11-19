"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth/hooks";
import { type UserRole } from "@/lib/database.types";
import { LoadingScreen } from "@/components/ui/loading-screen";

interface RoleGuardProps {
  children: React.ReactNode;
  allowedRoles: UserRole[];
  redirectTo?: string;
}

export function RoleGuard({ 
  children, 
  allowedRoles, 
  redirectTo = "/login" 
}: RoleGuardProps) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push(redirectTo);
      } else if (!user.role || !allowedRoles.includes(user.role)) {
        const fallbackRoute = user.role === 'admin' ? '/admin'
          : user.role === 'venue' ? '/venue'
          : '/dashboard';
        router.push(fallbackRoute);
      }
    }
  }, [user, loading, router, allowedRoles, redirectTo]);

  if (loading) {
    return <LoadingScreen />;
  }

  if (!user || !user.role || !allowedRoles.includes(user.role)) {
    return null;
  }

  return children;
}