"use client";

import { useState, useEffect } from "react";
import { getSupabaseClient } from "@/lib/supabase/client";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { ErrorMessage } from "@/components/ui/error-message";
import { BookingsOverview } from "@/components/admin/bookings-overview";
import { EntertainerStats } from "@/components/admin/entertainer-stats";
import { VenueStats } from "@/components/admin/venue-stats";
import { RecentActivity } from "@/components/admin/recent-activity";

interface DashboardData {
  bookings: number;
  entertainers: number;
  venues: number;
}

export function AdminDashboardContent() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<DashboardData | null>(null);
  const supabase = getSupabaseClient();

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch counts from each table
      const [bookingsCount, entertainersCount, venuesCount] = await Promise.all([
        supabase.from('bookings').select('*', { count: 'exact', head: true }),
        supabase.from('users').select('*', { count: 'exact', head: true }).eq('role', 'user'),
        supabase.from('venues').select('*', { count: 'exact', head: true })
      ]);

      setData({
        bookings: bookingsCount.count || 0,
        entertainers: entertainersCount.count || 0,
        venues: venuesCount.count || 0,
      });
    } catch (err) {
      console.error('Dashboard data fetch error:', err);
      setError('Failed to load dashboard data');
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
        <ErrorMessage 
          message={error}
          onRetry={fetchDashboardData}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <BookingsOverview count={data?.bookings || 0} />
        <EntertainerStats count={data?.entertainers || 0} />
        <VenueStats count={data?.venues || 0} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Recent Activity</h2>
          <RecentActivity />
        </div>
      </div>
    </div>
  );
}