"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/lib/supabase";
import { type AccessLevel } from "@/lib/database.types";

const shiftSchema = z.object({
  date: z.date({
    required_error: "Date is required",
  }),
  startTime: z.string().min(1, "Start time is required"),
  endTime: z.string().min(1, "End time is required"),
  breakDuration: z.number().min(0).max(120),
  requiredLevel: z.enum(['level_1', 'level_2', 'level_3'] as const),
  spotsAvailable: z.number().min(1).max(10),
  hourlyRate: z.number().min(0),
  notes: z.string().optional(),
});

type ShiftFormValues = z.infer<typeof shiftSchema>;

export function ShiftForm() {
  const [loading, setLoading] = useState(false);
  const [availableWorkers, setAvailableWorkers] = useState<any[]>([]);
  const router = useRouter();
  const { toast } = useToast();

  const form = useForm<ShiftFormValues>({
    resolver: zodResolver(shiftSchema),
    defaultValues: {
      breakDuration: 30,
      spotsAvailable: 1,
      requiredLevel: 'level_1',
    },
  });

  const onSubmit = async (data: ShiftFormValues) => {
    setLoading(true);
    try {
      // Combine date and time
      const startDateTime = new Date(data.date);
      const [startHours, startMinutes] = data.startTime.split(':');
      startDateTime.setHours(parseInt(startHours), parseInt(startMinutes));

      const endDateTime = new Date(data.date);
      const [endHours, endMinutes] = data.endTime.split(':');
      endDateTime.setHours(parseInt(endHours), parseInt(endMinutes));

      const { error } = await supabase
        .from('shifts')
        .insert({
          start_time: startDateTime.toISOString(),
          end_time: endDateTime.toISOString(),
          required_level: data.requiredLevel,
          spots_available: data.spotsAvailable,
          hourly_rate: data.hourlyRate,
          break_duration: data.breakDuration,
          notes: data.notes,
          status: 'pending',
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Shift created successfully",
      });

      router.push('/shifts');
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

  const handleDateSelect = async (date: Date | undefined) => {
    if (!date) return;

    form.setValue('date', date);

    try {
      // Fetch available workers for the selected date
      const { data, error } = await supabase
        .from('availability_preferences')
        .select(`
          user_id,
          users (
            id,
            first_name,
            last_name,
            access_level
          )
        `)
        .contains('available_dates', [date.toISOString().split('T')[0]]);

      if (error) throw error;

      setAvailableWorkers(data?.map(d => d.users) || []);
    } catch (error) {
      console.error("Error fetching available workers:", error);
    }
  };

  return (
    <Card className="p-6">
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label>Date</Label>
            <Calendar
              mode="single"
              selected={form.watch('date')}
              onSelect={handleDateSelect}
              disabled={(date) => date < new Date()}
              className="rounded-md border"
            />
            {form.formState.errors.date && (
              <p className="text-sm text-destructive">
                {form.formState.errors.date.message}
              </p>
            )}
          </div>

          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="startTime">Start Time</Label>
                <Input
                  id="startTime"
                  type="time"
                  {...form.register("startTime")}
                />
                {form.formState.errors.startTime && (
                  <p className="text-sm text-destructive">
                    {form.formState.errors.startTime.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="endTime">End Time</Label>
                <Input
                  id="endTime"
                  type="time"
                  {...form.register("endTime")}
                />
                {form.formState.errors.endTime && (
                  <p className="text-sm text-destructive">
                    {form.formState.errors.endTime.message}
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="breakDuration">Break Duration (minutes)</Label>
              <Input
                id="breakDuration"
                type="number"
                min="0"
                max="120"
                {...form.register("breakDuration", { valueAsNumber: true })}
              />
              {form.formState.errors.breakDuration && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.breakDuration.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="requiredLevel">Required Level</Label>
              <Select
                value={form.watch("requiredLevel")}
                onValueChange={(value: AccessLevel) =>
                  form.setValue("requiredLevel", value)
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="level_1">Level 1</SelectItem>
                  <SelectItem value="level_2">Level 2</SelectItem>
                  <SelectItem value="level_3">Level 3</SelectItem>
                </SelectContent>
              </Select>
              {form.formState.errors.requiredLevel && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.requiredLevel.message}
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="spotsAvailable">Number of Spots</Label>
            <Input
              id="spotsAvailable"
              type="number"
              min="1"
              max="10"
              {...form.register("spotsAvailable", { valueAsNumber: true })}
            />
            {form.formState.errors.spotsAvailable && (
              <p className="text-sm text-destructive">
                {form.formState.errors.spotsAvailable.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="hourlyRate">Hourly Rate ($)</Label>
            <Input
              id="hourlyRate"
              type="number"
              min="0"
              step="0.01"
              {...form.register("hourlyRate", { valueAsNumber: true })}
            />
            {form.formState.errors.hourlyRate && (
              <p className="text-sm text-destructive">
                {form.formState.errors.hourlyRate.message}
              </p>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="notes">Notes</Label>
          <Textarea
            id="notes"
            {...form.register("notes")}
            placeholder="Add any additional information about the shift..."
            rows={4}
          />
          {form.formState.errors.notes && (
            <p className="text-sm text-destructive">
              {form.formState.errors.notes.message}
            </p>
          )}
        </div>

        {availableWorkers.length > 0 && (
          <div className="space-y-2">
            <Label>Available Workers</Label>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
              {availableWorkers.map((worker) => (
                <div
                  key={worker.id}
                  className="p-2 rounded-md border text-sm"
                >
                  {worker.first_name} {worker.last_name} ({worker.access_level})
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flex justify-end gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push('/shifts')}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? "Creating..." : "Create Shift"}
          </Button>
        </div>
      </form>
    </Card>
  );
}