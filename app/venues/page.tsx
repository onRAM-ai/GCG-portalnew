"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { MapPin, Users } from "lucide-react";
import VenueSearch from "@/components/venue-search";
import { venues } from "@/lib/data/venues";
import type { Venue } from "@/types/venues";
import Image from "next/image";

export default function VenuesPage() {
  const [filteredVenues, setFilteredVenues] = useState<Venue[]>([]);

  const handleSearch = (query: string, location: string) => {
    const searchTerm = query.toLowerCase();
    const filtered = venues.filter(venue => {
      const matchesSearch = venue.name.toLowerCase().includes(searchTerm) ||
        venue.type.toLowerCase().includes(searchTerm);
      
      const matchesLocation = !location || 
        venue.suburb.toLowerCase() === location.toLowerCase();

      return matchesSearch && matchesLocation;
    });
    setFilteredVenues(filtered);
  };

  // Initialize with all venues
  useEffect(() => {
    setFilteredVenues(venues);
  }, []);

  return (
    <div className="min-h-screen py-10 px-4">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold mb-8">Venues</h1>
        <p className="text-xl text-muted-foreground mb-12">
          Discover entertainment venues across Western Australia
        </p>

        <VenueSearch onSearch={handleSearch} />
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredVenues.map((venue) => (
            <Card key={venue.id} className="overflow-hidden group">
              <div className="relative aspect-[4/3]">
                <Image
                  src={venue.imageUrl}
                  alt={venue.name}
                  fill
                  className="object-cover transition-transform group-hover:scale-105"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                />
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-xl font-semibold">{venue.name}</h3>
                    <span className="text-sm text-primary font-medium px-2 py-1 bg-primary/10 rounded">
                      {venue.type}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <MapPin className="h-4 w-4" />
                    <span>{venue.address}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-muted-foreground">
                  <Users className="h-4 w-4" />
                  <span>Capacity: {venue.capacity}</span>
                </div>

                <div className="space-y-2">
                  <h4 className="font-medium">Amenities</h4>
                  <div className="flex flex-wrap gap-2">
                    {venue.amenities.slice(0, 3).map((amenity) => (
                      <span
                        key={amenity}
                        className="text-xs bg-secondary px-2 py-1 rounded"
                      >
                        {amenity}
                      </span>
                    ))}
                    {venue.amenities.length > 3 && (
                      <span className="text-xs text-muted-foreground">
                        +{venue.amenities.length - 3} more
                      </span>
                    )}
                  </div>
                </div>

                <p className="text-sm text-muted-foreground">
                  {venue.description}
                </p>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}