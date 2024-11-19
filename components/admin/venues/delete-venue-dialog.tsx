"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { getSupabaseClient } from "@/lib/supabase/client";
import { type Database } from "@/lib/database.types";

type Venue = Database['public']['Tables']['venues']['Row'];

interface DeleteVenueDialogProps {
  venue: Venue | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function DeleteVenueDialog({
  venue,
  open,
  onOpenChange,
  onSuccess,
}: DeleteVenueDialogProps) {
  const handleDelete = async () => {
    if (!venue) return;

    try {
      const supabase = getSupabaseClient();

      const { error } = await supabase
        .from("venues")
        .delete()
        .eq("id", venue.id);

      if (error) throw error;

      toast.success("Venue deleted successfully");
      onSuccess();
      onOpenChange(false);
    } catch (error: any) {
      console.error("Error deleting venue:", error);
      toast.error(error.message || "Failed to delete venue");
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete the venue
            and all associated data.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}