"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { getSupabaseClient } from "@/lib/supabase/client";
import { type Database } from "@/lib/database.types";

type Venue = Database['public']['Tables']['venues']['Row'];

const venueSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  address: z.string().min(5, "Address must be at least 5 characters"),
  suburb: z.string().min(2, "Suburb must be at least 2 characters"),
  state: z.string().min(2, "State must be at least 2 characters"),
  postcode: z.string().min(4, "Postcode must be at least 4 characters"),
  contact_name: z.string().min(2, "Contact name must be at least 2 characters"),
  contact_email: z.string().email("Invalid email address"),
  contact_phone: z.string().min(8, "Phone must be at least 8 characters"),
  status: z.enum(["active", "inactive", "pending"]),
  owner_id: z.string().optional(),
});

interface VenueDialogProps {
  venue: Venue | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function VenueDialog({
  venue,
  open,
  onOpenChange,
  onSuccess,
}: VenueDialogProps) {
  const [loading, setLoading] = useState(false);
  const supabase = getSupabaseClient();

  const form = useForm({
    resolver: zodResolver(venueSchema),
    defaultValues: {
      name: venue?.name || "",
      address: venue?.address || "",
      suburb: venue?.suburb || "",
      state: venue?.state || "",
      postcode: venue?.postcode || "",
      contact_name: venue?.contact_name || "",
      contact_email: venue?.contact_email || "",
      contact_phone: venue?.contact_phone || "",
      status: venue?.status || "pending",
      owner_id: venue?.owner_id || undefined,
    },
  });

  const onSubmit = async (data: z.infer<typeof venueSchema>) => {
    try {
      setLoading(true);

      if (venue) {
        // Update existing venue
        const { error } = await supabase
          .from("venues")
          .update({
            ...data,
            updated_at: new Date().toISOString(),
          })
          .eq("id", venue.id);

        if (error) throw error;

        toast.success("Venue updated successfully");
      } else {
        // Create new venue
        const { error } = await supabase
          .from("venues")
          .insert([{
            ...data,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          }]);

        if (error) throw error;

        toast.success("Venue created successfully");
      }

      onSuccess();
      onOpenChange(false);
    } catch (error: any) {
      console.error("Error saving venue:", error);
      toast.error(error.message || "Failed to save venue");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {venue ? "Edit Venue" : "Create Venue"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label>Venue Name</Label>
              <Input {...form.register("name")} />
              {form.formState.errors.name && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.name.message}
                </p>
              )}
            </div>

            <div className="grid gap-2">
              <Label>Address</Label>
              <Input {...form.register("address")} />
              {form.formState.errors.address && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.address.message}
                </p>
              )}
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="grid gap-2">
                <Label>Suburb</Label>
                <Input {...form.register("suburb")} />
              </div>
              <div className="grid gap-2">
                <Label>State</Label>
                <Input {...form.register("state")} />
              </div>
              <div className="grid gap-2">
                <Label>Postcode</Label>
                <Input {...form.register("postcode")} />
              </div>
            </div>

            <div className="grid gap-2">
              <Label>Contact Name</Label>
              <Input {...form.register("contact_name")} />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Contact Email</Label>
                <Input {...form.register("contact_email")} type="email" />
              </div>
              <div className="grid gap-2">
                <Label>Contact Phone</Label>
                <Input {...form.register("contact_phone")} type="tel" />
              </div>
            </div>

            <div className="grid gap-2">
              <Label>Status</Label>
              <Select
                value={form.watch("status")}
                onValueChange={(value: any) => form.setValue("status", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Saving..." : venue ? "Update" : "Create"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}