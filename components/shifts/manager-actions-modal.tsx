"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/lib/supabase";

interface ManagerActionsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  shiftId: string;
  currentWorkerId: string;
  onUpdate: () => void;
}

export function ManagerActionsModal({
  open,
  onOpenChange,
  shiftId,
  currentWorkerId,
  onUpdate,
}: ManagerActionsModalProps) {
  const [action, setAction] = useState<string>("");
  const [newWorkerId, setNewWorkerId] = useState<string>("");
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async () => {
    if (!action || !reason.trim()) {
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

      switch (action) {
        case "reassign":
          if (!newWorkerId) {
            throw new Error("Please select a new worker");
          }
          
          // Update shift assignment
          await supabase
            .from("shift_assignments")
            .update({ worker_id: newWorkerId })
            .eq("shift_id", shiftId)
            .eq("worker_id", currentWorkerId);
          break;

        case "cancel":
          // Cancel shift assignment
          await supabase
            .from("shift_assignments")
            .update({ status: "cancelled" })
            .eq("shift_id", shiftId)
            .eq("worker_id", currentWorkerId);
          break;
      }

      // Log the action
      await supabase
        .from("shift_modifications")
        .insert({
          shift_id: shiftId,
          action_type: action,
          previous_worker_id: currentWorkerId,
          new_worker_id: newWorkerId || null,
          reason,
          modified_by: user.id,
        });

      toast({
        title: "Success",
        description: "Shift updated successfully",
      });
      onUpdate();
      onOpenChange(false);
    } catch (error: any) {
      console.error("Error updating shift:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to update shift",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Manage Shift Assignment</DialogTitle>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label>Action</Label>
            <Select value={action} onValueChange={setAction}>
              <SelectTrigger>
                <SelectValue placeholder="Select action" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="reassign">Reassign Shift</SelectItem>
                <SelectItem value="cancel">Cancel Assignment</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {action === "reassign" && (
            <div className="grid gap-2">
              <Label>New Worker</Label>
              <Select value={newWorkerId} onValueChange={setNewWorkerId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select worker" />
                </SelectTrigger>
                <SelectContent>
                  {/* Add available workers list here */}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="grid gap-2">
            <Label>Reason</Label>
            <Textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Please provide a reason for this action..."
              rows={4}
            />
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={loading}>
            {loading ? "Updating..." : "Confirm"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}