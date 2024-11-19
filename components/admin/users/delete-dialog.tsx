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

type User = Database['public']['Tables']['users']['Row'];

interface DeleteDialogProps {
  user: User | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function DeleteDialog({ user, open, onOpenChange, onSuccess }: DeleteDialogProps) {
  const handleDelete = async () => {
    if (!user) return;

    try {
      const supabase = getSupabaseClient();

      // Delete user from auth
      const { error: authError } = await supabase.auth.admin.deleteUser(
        user.auth_id
      );

      if (authError) throw authError;

      // Delete user from database
      const { error: dbError } = await supabase
        .from("users")
        .delete()
        .eq("id", user.id);

      if (dbError) throw dbError;

      toast.success("User deleted successfully");
      onSuccess();
      onOpenChange(false);
    } catch (error: any) {
      console.error("Error deleting user:", error);
      toast.error(error.message || "Failed to delete user");
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete the user
            account and remove their data from our servers.
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