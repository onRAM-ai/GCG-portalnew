"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/lib/supabase";

interface TransferRequestModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  shiftId: string;
  workerId: string;
}

export function TransferRequestModal({
  open,
  onOpenChange,
  shiftId,
  workerId,
}: TransferRequestModalProps) {
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async () => {
    if (!reason.trim()) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please provide a reason for the transfer request",
      });
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase
        .from("shift_transfers")
        .insert({
          shift_id: shiftId,
          requesting_worker_id: workerId,
          reason,
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Transfer request submitted successfully",
      });
      onOpenChange(false);
    } catch (error: any) {
      console.error("Error submitting transfer request:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to submit transfer request",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Request Shift Transfer</DialogTitle>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label>Reason for Transfer</Label>
            <Textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Please explain why you need to transfer this shift..."
              rows={4}
            />
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={loading}>
            {loading ? "Submitting..." : "Submit Request"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}