"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/components/ui/use-toast";
import { StarRating } from "@/components/feedback/star-rating";
import { submitFeedback } from "@/lib/api/feedback";

interface FeedbackFormProps {
  venueId: string;
  userId: string;
  onSuccess?: () => void;
}

export function FeedbackForm({ venueId, userId, onSuccess }: FeedbackFormProps) {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [mayNotReturn, setMayNotReturn] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please provide a rating",
      });
      return;
    }

    setLoading(true);
    try {
      await submitFeedback({
        venueId,
        userId,
        rating,
        comment,
        mayNotReturn,
      });

      toast({
        title: "Success",
        description: "Feedback submitted successfully",
      });
      onSuccess?.();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to submit feedback",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label>Rating</Label>
        <StarRating value={rating} onChange={setRating} />
      </div>

      <div className="space-y-2">
        <Label>Comments</Label>
        <Textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Provide detailed feedback..."
          rows={4}
        />
      </div>

      <div className="flex items-center space-x-2">
        <Switch
          id="may-not-return"
          checked={mayNotReturn}
          onCheckedChange={setMayNotReturn}
        />
        <Label htmlFor="may-not-return" className="text-sm font-medium">
          Flag as "May Not Return"
        </Label>
      </div>

      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? "Submitting..." : "Submit Feedback"}
      </Button>
    </form>
  );
}