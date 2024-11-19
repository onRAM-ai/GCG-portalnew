"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/lib/supabase";
import { format } from "date-fns";

interface BulkActionsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedShifts: string[];
  onComplete: () => void;
}

export function BulkActionsModal({
  open,
  onOpenChange,
  selectedShifts,
  onComplete,
}: BulkActionsModalProps) {
  const [action, setAction] = useState("");
  const [newDate, setNewDate] = useState<Date>();
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async () => {
    if (!action) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please select an action",
      });
      return;
    }

    if (action === "reschedule" && !newDate) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please select a new date",
      });
      return;
    }

    setLoading(true);
    try {
      switch (action) {
        case "publish":
          await supabase
            .from("shifts")
            .update({ status: "published" })
            .in("id", selectedShifts);
          break;

        case "cancel":
          await supabase
            .from("shifts")
            .update({ status: "cancelled" })
            .in("id", selectedShifts);
          break;

        case "reschedule":
          await supabase
            .from("shifts")
            .update({ date: format(newDate!, "yyyy-MM-dd") })
            .in("id", selectedShifts);
          break;
      }

      toast({
        title: "Success",
        description: "Bulk action completed successfully",
      });
      onComplete();
      onOpenChange(false);
    } catch (error: any) {
      console.error("Error performing bulk action:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to perform bulk action",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Bulk Actions</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Select Action</Label>
            <Select value={action} onValueChange={setAction}>
              <SelectTrigger>
                <SelectValue placeholder="Choose an action" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="publish">Publish Shifts</SelectItem>
                <SelectItem value="cancel">Cancel Shifts</SelectItem>
                <SelectItem value="reschedule">Reschedule Shifts</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {action === "reschedule" && (
            <div className="space-y-2">
              <Label>New Date</Label>
              <Calendar
                mode="single"
                selected={newDate}
                onSelect={setNewDate}
                disabled={(date) => date < new Date()}
                className="rounded-md border"
              />
            </div>
          )}
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={loading}>
            {loading ? "Processing..." : "Apply"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}