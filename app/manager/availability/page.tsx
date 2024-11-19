"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Search, Calendar as CalendarIcon, Clock } from "lucide-react";
import { format } from "date-fns";
import { supabase } from "@/lib/supabase";

interface Worker {
  id: string;
  name: string;
  email: string;
  availability: {
    available_dates: string[];
    preferred_shift_types: string[];
    max_shifts_per_week: number;
    notes: string;
  };
}

export default function ManagerAvailabilityPage() {
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchWorkers();
  }, []);

  async function fetchWorkers() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Fetch workers with their availability preferences
      const { data, error } = await supabase
        .from("profiles")
        .select(`
          id,
          name,
          email,
          availability_preferences (
            available_dates,
            preferred_shift_types,
            max_shifts_per_week,
            notes
          )
        `)
        .eq("role", "worker");

      if (error) throw error;

      setWorkers(data.map(worker => ({
        id: worker.id,
        name: worker.name || worker.email,
        email: worker.email,
        availability: worker.availability_preferences || {
          available_dates: [],
          preferred_shift_types: [],
          max_shifts_per_week: 0,
          notes: ""
        }
      })));
    } catch (error) {
      console.error("Error fetching workers:", error);
    } finally {
      setLoading(false);
    }
  }

  const filteredWorkers = workers.filter(worker => {
    const matchesSearch = worker.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         worker.email.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesDate = !selectedDate || worker.availability.available_dates.includes(
      format(selectedDate, "yyyy-MM-dd")
    );

    return matchesSearch && matchesDate;
  });

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Worker Availability</h2>

      <div className="flex gap-4 flex-col md:flex-row">
        <div className="flex-1">
          <Label>Search Workers</Label>
          <div className="flex gap-2 mt-1">
            <Input
              placeholder="Search by name or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1"
            />
            <Button variant="outline">
              <Search className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="w-full md:w-auto">
          <Label>Filter by Date</Label>
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={setSelectedDate}
            className="rounded-md border mt-1"
          />
        </div>
      </div>

      <ScrollArea className="h-[calc(100vh-16rem)]">
        <div className="grid gap-4">
          {filteredWorkers.map((worker) => (
            <Card key={worker.id} className="p-6">
              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                <div>
                  <h3 className="text-lg font-semibold">{worker.name}</h3>
                  <p className="text-sm text-muted-foreground">{worker.email}</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <div className="flex items-center gap-2 text-primary mb-2">
                      <CalendarIcon className="h-4 w-4" />
                      <span className="font-medium">Available Dates</span>
                    </div>
                    <div className="space-y-1">
                      {worker.availability.available_dates.length > 0 ? (
                        worker.availability.available_dates.map((date) => (
                          <div key={date} className="text-sm">
                            {format(new Date(date), "PPP")}
                          </div>
                        ))
                      ) : (
                        <p className="text-sm text-muted-foreground">No dates set</p>
                      )}
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center gap-2 text-primary mb-2">
                      <Clock className="h-4 w-4" />
                      <span className="font-medium">Shift Preferences</span>
                    </div>
                    <div className="space-y-2">
                      <div>
                        <p className="text-sm text-muted-foreground">Preferred Shifts</p>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {worker.availability.preferred_shift_types.map((type) => (
                            <span
                              key={type}
                              className="px-2 py-0.5 bg-primary/10 text-primary rounded text-xs"
                            >
                              {type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                            </span>
                          ))}
                        </div>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Max Shifts/Week</p>
                        <p className="text-sm">{worker.availability.max_shifts_per_week}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {worker.availability.notes && (
                <div className="mt-4 pt-4 border-t">
                  <p className="text-sm text-muted-foreground">Notes</p>
                  <p className="mt-1 text-sm">{worker.availability.notes}</p>
                </div>
              )}
            </Card>
          ))}

          {filteredWorkers.length === 0 && (
            <Card className="p-6">
              <p className="text-center text-muted-foreground">
                No workers found matching your criteria
              </p>
            </Card>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}