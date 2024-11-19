"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar, Clock, Users, MapPin, Search } from "lucide-react";
import { format } from "date-fns";
import { type Database } from "@/lib/database.types";
import { ShiftDetailsDialog } from "./shift-details-dialog";

type Shift = Database['public']['Tables']['shifts']['Row'];

interface ShiftListProps {
  shifts: Shift[];
  onShiftUpdate: () => void;
}

export function ShiftList({ shifts, onShiftUpdate }: ShiftListProps) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedShift, setSelectedShift] = useState<Shift | null>(null);

  const filteredShifts = shifts.filter((shift) => {
    const matchesSearch =
      shift.venue?.name?.toLowerCase().includes(search.toLowerCase()) ||
      shift.role?.toLowerCase().includes(search.toLowerCase());

    const matchesStatus = statusFilter === "all" || shift.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <>
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search shifts..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="confirmed">Confirmed</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-4">
        {filteredShifts.map((shift) => (
          <Card
            key={shift.id}
            className="p-6 hover:shadow-md transition-shadow cursor-pointer"
            onClick={() => setSelectedShift(shift)}
          >
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-semibold">
                    {shift.venue?.name} - {shift.role}
                  </h3>
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

                <div className="flex flex-wrap gap-4 text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    <span>
                      {format(new Date(shift.start_time), "MMM d, yyyy")}
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
                      {shift.assignments?.length || 0} /{" "}
                      {shift.spots_available} Workers
                    </span>
                  </div>
                  {shift.venue?.address && (
                    <div className="flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      <span>{shift.venue.address}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex gap-2">
                <Button variant="outline" size="sm">
                  View Details
                </Button>
                {shift.status === "pending" && (
                  <Button size="sm">Assign Workers</Button>
                )}
              </div>
            </div>
          </Card>
        ))}

        {filteredShifts.length === 0 && (
          <Card className="p-6">
            <p className="text-center text-muted-foreground">No shifts found</p>
          </Card>
        )}
      </div>

      <ShiftDetailsDialog
        shift={selectedShift}
        open={!!selectedShift}
        onOpenChange={(open) => !open && setSelectedShift(null)}
        onUpdate={onShiftUpdate}
      />
    </>
  );
}