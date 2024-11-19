"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/lib/supabase";
import { addDays, format } from "date-fns";

interface ShiftFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

interface Venue {
  id: string;
  name: string;
}

export function ShiftForm({ open, onOpenChange, onSuccess }: ShiftFormProps) {
  const [title, setTitle] = useState("");
  const [venue, setVenue] = useState("");
  const [date, setDate] = useState<Date>(new Date());
  const [startTime, setStartTime] = useState("18:00");
  const [duration, setDuration] = useState("4");
  const [workersNeeded, setWorkersNeeded] = useState("2");
  const [requirements, setRequirements] = useState("");
  const [benefits, setBenefits] = useState("");
  const [notes, setNotes] = useState("");
  const [isPublished, setIsPublished] = useState(true);
  const [notifyWorkers, setNotifyWorkers] = useState(true);
  const [loading, setLoading] = useState(false);
  const [venues, setVenues] = useState<Venue[]>([]);
  const { toast } = useToast();

  const handleSubmit = async () => {
    if (!title || !venue || !date || !startTime || !duration || !workersNeeded) {
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

      // Calculate end time
      const startDate = new Date(date);
      const [hours, minutes] = startTime.split(":").map(Number);
      startDate.setHours(hours, minutes, 0, 0);
      const endDate = new Date(startDate.getTime() + parseInt(duration) * 60 * 60 * 1000);

      // Create shift
      const { error } = await supabase
        .from("shifts")
        .insert({
          title,
          venue_id: venue,
          date: format(date, "yyyy-MM-dd"),
          start_time: startDate.toISOString(),
          end_time: endDate.toISOString(),
          workers_needed: parseInt(workersNeeded),
          requirements,
          benefits,
          notes,
          status: isPublished ? "published" : "draft",
          created_by: user.id,
        });

      if (error) throw error;

      // Send notifications if enabled
      if (notifyWorkers && isPublished) {
        await supabase.rpc("notify_available_workers", {
          p_shift_id: venue,
          p_message: `New shift available at ${venues.find(v => v.id === venue)?.name}`,
        });
      }

      toast({
        title: "Success",
        description: "Shift created successfully",
      });
      onSuccess?.();
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
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Shift</DialogTitle>
        </DialogHeader>

        <div className="grid gap-6 py-4">
          <div className="grid gap-2">
            <Label>Shift Title</Label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Evening Bar Service"
            />
          </div>

          <div className="grid gap-2">
            <Label>Venue</Label>
            <Select value={venue} onValueChange={setVenue}>
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Date</Label>
              <Calendar
                mode="single"
                selected={date}
                onSelect={(date) => date && setDate(date)}
                disabled={(date) => date < new Date() || date > addDays(new Date(), 30)}
                className="rounded-md border"
              />
            </div>

            <div className="space-y-4">
              <div>
                <Label>Start Time</Label>
                <Input
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                />
              </div>
              <div>
                <Label>Duration (hours)</Label>
                <Input
                  type="number"
                  min="1"
                  max="12"
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                />
              </div>
              <div>
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
          </div>

          <div className="grid gap-2">
            <Label>Requirements</Label>
            <Textarea
              value={requirements}
              onChange={(e) => setRequirements(e.target.value)}
              placeholder="List any specific requirements or qualifications..."
              rows={3}
            />
          </div>

          <div className="grid gap-2">
            <Label>Benefits</Label>
            <Textarea
              value={benefits}
              onChange={(e) => setBenefits(e.target.value)}
              placeholder="Describe shift benefits, pay rate, etc..."
              rows={3}
            />
          </div>

          <div className="grid gap-2">
            <Label>Additional Notes</Label>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Any additional information..."
              rows={3}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Switch
                checked={isPublished}
                onCheckedChange={setIsPublished}
                id="published"
              />
              <Label htmlFor="published">Publish immediately</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                checked={notifyWorkers}
                onCheckedChange={setNotifyWorkers}
                id="notify"
              />
              <Label htmlFor="notify">Notify available workers</Label>
            </div>
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