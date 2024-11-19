import { Card } from "@/components/ui/card";
import { Calendar as CalendarIcon, MapPin } from "lucide-react";

export default function DatesPage() {
  return (
    <div className="min-h-screen py-10 px-4">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold mb-8">Upcoming Dates</h1>
        <p className="text-xl text-muted-foreground mb-12">
          Browse and book upcoming events
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Placeholder cards - will be replaced with actual data */}
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i} className="p-6">
              <div className="flex items-center gap-2 text-primary mb-4">
                <CalendarIcon className="h-5 w-5" />
                <span className="font-semibold">
                  {new Date(2024, 0, i).toLocaleDateString('en-US', {
                    weekday: 'long',
                    month: 'long',
                    day: 'numeric'
                  })}
                </span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Event {i}</h3>
              <div className="flex items-center gap-2 text-muted-foreground mb-4">
                <MapPin className="h-4 w-4" />
                <span>Venue {i}, Perth</span>
              </div>
              <div className="text-sm text-muted-foreground">
                <p>Time: 6:00 PM - 11:00 PM</p>
                <p>Spots Available: {3 - (i % 3)}</p>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}