"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { ErrorMessage } from "@/components/ui/error-message";
import { MetricsGrid } from "./metrics-grid";
import { BookingsChart } from "./bookings-chart";
import { VenueMetrics } from "./venue-metrics";
import { UserMetrics } from "./user-metrics";
import { getSupabaseClient } from "@/lib/supabase/client";

interface AnalyticsData {
  bookings: any[];
  venues: any[];
  users: any[];
  revenue: any[];
}

export function AnalyticsContent() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState<"7d" | "30d" | "90d">("30d");
  const supabase = getSupabaseClient();

  useEffect(() => {
    fetchAnalyticsData();
  }, [dateRange]);

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Calculate date range
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(endDate.getDate() - (dateRange === "7d" ? 7 : dateRange === "30d" ? 30 : 90));

      // Fetch bookings data
      const { data: bookings, error: bookingsError } = await supabase
        .from("bookings")
        .select("*")
        .gte("created_at", startDate.toISOString())
        .lte("created_at", endDate.toISOString())
        .order("created_at", { ascending: true });

      if (bookingsError) throw bookingsError;

      // Fetch venue metrics
      const { data: venues, error: venuesError } = await supabase
        .from("venues")
        .select(`
          *,
          bookings:bookings(count),
          revenue:bookings(sum(amount))
        `)
        .gte("created_at", startDate.toISOString());

      if (venuesError) throw venuesError;

      // Fetch user metrics
      const { data: users, error: usersError } = await supabase
        .from("users")
        .select(`
          role,
          created_at,
          bookings:bookings(count)
        `)
        .gte("created_at", startDate.toISOString());

      if (usersError) throw usersError;

      // Fetch revenue data
      const { data: revenue, error: revenueError } = await supabase
        .from("bookings")
        .select("amount, created_at")
        .gte("created_at", startDate.toISOString())
        .order("created_at", { ascending: true });

      if (revenueError) throw revenueError;

      setData({
        bookings: bookings || [],
        venues: venues || [],
        users: users || [],
        revenue: revenue || [],
      });
    } catch (err) {
      console.error("Error fetching analytics data:", err);
      setError("Failed to load analytics data");
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
    return <ErrorMessage message={error} onRetry={fetchAnalyticsData} />;
  }

  if (!data) {
    return null;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Analytics Dashboard</h1>
        <Tabs value={dateRange} onValueChange={(v: any) => setDateRange(v)}>
          <TabsList>
            <TabsTrigger value="7d">7 Days</TabsTrigger>
            <TabsTrigger value="30d">30 Days</TabsTrigger>
            <TabsTrigger value="90d">90 Days</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <MetricsGrid data={data} />

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4">Bookings Overview</h2>
          <BookingsChart data={data.bookings} />
        </Card>

        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4">Revenue Trends</h2>
          <BookingsChart data={data.revenue} valueKey="amount" />
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <VenueMetrics data={data.venues} />
        <UserMetrics data={data.users} />
      </div>
    </div>
  );
}