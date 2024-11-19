"use client";

import { useState, useEffect } from "react";
import { VenueTable } from "./venue-table";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { ErrorMessage } from "@/components/ui/error-message";
import { getSupabaseClient } from "@/lib/supabase/client";
import { type Database } from "@/lib/database.types";

type Venue = Database['public']['Tables']['venues']['Row'];

export function VenuesContent() {
  const [venues, setVenues] = useState<Venue[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const supabase = getSupabaseClient();

  useEffect(() => {
    fetchVenues();
  }, []);

  const fetchVenues = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from("venues")
        .select(`
          *,
          owner:users (
            id,
            first_name,
            last_name,
            email
          ),
          managers:venue_managers (
            user:users (
              id,
              first_name,
              last_name,
              email
            )
          )
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;

      setVenues(data || []);
    } catch (err) {
      console.error("Error fetching venues:", err);
      setError("Failed to load venues");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-5rem)]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <ErrorMessage message={error} onRetry={fetchVenues} />
      </div>
    );
  }

  return (
    <>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">Venue Management</h1>
      </div>

      <VenueTable venues={venues} onUpdate={fetchVenues} />
    </>
  );
}