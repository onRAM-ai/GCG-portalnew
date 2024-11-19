"use client";

import { useState, useEffect } from "react";
import { ShiftCalendar } from "./shift-calendar";
import { ShiftList } from "./shift-list";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Plus, Calendar as CalendarIcon, List } from "lucide-react";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { ErrorMessage } from "@/components/ui/error-message";
import { CreateShiftDialog } from "./create-shift-dialog";
import { getSupabaseClient } from "@/lib/supabase/client";
import { type Database } from "@/lib/database.types";

type Shift = Database['public']['Tables']['shifts']['Row'];

export function ShiftsContent() {
  const [view, setView] = useState<"calendar" | "list">("calendar");
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const supabase = getSupabaseClient();

  useEffect(() => {
    fetchShifts();
  }, []);

  const fetchShifts = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from("shifts")
        .select(`
          *,
          venue:venues (
            name,
            address
          ),
          assignments:shift_assignments (
            id,
            user:users (
              id,
              first_name,
              last_name,
              email
            ),
            status
          )
        `)
        .order("start_time", { ascending: true });

      if (error) throw error;

      setShifts(data || []);
    } catch (err) {
      console.error("Error fetching shifts:", err);
      setError("Failed to load shifts");
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
        <ErrorMessage message={error} onRetry={fetchShifts} />
      </div>
    );
  }

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Shift Management</h1>
        <Button onClick={() => setShowCreateDialog(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Create Shift
        </Button>
      </div>

      <Tabs value={view} onValueChange={(v) => setView(v as "calendar" | "list")}>
        <TabsList>
          <TabsTrigger value="calendar" className="flex items-center gap-2">
            <CalendarIcon className="h-4 w-4" />
            Calendar View
          </TabsTrigger>
          <TabsTrigger value="list" className="flex items-center gap-2">
            <List className="h-4 w-4" />
            List View
          </TabsTrigger>
        </TabsList>

        <TabsContent value="calendar" className="mt-6">
          <ShiftCalendar shifts={shifts} onShiftUpdate={fetchShifts} />
        </TabsContent>

        <TabsContent value="list" className="mt-6">
          <ShiftList shifts={shifts} onShiftUpdate={fetchShifts} />
        </TabsContent>
      </Tabs>

      <CreateShiftDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        onSuccess={fetchShifts}
      />
    </>
  );
}