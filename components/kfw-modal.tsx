"use client";

import { useState, useEffect, useCallback } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { saveAvailabilityPreferences, getAvailabilityPreferences } from "@/lib/availability";

interface KFWModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const venues = [
  { id: "exchange-hotel", label: "The Exchange Hotel", suburb: "Kalgoorlie" },
  { id: "palace-hotel", label: "Palace Hotel", suburb: "Kalgoorlie" },
  { id: "recreation-hotel", label: "Recreation Hotel", suburb: "Boulder" },
  { id: "grand-hotel", label: "Grand Hotel", suburb: "Kalgoorlie" },
];

const suburbs = ["Kalgoorlie", "Boulder", "Perth", "Bunbury", "Albany"];

const shiftTypes = [
  { id: "day", label: "Day Shift (10am - 6pm)" },
  { id: "evening", label: "Evening Shift (6pm - 2am)" },
  { id: "night", label: "Night Shift (10pm - 6am)" },
];

export function KFWModal({ open, onOpenChange }: KFWModalProps) {
  const [selectedDates, setSelectedDates] = useState<Date[]>([]);
  const [selectedSuburbs, setSelectedSuburbs] = useState<string[]>([]);
  const [selectedVenues, setSelectedVenues] = useState<string[]>([]);
  const [selectedShiftTypes, setSelectedShiftTypes] = useState<string[]>([]);
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const loadPreferences = useCallback(async () => {
    try {
      const preferences = await getAvailabilityPreferences();
      if (preferences) {
        setSelectedDates(preferences.available_dates);
        setSelectedSuburbs(preferences.preferred_suburbs);
        setSelectedVenues(preferences.preferred_venues);
        setSelectedShiftTypes(preferences.preferred_shift_types);
        setNotes(preferences.notes || "");
      }
    } catch (error: any) {
      console.error("Error loading preferences:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load your preferences"
      });
    }
  }, [toast]);

  useEffect(() => {
    if (open) {
      loadPreferences();
    }
  }, [open, loadPreferences]);

  const handleSubmit = async () => {
    setLoading(true);
    try {
      await saveAvailabilityPreferences({
        available_dates: selectedDates,
        preferred_suburbs: selectedSuburbs,
        preferred_venues: selectedVenues,
        preferred_shift_types: selectedShiftTypes,
        notes
      });

      toast({
        title: "Success",
        description: "Your availability preferences have been saved"
      });
      onOpenChange(false);
    } catch (error: any) {
      console.error("Error saving preferences:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to save preferences"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>Set Your Work Preferences</DialogTitle>
        </DialogHeader>

        <ScrollArea className="h-[calc(90vh-8rem)] pr-4">
          <div className="grid gap-6 py-4">
            <div className="space-y-2">
              <Label>Available Dates</Label>
              <Calendar
                mode="multiple"
                selected={selectedDates}
                onSelect={setSelectedDates as any}
                className="rounded-md border"
                disabled={(date) => date < new Date()}
              />
            </div>

            <div className="space-y-2">
              <Label>Preferred Suburbs</Label>
              <ScrollArea className="h-32 rounded-md border p-4">
                <div className="space-y-2">
                  {suburbs.map((suburb) => (
                    <div key={suburb} className="flex items-center space-x-2">
                      <Checkbox
                        id={`suburb-${suburb}`}
                        checked={selectedSuburbs.includes(suburb)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setSelectedSuburbs([...selectedSuburbs, suburb]);
                          } else {
                            setSelectedSuburbs(selectedSuburbs.filter((s) => s !== suburb));
                          }
                        }}
                      />
                      <label
                        htmlFor={`suburb-${suburb}`}
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        {suburb}
                      </label>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>

            <div className="space-y-2">
              <Label>Preferred Venues</Label>
              <ScrollArea className="h-32 rounded-md border p-4">
                <div className="space-y-2">
                  {venues.map((venue) => (
                    <div key={venue.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={venue.id}
                        checked={selectedVenues.includes(venue.id)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setSelectedVenues([...selectedVenues, venue.id]);
                          } else {
                            setSelectedVenues(selectedVenues.filter((v) => v !== venue.id));
                          }
                        }}
                      />
                      <label
                        htmlFor={venue.id}
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        {venue.label} ({venue.suburb})
                      </label>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>

            <div className="space-y-2">
              <Label>Preferred Shift Types</Label>
              <ScrollArea className="h-32 rounded-md border p-4">
                <div className="space-y-2">
                  {shiftTypes.map((shift) => (
                    <div key={shift.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={shift.id}
                        checked={selectedShiftTypes.includes(shift.id)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setSelectedShiftTypes([...selectedShiftTypes, shift.id]);
                          } else {
                            setSelectedShiftTypes(selectedShiftTypes.filter((s) => s !== shift.id));
                          }
                        }}
                      />
                      <label
                        htmlFor={shift.id}
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        {shift.label}
                      </label>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>

            <div className="space-y-2">
              <Label>Additional Notes</Label>
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Any additional information about your availability..."
                className="min-h-[100px]"
              />
            </div>

            <Button onClick={handleSubmit} className="w-full" disabled={loading}>
              {loading ? "Saving..." : "Submit Preferences"}
            </Button>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}