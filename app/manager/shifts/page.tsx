"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Calendar as CalendarIcon, List } from "lucide-react";
import { ShiftForm } from "@/components/shifts/shift-form";
import { ShiftCalendar } from "@/components/shifts/shift-calendar";
import { ShiftList } from "@/components/shifts/shift-list";
import { ShiftDetails } from "@/components/shifts/shift-details";

const mockShifts = [
  {
    id: "1",
    title: "Evening Bar Service",
    venue: {
      name: "The Exchange Hotel",
      location: "Kalgoorlie",
    },
    date: "2024-03-28",
    start_time: "2024-03-28T18:00:00",
    end_time: "2024-03-28T23:00:00",
    workers_needed: 2,
    workers_assigned: 1,
    status: "published" as const,
    requirements: "RSA Certificate required",
    benefits: "Competitive hourly rate + tips",
    notes: "Busy night expected",
    assigned_workers: [
      {
        id: "w1",
        name: "Sarah Johnson",
        status: "confirmed" as const,
      },
    ],
  },
  // Add more mock shifts as needed
];

export default function ShiftsPage() {
  const [view, setView] = useState("calendar");
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedShift, setSelectedShift] = useState<typeof mockShifts[0] | null>(
    null
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Shift Management</h2>
        <Button onClick={() => setShowCreateForm(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Create Shift
        </Button>
      </div>

      <Tabs value={view} onValueChange={setView}>
        <TabsList>
          <TabsTrigger value="calendar" className="flex items-center gap-2">
            <CalendarIcon className="h-4 w-4" />
            Calendar View
          </TabsTrigger>
          <TabsTrigger value="list" className="flex items-center gap-2">
            <List className="h-4 w-4" />
            List View
          </TabsTrigger>
        </TabsList>

        <TabsContent value="calendar" className="mt-6">
          <ShiftCalendar
            shifts={mockShifts}
            onShiftClick={(shift) => setSelectedShift(shift)}
          />
        </TabsContent>

        <TabsContent value="list" className="mt-6">
          <ShiftList
            shifts={mockShifts}
            onShiftClick={(shift) => setSelectedShift(shift)}
          />
        </TabsContent>
      </Tabs>

      <ShiftForm
        open={showCreateForm}
        onOpenChange={setShowCreateForm}
        onSuccess={() => {
          // Refresh shifts data
        }}
      />

      {selectedShift && (
        <ShiftDetails
          shift={selectedShift}
          open={!!selectedShift}
          onOpenChange={(open) => !open && setSelectedShift(null)}
          onEdit={() => {
            // Handle edit
          }}
        />
      )}
    </div>
  );
}