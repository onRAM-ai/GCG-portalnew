"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { getBookings } from "@/lib/bookings";
import { supabase } from "@/lib/supabase";
import { format } from "date-fns";
import { CalendarIcon, MapPin } from "lucide-react";

interface Booking {
  id: string;
  start_time: string;
  end_time: string;
  status: string;
  venues: {
    name: string;
    address: string;
  };
}

export default function BookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadBookings() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const data = await getBookings(user.id);
        setBookings(data);
      } catch (error) {
        console.error('Error loading bookings:', error);
      } finally {
        setLoading(false);
      }
    }

    loadBookings();
  }, []);

  if (loading) {
    return <div>Loading bookings...</div>;
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Your Bookings</h2>
      
      {bookings.length === 0 ? (
        <Card className="p-6">
          <p className="text-muted-foreground">No bookings found</p>
        </Card>
      ) : (
        <div className="grid gap-4">
          {bookings.map((booking) => (
            <Card key={booking.id} className="p-6">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <h3 className="font-semibold">{booking.venues.name}</h3>
                  <div className="flex items-center text-muted-foreground">
                    <MapPin className="h-4 w-4 mr-1" />
                    <span>{booking.venues.address}</span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="flex items-center text-primary">
                    <CalendarIcon className="h-4 w-4 mr-1" />
                    <span>
                      {format(new Date(booking.start_time), "PPP")}
                    </span>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {format(new Date(booking.start_time), "p")} - 
                    {format(new Date(booking.end_time), "p")}
                  </div>
                  <div className="mt-2">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      booking.status === 'confirmed' 
                        ? 'bg-green-100 text-green-800'
                        : booking.status === 'pending'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                    </span>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}