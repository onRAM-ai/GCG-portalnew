"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from './use-auth';
import { type UserRole } from '@/lib/database.types';

export function useRequireAuth(allowedRoles?: UserRole[]) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push('/login');
      } else if (allowedRoles && (!user.role || !allowedRoles.includes(user.role))) {
        router.push('/');
      }
    }
  }, [user, loading, router, allowedRoles]);

  return { user, loading };
}