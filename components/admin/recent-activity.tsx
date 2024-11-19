"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { ErrorMessage } from "@/components/ui/error-message";
import { getSupabaseClient } from "@/lib/supabase/client";
import { format } from "date-fns";

interface Activity {
  id: string;
  type: string;
  description: string;
  created_at: string;
}

export function RecentActivity() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const supabase = getSupabaseClient();

  useEffect(() => {
    fetchActivities();
  }, []);

  const fetchActivities = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from("activity_log")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(10);

      if (error) throw error;

      setActivities(data || []);
    } catch (err) {
      console.error("Error fetching activities:", err);
      setError("Failed to load recent activities");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card className="p-6 flex justify-center">
        <LoadingSpinner />
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="p-6">
        <ErrorMessage 
          message={error}
          onRetry={fetchActivities}
        />
      </Card>
    );
  }

  if (activities.length === 0) {
    return (
      <Card className="p-6">
        <p className="text-center text-muted-foreground">No recent activity</p>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <div className="space-y-4">
        {activities.map((activity) => (
          <div
            key={activity.id}
            className="flex items-start justify-between py-4 border-b last:border-0"
          >
            <div>
              <p className="font-medium">{activity.description}</p>
              <p className="text-sm text-muted-foreground">
                {activity.type}
              </p>
            </div>
            <p className="text-sm text-muted-foreground">
              {format(new Date(activity.created_at), "PPp")}
            </p>
          </div>
        ))}
      </div>
    </Card>
  );
}