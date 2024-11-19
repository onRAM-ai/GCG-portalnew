"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { venues } from "@/lib/data/venues";

interface VenueSearchProps {
  onSearch: (query: string, location: string) => void;
}

export default function VenueSearch({ onSearch }: VenueSearchProps) {
  const [query, setQuery] = useState("");
  const [location, setLocation] = useState("all");
  
  // Get unique suburbs from venues
  const suburbs = Array.from(new Set(venues.map(venue => venue.suburb))).sort();

  const handleSearch = () => {
    onSearch(query, location === "all" ? "" : location);
  };

  return (
    <div className="flex flex-col md:flex-row gap-4 max-w-xl mx-auto mb-8">
      <div className="flex-1 flex gap-2">
        <Input
          type="text"
          placeholder="Search by venue name or type..."
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            onSearch(e.target.value, location === "all" ? "" : location);
          }}
          className="flex-1"
        />
      </div>
      <div className="flex gap-2">
        <Select 
          value={location} 
          onValueChange={(value) => {
            setLocation(value);
            onSearch(query, value === "all" ? "" : value);
          }}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Location" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Locations</SelectItem>
            {suburbs.map(suburb => (
              <SelectItem key={suburb} value={suburb.toLowerCase()}>
                {suburb}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button variant="ghost" onClick={handleSearch}>
          <Search className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}