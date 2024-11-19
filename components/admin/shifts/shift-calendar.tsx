"use client";

import { useCallback } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import { Card } from "@/components/ui/card";
import { type Database } from "@/lib/database.types";
import { format } from "date-fns";

type Shift = Database['public']['Tables']['shifts']['Row'];

interface ShiftCalendarProps {
  shifts: Shift[];
  onShiftUpdate: () => void;
}

export function ShiftCalendar({ shifts, onShiftUpdate }: ShiftCalendarProps) {
  const events = shifts.map(shift => ({
    id: shift.id,
    title: `${shift.venue?.name || 'Unnamed Venue'} - ${shift.role}`,
    start: shift.start_time,
    end: shift.end_time,
    backgroundColor: getShiftColor(shift.status),
    borderColor: getShiftColor(shift.status),
    extendedProps: {
      shift,
    },
  }));

  const handleEventClick = useCallback((info: any) => {
    const shift = info.event.extendedProps.shift;
    // TODO: Open shift details dialog
    console.log("Clicked shift:", shift);
  }, []);

  const handleDateSelect = useCallback((selectInfo: any) => {
    // TODO: Open create shift dialog with pre-filled date/time
    console.log("Selected date range:", {
      start: selectInfo.start,
      end: selectInfo.end,
    });
  }, []);

  return (
    <Card className="p-4">
      <FullCalendar
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
        initialView="timeGridWeek"
        headerToolbar={{
          left: "prev,next today",
          center: "title",
          right: "dayGridMonth,timeGridWeek,timeGridDay",
        }}
        editable={true}
        selectable={true}
        selectMirror={true}
        dayMaxEvents={true}
        weekends={true}
        events={events}
        eventClick={handleEventClick}
        select={handleDateSelect}
        height="auto"
        aspectRatio={1.8}
        expandRows={true}
        stickyHeaderDates={true}
        nowIndicator={true}
        slotMinTime="06:00:00"
        slotMaxTime="24:00:00"
        allDaySlot={false}
        slotDuration="00:30:00"
        slotLabelInterval="01:00"
        slotLabelFormat={{
          hour: "numeric",
          minute: "2-digit",
          meridiem: "short",
        }}
        eventTimeFormat={{
          hour: "numeric",
          minute: "2-digit",
          meridiem: "short",
        }}
        views={{
          timeGridWeek: {
            titleFormat: { year: "numeric", month: "short", day: "numeric" },
          },
        }}
      />
    </Card>
  );
}

function getShiftColor(status: string): string {
  switch (status) {
    case "pending":
      return "#FFA500"; // Orange
    case "confirmed":
      return "#10B981"; // Green
    case "cancelled":
      return "#EF4444"; // Red
    case "completed":
      return "#6B7280"; // Gray
    default:
      return "#3B82F6"; // Blue
  }
}