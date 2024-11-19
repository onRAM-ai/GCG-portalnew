"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, Clock, Users, MapPin, Briefcase, Info } from "lucide-react";
import { format } from "date-fns";

interface Shift {
  id: string;
  title: string;
  venue: {
    name: string;
    location: string;
  };
  date: string;
  start_time: string;
  end_time: string;
  workers_needed: number;
  workers_assigned: number;
  status: "draft" | "published" | "filled" | "completed";
  requirements: string;
  benefits: string;
  notes: string;
  assigned_workers: Array<{
    id: string;
    name: string;
    status: "confirmed" | "pending";
  }>;
}

interface ShiftDetailsProps {
  shift: Shift;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onApply?: () => void;
  onEdit?: () => void;
}

export function ShiftDetails({
  shift,
  open,
  onOpenChange,
  onApply,
  onEdit,
}: ShiftDetailsProps) {
  const [activeTab, setActiveTab] = useState("details");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <DialogTitle>{shift.title}</DialogTitle>
              <Badge
                variant={
                  shift.status === "published"
                    ? "default"
                    : shift.status === "filled"
                    ? "secondary"
                    : "outline"
                }
              >
                {shift.status}
              </Badge>
            </div>
            <div className="flex gap-2">
              {onEdit && (
                <Button variant="outline" size="sm" onClick={onEdit}>
                  Edit
                </Button>
              )}
              {onApply && shift.status === "published" && (
                <Button size="sm" onClick={onApply}>
                  Apply
                </Button>
              )}
            </div>
          </div>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="workers">Workers</TabsTrigger>
            <TabsTrigger value="communications">Communications</TabsTrigger>
          </TabsList>

          <TabsContent value="details" className="space-y-6">
            <Card className="p-6">
              <div className="grid gap-4">
                <div className="flex flex-wrap gap-4 text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    <span>{format(new Date(shift.date), "MMMM d, yyyy")}</span>
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
                      {shift.workers_assigned}/{shift.workers_needed} Workers
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    <span>
                      {shift.venue.name}, {shift.venue.location}
                    </span>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold flex items-center gap-2">
                      <Briefcase className="h-4 w-4" />
                      Requirements
                    </h4>
                    <p className="mt-1 text-muted-foreground">
                      {shift.requirements || "No specific requirements listed"}
                    </p>
                  </div>

                  <div>
                    <h4 className="font-semibold flex items-center gap-2">
                      <Info className="h-4 w-4" />
                      Benefits
                    </h4>
                    <p className="mt-1 text-muted-foreground">
                      {shift.benefits || "No benefits listed"}
                    </p>
                  </div>

                  {shift.notes && (
                    <div>
                      <h4 className="font-semibold">Additional Notes</h4>
                      <p className="mt-1 text-muted-foreground">{shift.notes}</p>
                    </div>
                  )}
                </div>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="workers">
            <Card className="p-6">
              <div className="space-y-4">
                <h4 className="font-semibold">Assigned Workers</h4>
                {shift.assigned_workers.length === 0 ? (
                  <p className="text-muted-foreground">No workers assigned yet</p>
                ) : (
                  <div className="grid gap-2">
                    {shift.assigned_workers.map((worker) => (
                      <div
                        key={worker.id}
                        className="flex items-center justify-between p-2 rounded-lg border"
                      >
                        <span>{worker.name}</span>
                        <Badge
                          variant={
                            worker.status === "confirmed"
                              ? "default"
                              : "secondary"
                          }
                        >
                          {worker.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="communications">
            <Card className="p-6">
              <p className="text-muted-foreground">
                Communication features coming soon...
              </p>
            </Card>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}