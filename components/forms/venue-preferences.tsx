"use client";

import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { VENUES } from "@/lib/constants/venues";

interface VenuePreferencesProps {
  selectedVenues: string[];
  onVenueChange: (venues: string[]) => void;
}

export function VenuePreferences({ selectedVenues, onVenueChange }: VenuePreferencesProps) {
  const handleVenueToggle = (venueId: string, checked: boolean) => {
    if (checked) {
      onVenueChange([...selectedVenues, venueId]);
    } else {
      onVenueChange(selectedVenues.filter(id => id !== venueId));
    }
  };

  return (
    <div className="space-y-4">
      <Label htmlFor="venues" className="text-sm font-medium">
        Preferred Venues
      </Label>
      <ScrollArea className="h-[200px] rounded-md border p-4">
        <div className="space-y-4">
          {VENUES.map((venue) => (
            <div key={venue.id} className="flex items-start space-x-3">
              <Checkbox
                id={venue.id}
                checked={selectedVenues.includes(venue.id)}
                onCheckedChange={(checked) => 
                  handleVenueToggle(venue.id, checked as boolean)
                }
              />
              <div className="grid gap-1.5 leading-none">
                <label
                  htmlFor={venue.id}
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  {venue.name}
                </label>
                <p className="text-sm text-muted-foreground">
                  {venue.address}
                </p>
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
      {selectedVenues.length > 0 && (
        <p className="text-sm text-muted-foreground">
          {selectedVenues.length} venue{selectedVenues.length === 1 ? '' : 's'} selected
        </p>
      )}
    </div>
  );
}