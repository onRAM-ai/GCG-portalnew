"use client";

import { useState, useCallback } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { createBooking } from "@/lib/bookings";
import type { BookingRequest } from "@/lib/bookings";

// Add form validation schema
const bookingSchema = z.object({
  date: z.date({
    required_error: "Please select a date",
    invalid_type_error: "Invalid date",
  }),
  venueId: z.string(),
});

type BookingFormData = z.infer<typeof bookingSchema>;

interface BookingFormProps {
  venueId: string;
  venueName: string;
  onSuccess?: () => void;
  onError?: (error: Error) => void;
  minDate?: Date;
  maxDate?: Date;
  disabledDays?: number[];
}

export function BookingForm({ 
  venueId, 
  venueName, 
  onSuccess, 
  onError,
  minDate = new Date(),
  maxDate,
  disabledDays = [0], // Sunday by default
}: BookingFormProps) {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const form = useForm<BookingFormData>({
    resolver: zodResolver(bookingSchema),
    defaultValues: {
      venueId,
    },
  });

  const handleSubmit = useCallback(async (data: BookingFormData) => {
    setLoading(true);
    try {
      const startTime = new Date(data.date);
      startTime.setHours(18, 0, 0, 0);
      
      const endTime = new Date(data.date);
      endTime.setHours(23, 0, 0, 0);

      const booking: BookingRequest = {
        venue_id: data.venueId,
        start_time: startTime,
        end_time: endTime,
      };

      await createBooking(booking);

      toast({
        title: "Success",
        description: `Booking request for ${venueName} submitted successfully`,
      });

      onSuccess?.();
      form.reset();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to create booking";
      toast({
        variant: "destructive",
        title: "Booking Failed",
        description: errorMessage,
      });
      onError?.(error instanceof Error ? error : new Error(errorMessage));
    } finally {
      setLoading(false);
    }
  }, [venueId, venueName, toast, onSuccess, onError, form]);

  const isDateDisabled = useCallback((date: Date) => {
    // Check if date is in the past
    if (date < new Date()) return true;
    
    // Check if date is beyond max date
    if (maxDate && date > maxDate) return true;
    
    // Check if day is disabled
    if (disabledDays.includes(date.getDay())) return true;
    
    return false;
  }, [maxDate, disabledDays]);

  return (
    <Card className="p-6">
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="date">Select Date</Label>
          <Calendar
            mode="single"
            selected={form.watch("date")}
            onSelect={(date) => form.setValue("date", date as Date)}
            disabled={isDateDisabled}
            className="rounded-md border"
          />
          {form.formState.errors.date && (
            <p className="text-sm text-destructive">
              {form.formState.errors.date.message}
            </p>
          )}
          <p className="text-sm text-muted-foreground">
            Standard booking hours: 6:00 PM - 11:00 PM
          </p>
        </div>

        <Button 
          type="submit" 
          className="w-full" 
          disabled={loading || !form.formState.isValid}
        >
          {loading ? "Submitting..." : "Request Booking"}
        </Button>
      </form>
    </Card>
  );
}