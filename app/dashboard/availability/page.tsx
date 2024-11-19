"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar as CalendarIcon, Clock, AlertCircle } from "lucide-react";
import { format } from "date-fns";
import { supabase } from "@/lib/supabase";
import { KFWModal } from "@/components/kfw-modal";

interface Availability {
  available_dates: string[];
  preferred_shift_types: string[];
  max_shifts_per_week: number;
  notes: string;
}

export default function AvailabilityPage() {
  const [availability, setAvailability] = useState<Availability | null>(null);
  const [showKFWModal, setShowKFWModal] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAvailability();
  }, []);

  async function fetchAvailability() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("availability_preferences")
        .select("*")
        .eq("user_id", user.id)
        .single();

      if (error && error.code !== "PGRST116") {
        console.error("Error fetching availability:", error);
        return;
      }

      setAvailability(data);
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Availability Preferences</h2>
        <Button onClick={() => setShowKFWModal(true)}>
          Update Availability
        </Button>
      </div>

      {availability ? (
        <div className="grid gap-6 md:grid-cols-2">
          <Card className="p-6">
            <div className="flex items-center gap-2 text-primary mb-4">
              <CalendarIcon className="h-5 w-5" />
              <h3 className="font-semibold">Available Dates</h3>
            </div>
            <div className="space-y-2">
              {availability.available_dates.map((date) => (
                <div key={date} className="flex items-center justify-between">
                  <span>{format(new Date(date), "PPP")}</span>
                </div>
              ))}
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-2 text-primary mb-4">
              <Clock className="h-5 w-5" />
              <h3 className="font-semibold">Shift Preferences</h3>
            </div>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground">Preferred Shift Types</p>
                <div className="flex gap-2 mt-1">
                  {availability.preferred_shift_types.map((type) => (
                    <div
                      key={type}
                      className="px-2 py-1 bg-primary/10 text-primary rounded text-sm"
                    >
                      {type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Maximum Shifts per Week</p>
                <p className="font-medium">{availability.max_shifts_per_week}</p>
              </div>
              {availability.notes && (
                <div>
                  <p className="text-sm text-muted-foreground">Additional Notes</p>
                  <p className="mt-1">{availability.notes}</p>
                </div>
              )}
            </div>
          </Card>
        </div>
      ) : (
        <Card className="p-6">
          <div className="flex items-center gap-2 text-muted-foreground">
            <AlertCircle className="h-5 w-5" />
            <p>No availability preferences set. Click &quot;Update Availability&quot; to set your preferences.</p>
          </div>
        </Card>
      )}

      <KFWModal open={showKFWModal} onOpenChange={setShowKFWModal} />
    </div>
  );
}