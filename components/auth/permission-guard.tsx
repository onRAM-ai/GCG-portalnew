"use client";

import { usePermissions } from "@/hooks/use-permissions";
import type { UserPermissions } from "@/lib/auth/rbac";

interface PermissionGuardProps {
  children: React.ReactNode;
  require: Array<keyof UserPermissions>;
}

export function PermissionGuard({ children, require }: PermissionGuardProps) {
  const { permissions, loading } = usePermissions();

  if (loading) {
    return null;
  }

  if (!permissions || !require.every(permission => permissions[permission])) {
    return null;
  }

  return children;
}