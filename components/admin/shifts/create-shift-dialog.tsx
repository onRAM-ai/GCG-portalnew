"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { getSupabaseClient } from "@/lib/supabase/client";

const shiftSchema = z.object({
  venue_id: z.string().min(1, "Venue is required"),
  role: z.string().min(1, "Role is required"),
  date: z.date({
    required_error: "Date is required",
  }),
  start_time: z.string().min(1, "Start time is required"),
  end_time: z.string().min(1, "End time is required"),
  spots_available: z.number().min(1).max(10),
  hourly_rate: z.number().min(0),
  notes: z.string().optional(),
});

interface CreateShiftDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function CreateShiftDialog({
  open,
  onOpenChange,
  onSuccess,
}: CreateShiftDialogProps) {
  const [loading, setLoading] = useState(false);
  const [venues, setVenues] = useState<Array<{ id: string; name: string }>>([]);
  const supabase = getSupabaseClient();

  const form = useForm({
    resolver: zodResolver(shiftSchema),
    defaultValues: {
      spots_available: 1,
      hourly_rate: 0,
    },
  });

  const onSubmit = async (data: z.infer<typeof shiftSchema>) => {
    try {
      setLoading(true);

      // Combine date and time
      const startDateTime = new Date(data.date);
      const [startHours, startMinutes] = data.start_time.split(":");
      startDateTime.setHours(parseInt(startHours), parseInt(startMinutes));

      const endDateTime = new Date(data.date);
      const [endHours, endMinutes] = data.end_time.split(":");
      endDateTime.setHours(parseInt(endHours), parseInt(endMinutes));

      const { error } = await supabase.from("shifts").insert({
        venue_id: data.venue_id,
        role: data.role,
        start_time: startDateTime.toISOString(),
        end_time: endDateTime.toISOString(),
        spots_available: data.spots_available,
        hourly_rate: data.hourly_rate,
        notes: data.notes,
        status: "pending",
      });

      if (error) throw error;

      toast.success("Shift created successfully");
      onSuccess();
      onOpenChange(false);
    } catch (error: any) {
      console.error("Error creating shift:", error);
      toast.error(error.message || "Failed to create shift");
    } finally {
      setLoading(false);
    }
  };

  // Load venues when dialog opens
  useState(() => {
    async function loadVenues() {
      try {
        const { data, error } = await supabase
          .from("venues")
          .select("id, name")
          .eq("status", "active");

        if (error) throw error;
        setVenues(data || []);
      } catch (error) {
        console.error("Error loading venues:", error);
        toast.error("Failed to load venues");
      }
    }

    if (open) {
      loadVenues();
    }
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Shift</DialogTitle>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label>Venue</Label>
              <Select
                value={form.watch("venue_id")}
                onValueChange={(value) => form.setValue("venue_id", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select venue" />
                </SelectTrigger>
                <SelectContent>
                  {venues.map((venue) => (
                    <SelectItem key={venue.id} value={venue.id}>
                      {venue.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label>Role</Label>
              <Input {...form.register("role")} placeholder="e.g., Bartender" />
            </div>

            <div className="grid gap-2">
              <Label>Date</Label>
              <Calendar
                mode="single"
                selected={form.watch("date")}
                onSelect={(date) => form.setValue("date", date as Date)}
                disabled={(date) => date < new Date()}
                className="rounded-md border"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Start Time</Label>
                <Input
                  type="time"
                  {...form.register("start_time")}
                />
              </div>
              <div className="grid gap-2">
                <Label>End Time</Label>
                <Input
                  type="time"
                  {...form.register("end_time")}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Workers Needed</Label>
                <Input
                  type="number"
                  min="1"
                  max="10"
                  {...form.register("spots_available", { valueAsNumber: true })}
                />
              </div>
              <div className="grid gap-2">
                <Label>Hourly Rate ($)</Label>
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  {...form.register("hourly_rate", { valueAsNumber: true })}
                />
              </div>
            </div>

            <div className="grid gap-2">
              <Label>Notes (Optional)</Label>
              <Textarea
                {...form.register("notes")}
                rows={3}
                placeholder="Add any additional information..."
              />
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Creating..." : "Create Shift"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}