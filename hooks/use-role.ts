"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { getUserRole, UserRole } from "@/lib/auth/roles";

export function useRole() {
  const [role, setRole] = useState<UserRole | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRole();

    async function loadRole() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          setRole(null);
          return;
        }

        const userRole = await getUserRole(user.id);
        setRole(userRole);
      } catch (error) {
        console.error("Error loading role:", error);
        setRole(null);
      } finally {
        setLoading(false);
      }
    }
  }, []);

  return { role, loading };
}