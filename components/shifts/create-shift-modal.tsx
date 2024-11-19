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

interface CreateShiftModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedDate: Date;
}

const shiftTypes = [
  { id: "day", label: "Day Shift" },
  { id: "night", label: "Night Shift" },
  { id: "special_event", label: "Special Event" },
];

export function CreateShiftModal({ open, onOpenChange, selectedDate }: CreateShiftModalProps) {
  const [date, setDate] = useState<Date>(selectedDate);
  const [shiftType, setShiftType] = useState<string>("day");
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("17:00");
  const [workersNeeded, setWorkersNeeded] = useState("1");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async () => {
    if (!date || !shiftType || !startTime || !endTime || !workersNeeded) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please fill in all fields",
      });
      return;
    }

    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // Create shift in database
      const { error } = await supabase
        .from("shifts")
        .insert({
          date: date.toISOString().split("T")[0],
          shift_type: shiftType,
          start_time: `${date.toISOString().split("T")[0]}T${startTime}:00`,
          end_time: `${date.toISOString().split("T")[0]}T${endTime}:00`,
          workers_needed: parseInt(workersNeeded),
          created_by: user.id,
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Shift created successfully",
      });
      onOpenChange(false);
    } catch (error: any) {
      console.error("Error creating shift:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to create shift",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create New Shift</DialogTitle>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label>Date</Label>
            <Calendar
              mode="single"
              selected={date}
              onSelect={(date) => date && setDate(date)}
              className="rounded-md border"
              disabled={(date) => date < new Date()}
            />
          </div>

          <div className="grid gap-2">
            <Label>Shift Type</Label>
            <Select value={shiftType} onValueChange={setShiftType}>
              <SelectTrigger>
                <SelectValue placeholder="Select shift type" />
              </SelectTrigger>
              <SelectContent>
                {shiftTypes.map((type) => (
                  <SelectItem key={type.id} value={type.id}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
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
            <Label>Workers Needed</Label>
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
            {loading ? "Creating..." : "Create Shift"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}