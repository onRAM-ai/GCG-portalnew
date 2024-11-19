"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { format } from "date-fns";
import { supabase } from "@/lib/supabase";
import { type Shift } from "@/lib/database.types";
import { Clock, MapPin, Users } from "lucide-react";

interface ShiftCalendarProps {
  shifts?: Shift[];
  onShiftClick?: (shift: Shift) => void;
}

export function ShiftCalendar({ shifts: propShifts, onShiftClick }: ShiftCalendarProps) {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [shifts, setShifts] = useState<Shift[]>(propShifts || []);
  const [loading, setLoading] = useState(!propShifts);

  useEffect(() => {
    if (!propShifts) {
      loadShifts();
    }
  }, [propShifts, selectedDate]);

  const loadShifts = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('shifts')
        .select(`
          *,
          venue:venues (
            name,
            address
          )
        `)
        .gte('start_time', format(selectedDate, 'yyyy-MM-dd'))
        .lte('start_time', format(selectedDate, 'yyyy-MM-dd 23:59:59'));

      if (error) throw error;
      setShifts(data || []);
    } catch (error) {
      console.error('Error loading shifts:', error);
    } finally {
      setLoading(false);
    }
  };

  const shiftsForDate = shifts.filter(shift => 
    format(new Date(shift.start_time), 'yyyy-MM-dd') === format(selectedDate, 'yyyy-MM-dd')
  );

  return (
    <div className="grid grid-cols-1 md:grid-cols-[300px,1fr] gap-6">
      <Card className="p-4">
        <Calendar
          mode="single"
          selected={selectedDate}
          onSelect={(date) => date && setSelectedDate(date)}
          className="rounded-md border"
        />
      </Card>

      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">
          Shifts for {format(selectedDate, "MMMM d, yyyy")}
        </h3>

        <ScrollArea className="h-[500px] pr-4">
          <div className="space-y-4">
            {loading ? (
              <p className="text-center text-muted-foreground">Loading shifts...</p>
            ) : shiftsForDate.length === 0 ? (
              <p className="text-center text-muted-foreground">
                No shifts scheduled for this date
              </p>
            ) : (
              shiftsForDate.map((shift) => (
                <Card
                  key={shift.id}
                  className="p-4 hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => onShiftClick?.(shift)}
                >
                  <div className="flex items-start justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <h4 className="font-semibold">{shift.role}</h4>
                        <Badge variant={
                          shift.status === 'confirmed' ? 'default' :
                          shift.status === 'pending' ? 'secondary' :
                          'outline'
                        }>
                          {shift.status}
                        </Badge>
                      </div>

                      <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          <span>
                            {format(new Date(shift.start_time), "h:mm a")} - 
                            {format(new Date(shift.end_time), "h:mm a")}
                          </span>
                        </div>
                        {shift.venue && (
                          <div className="flex items-center gap-1">
                            <MapPin className="h-4 w-4" />
                            <span>{shift.venue.name}</span>
                          </div>
                        )}
                        {shift.employee_name && (
                          <div className="flex items-center gap-1">
                            <Users className="h-4 w-4" />
                            <span>{shift.employee_name}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </Card>
              ))
            )}
          </div>
        </ScrollArea>
      </Card>
    </div>
  );
}