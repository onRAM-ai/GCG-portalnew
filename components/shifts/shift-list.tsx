"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar, Clock, Users, MapPin, Search, Filter } from "lucide-react";
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
}

interface ShiftListProps {
  shifts: Shift[];
  onShiftClick: (shift: Shift) => void;
}

export function ShiftList({ shifts, onShiftClick }: ShiftListProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [dateFilter, setDateFilter] = useState<string>("all");

  const filteredShifts = shifts.filter((shift) => {
    const matchesSearch =
      shift.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      shift.venue.name.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus =
      statusFilter === "all" || shift.status === statusFilter;

    const matchesDate = dateFilter === "all" || (() => {
      const shiftDate = new Date(shift.date);
      const today = new Date();
      switch (dateFilter) {
        case "today":
          return format(shiftDate, "yyyy-MM-dd") === format(today, "yyyy-MM-dd");
        case "week":
          const weekFromNow = new Date(today.setDate(today.getDate() + 7));
          return shiftDate <= weekFromNow;
        case "month":
          const monthFromNow = new Date(today.setMonth(today.getMonth() + 1));
          return shiftDate <= monthFromNow;
        default:
          return true;
      }
    })();

    return matchesSearch && matchesStatus && matchesDate;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search shifts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        <div className="flex gap-2">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="published">Published</SelectItem>
              <SelectItem value="filled">Filled</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
            </SelectContent>
          </Select>
          <Select value={dateFilter} onValueChange={setDateFilter}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Date" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Dates</SelectItem>
              <SelectItem value="today">Today</SelectItem>
              <SelectItem value="week">Next 7 Days</SelectItem>
              <SelectItem value="month">Next 30 Days</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid gap-4">
        {filteredShifts.length === 0 ? (
          <Card className="p-8 text-center">
            <p className="text-muted-foreground">No shifts found</p>
          </Card>
        ) : (
          filteredShifts.map((shift) => (
            <Card
              key={shift.id}
              className="p-6 hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => onShiftClick(shift)}
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-semibold">{shift.title}</h3>
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

                  <div className="flex flex-wrap gap-4 text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      <span>{format(new Date(shift.date), "MMM d, yyyy")}</span>
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
                </div>

                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    View Details
                  </Button>
                  {shift.status === "published" && (
                    <Button size="sm">Apply Now</Button>
                  )}
                </div>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}