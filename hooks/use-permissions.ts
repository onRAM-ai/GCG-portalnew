"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { getUserPermissions, UserPermissions } from "@/lib/auth/roles";

export function usePermissions() {
  const [permissions, setPermissions] = useState<UserPermissions | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPermissions();

    async function loadPermissions() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          setPermissions(null);
          return;
        }

        const userPermissions = await getUserPermissions(user.id);
        setPermissions(userPermissions);
      } catch (error) {
        console.error("Error loading permissions:", error);
        setPermissions(null);
      } finally {
        setLoading(false);
      }
    }
  }, []);

  return { permissions, loading };
}