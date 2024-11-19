"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Calendar,
  Clock,
  Users,
  MapPin,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import { getSupabaseClient } from "@/lib/supabase/client";
import { type Database } from "@/lib/database.types";

type Shift = Database['public']['Tables']['shifts']['Row'];

interface ShiftDetailsDialogProps {
  shift: Shift | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdate: () => void;
}

export function ShiftDetailsDialog({
  shift,
  open,
  onOpenChange,
  onUpdate,
}: ShiftDetailsDialogProps) {
  const [loading, setLoading] = useState(false);
  const supabase = getSupabaseClient();

  if (!shift) return null;

  const handleStatusChange = async (newStatus: string) => {
    try {
      setLoading(true);

      const { error } = await supabase
        .from("shifts")
        .update({
          status: newStatus,
          updated_at: new Date().toISOString(),
        })
        .eq("id", shift.id);

      if (error) throw error;

      toast.success("Shift status updated successfully");
      onUpdate();
    } catch (error: any) {
      console.error("Error updating shift status:", error);
      toast.error(error.message || "Failed to update shift status");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <DialogTitle>Shift Details</DialogTitle>
              <Badge
                variant={
                  shift.status === "confirmed"
                    ? "default"
                    : shift.status === "pending"
                    ? "secondary"
                    : "outline"
                }
              >
                {shift.status}
              </Badge>
            </div>
          </div>
        </DialogHeader>

        <Tabs defaultValue="details">
          <TabsList>
            <TabsTrigger value="details">Details</TabsTrigger>
             <TabsTrigger value="workers">Workers</TabsTrigger>
            <TabsTrigger value="history">History</TabsTrigger>
          </TabsList>

          <TabsContent value="details" className="space-y-6">
            <div className="grid gap-4">
              <div className="flex flex-wrap gap-4 text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  <span>
                    {format(new Date(shift.start_time), "MMMM d, yyyy")}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  <span>
                    {format(new Date(shift.start_time), "h:mm a")} -{" "}
                    {format(new Date(shift.end_time), "h:mm a")}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <Users className="h-4 w-4" />
                  <span>
                    {shift.assignments?.length || 0} / {shift.spots_available}{" "}
                    Workers
                  </span>
                </div>
                {shift.venue?.address && (
                  <div className="flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    <span>{shift.venue.address}</span>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <h4 className="font-semibold">Role</h4>
                <p>{shift.role}</p>
              </div>

              {shift.notes && (
                <div className="space-y-2">
                  <h4 className="font-semibold">Notes</h4>
                  <p className="text-muted-foreground">{shift.notes}</p>
                </div>
              )}

              <div className="flex justify-end gap-2">
                {shift.status === "pending" && (
                  <>
                    <Button
                      variant="outline"
                      onClick={() => handleStatusChange("cancelled")}
                      disabled={loading}
                    >
                      <XCircle className="h-4 w-4 mr-2" />
                      Cancel Shift
                    </Button>
                    <Button
                      onClick={() => handleStatusChange("confirmed")}
                      disabled={loading}
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Confirm Shift
                    </Button>
                  </>
                )}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="workers">
            <div className="space-y-4">
              <h4 className="font-semibold">Assigned Workers</h4>
              {shift.assignments && shift.assignments.length > 0 ? (
                <div className="space-y-2">
                  {shift.assignments.map((assignment: any) => (
                    <div
                      key={assignment.id}
                      className="flex items-center justify-between p-2 rounded-lg border"
                    >
                      <div>
                        <p className="font-medium">
                          {assignment.user.first_name} {assignment.user.last_name}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {assignment.user.email}
                        </p>
                      </div>
                      <Badge
                        variant={
                          assignment.status === "confirmed"
                            ? "default"
                            : "secondary"
                        }
                      >
                        {assignment.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground">No workers assigned yet</p>
              )}
            </div>
          </TabsContent>

          <TabsContent value="history">
            <div className="space-y-4">
              <h4 className="font-semibold">Shift History</h4>
              <p className="text-muted-foreground">
                History tracking coming soon...
              </p>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}