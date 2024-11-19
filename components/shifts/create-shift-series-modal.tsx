"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/lib/supabase";
import { addDays, eachDayOfInterval } from "date-fns";

interface CreateShiftSeriesModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  venueId: string;
}

const patternTypes = [
  { id: "daily", label: "Daily" },
  { id: "weekly", label: "Weekly" },
  { id: "custom", label: "Custom" },
];

export function CreateShiftSeriesModal({
  open,
  onOpenChange,
  venueId,
}: CreateShiftSeriesModalProps) {
  const [name, setName] = useState("");
  const [patternType, setPatternType] = useState("daily");
  const [startDate, setStartDate] = useState<Date>(new Date());
  const [endDate, setEndDate] = useState<Date>(addDays(new Date(), 7));
  const [startTime, setStartTime] = useState("18:00");
  const [endTime, setEndTime] = useState("23:00");
  const [workersNeeded, setWorkersNeeded] = useState("2");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async () => {
    if (!name || !startDate || !endDate || !startTime || !endTime || !workersNeeded) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please fill in all required fields",
      });
      return;
    }

    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // Create shift series
      const { data: series, error: seriesError } = await supabase
        .from("shift_series")
        .insert({
          name,
          venue_id: venueId,
          pattern_type: patternType,
          start_date: startDate.toISOString(),
          end_date: endDate.toISOString(),
          created_by: user.id,
        })
        .select()
        .single();

      if (seriesError) throw seriesError;

      // Generate shifts for the series
      const dates = eachDayOfInterval({ start: startDate, end: endDate });
      const shifts = dates.map(date => ({
        date: date.toISOString().split("T")[0],
        shift_pattern: "series",
        series_id: series.id,
        venue_id: venueId,
        start_time: `${date.toISOString().split("T")[0]}T${startTime}:00`,
        end_time: `${date.toISOString().split("T")[0]}T${endTime}:00`,
        workers_needed: parseInt(workersNeeded),
        created_by: user.id,
      }));

      const { error: shiftsError } = await supabase
        .from("shifts")
        .insert(shifts);

      if (shiftsError) throw shiftsError;

      toast({
        title: "Success",
        description: "Shift series created successfully",
      });
      onOpenChange(false);
    } catch (error: any) {
      console.error("Error creating shift series:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to create shift series",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Create Shift Series</DialogTitle>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label>Series Name</Label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Evening Shifts"
            />
          </div>

          <div className="grid gap-2">
            <Label>Pattern Type</Label>
            <Select value={patternType} onValueChange={setPatternType}>
              <SelectTrigger>
                <SelectValue placeholder="Select pattern type" />
              </SelectTrigger>
              <SelectContent>
                {patternTypes.map((type) => (
                  <SelectItem key={type.id} value={type.id}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label>Start Date</Label>
              <Calendar
                mode="single"
                selected={startDate}
                onSelect={(date) => date && setStartDate(date)}
                disabled={(date) => date < new Date()}
              />
            </div>
            <div className="grid gap-2">
              <Label>End Date</Label>
              <Calendar
                mode="single"
                selected={endDate}
                onSelect={(date) => date && setEndDate(date)}
                disabled={(date) => date < startDate}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label>Start Time</Label>
              <Input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label>End Time</Label>
              <Input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
              />
            </div>
          </div>

          <div className="grid gap-2">
            <Label>Workers Needed per Shift</Label>
            <Input
              type="number"
              min="1"
              max="10"
              value={workersNeeded}
              onChange={(e) => setWorkersNeeded(e.target.value)}
            />
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={loading}>
            {loading ? "Creating..." : "Create Series"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}