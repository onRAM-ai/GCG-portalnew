"use client";

import { useState, useEffect, useCallback } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Search } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/lib/supabase";

interface Worker {
  id: string;
  name: string;
  email: string;
  available: boolean;
}

interface AssignWorkerModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  shift: {
    id: string;
    date: string;
    shift_type: string;
  };
  onAssign: () => void;
}

export function AssignWorkerModal({ open, onOpenChange, shift, onAssign }: AssignWorkerModalProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [loading, setLoading] = useState(true);
  const [assigning, setAssigning] = useState(false);
  const { toast } = useToast();

  const fetchAvailableWorkers = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select(`
          id,
          name,
          email,
          availability_preferences!inner(
            available_dates,
            preferred_shift_types
          )
        `)
        .eq("role", "worker")
        .eq("status", "active");

      if (error) throw error;

      const availableWorkers = data.map(worker => ({
        id: worker.id,
        name: worker.name || worker.email,
        email: worker.email,
        available: worker.availability_preferences.available_dates.includes(shift.date) &&
                 worker.availability_preferences.preferred_shift_types.includes(shift.shift_type)
      }));

      setWorkers(availableWorkers);
    } catch (error) {
      console.error("Error fetching workers:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load available workers",
      });
    } finally {
      setLoading(false);
    }
  }, [shift.date, shift.shift_type, toast]);

  useEffect(() => {
    if (open) {
      fetchAvailableWorkers();
    }
  }, [open, fetchAvailableWorkers]);

  const handleAssign = async (workerId: string) => {
    setAssigning(true);
    try {
      const { error } = await supabase
        .from("shift_assignments")
        .insert({
          shift_id: shift.id,
          worker_id: workerId,
          status: "pending"
        });

      if (error) throw error;

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

  const filteredWorkers = workers.filter(worker =>
    worker.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    worker.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Assign Worker to Shift</DialogTitle>
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

          <ScrollArea className="h-[300px]">
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
                    className="flex items-center justify-between p-2 rounded-lg border hover:bg-accent"
                  >
                    <div>
                      <p className="font-medium">{worker.name}</p>
                      <p className="text-sm text-muted-foreground">{worker.email}</p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleAssign(worker.id)}
                      disabled={!worker.available || assigning}
                    >
                      {worker.available ? "Assign" : "Unavailable"}
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