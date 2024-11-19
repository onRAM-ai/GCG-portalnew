import { createServerSupabaseClient } from '@/lib/supabase/server';
import { type Database } from '@/lib/database.types';

type UserRole = Database['public']['Enums']['user_role'];

interface Permission {
  id: string;
  name: string;
  description: string;
}

interface RolePermissions {
  [key: string]: Permission[];
}

// Define base permissions for each role
const rolePermissions: RolePermissions = {
  admin: [
    { id: 'manage_users', name: 'Manage Users', description: 'Create, update, and delete users' },
    { id: 'manage_venues', name: 'Manage Venues', description: 'Create, update, and delete venues' },
    { id: 'manage_shifts', name: 'Manage Shifts', description: 'Create, update, and delete shifts' },
    { id: 'view_analytics', name: 'View Analytics', description: 'Access analytics dashboard' },
    { id: 'manage_settings', name: 'Manage Settings', description: 'Modify system settings' },
  ],
  venue: [
    { id: 'manage_own_venue', name: 'Manage Own Venue', description: 'Update own venue details' },
    { id: 'manage_venue_shifts', name: 'Manage Venue Shifts', description: 'Create and manage shifts' },
    { id: 'view_venue_analytics', name: 'View Venue Analytics', description: 'Access venue analytics' },
  ],
  user: [
    { id: 'view_shifts', name: 'View Shifts', description: 'View available shifts' },
    { id: 'book_shifts', name: 'Book Shifts', description: 'Book available shifts' },
    { id: 'manage_profile', name: 'Manage Profile', description: 'Update own profile' },
  ],
};

export async function getUserPermissions(userId: string) {
  const supabase = createServerSupabaseClient();

  try {
    // Get user role
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('role')
      .eq('auth_id', userId)
      .single();

    if (userError) throw userError;

    // Get role permissions
    const permissions = rolePermissions[user.role] || [];

    // Get any additional custom permissions
    const { data: customPermissions, error: permissionsError } = await supabase
      .from('user_permissions')
      .select('permission_id')
      .eq('user_id', userId);

    if (permissionsError) throw permissionsError;

    // Combine base role permissions with custom permissions
    const allPermissions = [
      ...permissions,
      ...(customPermissions || []).map(cp => ({
        id: cp.permission_id,
        name: cp.permission_id,
        description: 'Custom permission',
      })),
    ];

    return allPermissions;
  } catch (error) {
    console.error('Error fetching user permissions:', error);
    return [];
  }
}

export async function checkPermission(userId: string, permissionId: string): Promise<boolean> {
  try {
    const permissions = await getUserPermissions(userId);
    return permissions.some(p => p.id === permissionId);
  } catch (error) {
    console.error('Error checking permission:', error);
    return false;
  }
}

export async function validatePermissions(
  userId: string,
  requiredPermissions: string[]
): Promise<boolean> {
  try {
    const permissions = await getUserPermissions(userId);
    return requiredPermissions.every(required =>
      permissions.some(p => p.id === required)
    );
  } catch (error) {
    console.error('Error validating permissions:', error);
    return false;
  }
}