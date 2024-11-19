"use client";

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { StarRating } from "@/components/feedback/star-rating";
import { AlertTriangle, CheckCircle, Clock } from "lucide-react";
import { type Feedback } from "@/types/feedback";
import { format } from "date-fns";

interface FeedbackListProps {
  feedback: Feedback[];
  onReview?: (feedback: Feedback) => void;
}

export function FeedbackList({ feedback, onReview }: FeedbackListProps) {
  return (
    <div className="space-y-4">
      {feedback.map((item) => (
        <Card key={item.id} className="p-6">
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <StarRating value={item.rating} readonly />
                {item.mayNotReturn && (
                  <Badge variant="destructive" className="ml-2">
                    <AlertTriangle className="h-3 w-3 mr-1" />
                    May Not Return
                  </Badge>
                )}
              </div>

              <p className="text-sm text-muted-foreground">
                {format(new Date(item.createdAt), "PPP")}
              </p>

              <p className="mt-2">{item.comment}</p>

              {item.reviewNotes && (
                <div className="mt-4 p-4 bg-muted rounded-lg">
                  <p className="text-sm font-medium">Admin Notes:</p>
                  <p className="text-sm text-muted-foreground">
                    {item.reviewNotes}
                  </p>
                </div>
              )}
            </div>

            <div className="flex flex-col items-end gap-2">
              <Badge
                variant={
                  item.status === "PENDING"
                    ? "secondary"
                    : item.status === "REVIEWED"
                    ? "default"
                    : "outline"
                }
              >
                {item.status === "PENDING" ? (
                  <Clock className="h-3 w-3 mr-1" />
                ) : (
                  <CheckCircle className="h-3 w-3 mr-1" />
                )}
                {item.status}
              </Badge>

              {onReview && item.status === "PENDING" && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onReview(item)}
                >
                  Review
                </Button>
              )}
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}