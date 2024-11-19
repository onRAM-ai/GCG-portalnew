"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Search, CheckCircle, Clock } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/lib/supabase";

interface Worker {
  id: string;
  name: string;
  email: string;
  experience: number;
  rating: number;
  availability: {
    dates: string[];
    preferred_shifts: string[];
  };
}

interface WorkerAssignmentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  shiftId: string;
  shiftDate: string;
  onAssign: () => void;
}

export function WorkerAssignmentModal({
  open,
  onOpenChange,
  shiftId,
  shiftDate,
  onAssign,
}: WorkerAssignmentModalProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [loading, setLoading] = useState(false);
  const [assigning, setAssigning] = useState(false);
  const { toast } = useToast();

  const handleAssign = async (workerId: string) => {
    setAssigning(true);
    try {
      const { error } = await supabase
        .from("shift_assignments")
        .insert({
          shift_id: shiftId,
          worker_id: workerId,
          status: "pending",
        });

      if (error) throw error;

      // Send notification to worker
      await supabase.rpc("notify_worker", {
        p_worker_id: workerId,
        p_message: "You have been assigned to a new shift",
        p_shift_id: shiftId,
      });

      toast({
        title: "Success",
        description: "Worker assigned successfully",
      });
      onAssign();
      onOpenChange(false);
    } catch (error: any) {
      console.error("Error assigning worker:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to assign worker",
      });
    } finally {
      setAssigning(false);
    }
  };

  const filteredWorkers = workers.filter(
    (worker) =>
      (worker.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        worker.email.toLowerCase().includes(searchQuery.toLowerCase())) &&
      worker.availability.dates.includes(shiftDate)
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Assign Workers</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search workers..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          <ScrollArea className="h-[400px]">
            <div className="space-y-2">
              {loading ? (
                <p className="text-center py-4">Loading workers...</p>
              ) : filteredWorkers.length === 0 ? (
                <p className="text-center py-4 text-muted-foreground">
                  No available workers found
                </p>
              ) : (
                filteredWorkers.map((worker) => (
                  <div
                    key={worker.id}
                    className="flex items-center justify-between p-4 rounded-lg border hover:bg-accent"
                  >
                    <div>
                      <p className="font-medium">{worker.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {worker.email}
                      </p>
                      <div className="flex gap-2 mt-1">
                        <Badge variant="secondary">
                          {worker.experience} years exp.
                        </Badge>
                        <Badge variant="secondary">
                          {worker.rating.toFixed(1)} rating
                        </Badge>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleAssign(worker.id)}
                      disabled={assigning}
                    >
                      {assigning ? (
                        <Clock className="h-4 w-4 animate-spin" />
                      ) : (
                        <CheckCircle className="h-4 w-4" />
                      )}
                      <span className="ml-2">Assign</span>
                    </Button>
                  </div>
                ))
              )}
            </div>
          </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  );
}