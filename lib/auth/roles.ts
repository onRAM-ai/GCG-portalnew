import { createClient } from '@supabase/supabase-js';
import { Database } from '@/lib/database.types';

const supabase = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export type UserRole = 'admin' | 'skimpy' | 'venue';

export interface UserPermissions {
  canManageUsers: boolean;
  canManageVenues: boolean;
  canManageShifts: boolean;
  canViewShifts: boolean;
  canBookShifts: boolean;
  canManageProfile: boolean;
}

export async function getUserRole(userId: string): Promise<UserRole | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', userId)
    .single();

  if (error || !data) return null;
  return data.role as UserRole;
}

export async function getUserPermissions(userId: string): Promise<UserPermissions> {
  const role = await getUserRole(userId);

  const basePermissions: UserPermissions = {
    canManageUsers: false,
    canManageVenues: false,
    canManageShifts: false,
    canViewShifts: false,
    canBookShifts: false,
    canManageProfile: false,
  };

  switch (role) {
    case 'admin':
      return {
        ...basePermissions,
        canManageUsers: true,
        canManageVenues: true,
        canManageShifts: true,
        canViewShifts: true,
      };

    case 'skimpy':
      return {
        ...basePermissions,
        canViewShifts: true,
        canBookShifts: true,
        canManageProfile: true,
      };

    case 'venue':
      return {
        ...basePermissions,
        canManageVenues: true,
        canManageShifts: true,
        canViewShifts: true,
      };

    default:
      return basePermissions;
  }
}

export async function checkPermission(
  userId: string,
  permission: keyof UserPermissions,
  resourceId?: string
): Promise<boolean> {
  const permissions = await getUserPermissions(userId);
  return permissions[permission];
}