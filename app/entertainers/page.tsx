"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { MapPin, Calendar, Star } from "lucide-react";
import SkimpySearch from "@/components/skimpy-search";
import Image from "next/image";

interface Skimpy {
  id: number;
  name: string;
  location: string;
  experience: number;
  rating: number;
  availability: string[];
  tags: string[];
  imageUrl: string;
}

const mockSkimpies: Skimpy[] = [
  {
    id: 1,
    name: "Alex",
    location: "Perth",
    experience: 3,
    rating: 4.8,
    availability: ["Weekends", "Evenings"],
    tags: ["Available", "Perth", "Events"],
    imageUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800&auto=format&fit=crop&q=60"
  },
  {
    id: 2,
    name: "Sam",
    location: "Kalgoorlie",
    experience: 5,
    rating: 4.9,
    availability: ["Full-time", "Weekdays"],
    tags: ["Available", "Kalgoorlie", "Full-time"],
    imageUrl: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=800&auto=format&fit=crop&q=60"
  },
  {
    id: 3,
    name: "Jordan",
    location: "Bunbury",
    experience: 2,
    rating: 4.7,
    availability: ["Weekends"],
    tags: ["Available", "Bunbury", "Part-time"],
    imageUrl: "https://images.unsplash.com/photo-1568252542512-9fe8fe9c87bb?w=800&auto=format&fit=crop&q=60"
  }
];

export default function EntertainersPage() {
  const [filteredSkimpies, setFilteredSkimpies] = useState<Skimpy[]>([]);

  const handleSearch = (query: string, location: string) => {
    const searchTerm = query.toLowerCase();
    const filtered = mockSkimpies.filter(skimpy => {
      const matchesSearch = skimpy.name.toLowerCase().includes(searchTerm) ||
        skimpy.tags.some(tag => tag.toLowerCase().includes(searchTerm));
      
      const matchesLocation = !location || 
        skimpy.location.toLowerCase() === location.toLowerCase();

      return matchesSearch && matchesLocation;
    });
    setFilteredSkimpies(filtered);
  };

  // Initialize with all entertainers
  useEffect(() => {
    setFilteredSkimpies(mockSkimpies);
  }, []);

  return (
    <div className="min-h-screen py-10 px-4">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold mb-12">Entertainers</h1>
        
        <SkimpySearch onSearch={handleSearch} />
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredSkimpies.map((skimpy) => (
            <Card key={skimpy.id} className="p-6">
              <div className="aspect-[3/4] relative mb-4 rounded-lg overflow-hidden bg-muted">
                <Image
                  src={skimpy.imageUrl}
                  alt={`${skimpy.name}'s profile`}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  priority={skimpy.id <= 3}
                />
              </div>
              <div className="space-y-4">
                <div>
                  <h3 className="text-xl font-semibold">{skimpy.name}</h3>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <MapPin className="h-4 w-4" />
                    <span>{skimpy.location}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-sm">
                  <Star className="h-4 w-4 text-yellow-400" />
                  <span>{skimpy.rating} rating</span>
                  <span className="text-muted-foreground">
                    • {skimpy.experience} years experience
                  </span>
                </div>

                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  <span>{skimpy.availability.join(" • ")}</span>
                </div>

                <div className="flex flex-wrap gap-2">
                  {skimpy.tags.map((tag) => (
                    <div
                      key={tag}
                      className="text-xs bg-primary/10 text-primary px-2 py-1 rounded"
                    >
                      {tag}
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}