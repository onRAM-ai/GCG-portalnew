"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { StarRating } from "@/components/feedback/star-rating";
import { updateFeedbackStatus } from "@/lib/api/feedback";
import { type Feedback } from "@/types/feedback";

interface ReviewModalProps {
  feedback: Feedback;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onReviewComplete: () => void;
}

export function ReviewModal({
  feedback,
  open,
  onOpenChange,
  onReviewComplete,
}: ReviewModalProps) {
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (status: "REVIEWED" | "RESOLVED") => {
    setLoading(true);
    try {
      await updateFeedbackStatus(feedback.id, status, notes);
      toast({
        title: "Success",
        description: "Feedback review submitted successfully",
      });
      onReviewComplete();
      onOpenChange(false);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to submit review",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Review Feedback</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Rating</Label>
            <StarRating value={feedback.rating} readonly />
          </div>

          <div className="space-y-2">
            <Label>Comment</Label>
            <p className="text-sm">{feedback.comment}</p>
          </div>

          <div className="space-y-2">
            <Label>Review Notes</Label>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add your review notes..."
              rows={4}
            />
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <Button
            variant="outline"
            onClick={() => handleSubmit("REVIEWED")}
            disabled={loading}
          >
            Mark as Reviewed
          </Button>
          <Button
            onClick={() => handleSubmit("RESOLVED")}
            disabled={loading}
          >
            Resolve
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}