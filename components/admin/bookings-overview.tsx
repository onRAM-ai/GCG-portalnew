"use client";

import { Card } from "@/components/ui/card";
import { Calendar } from "lucide-react";

interface BookingsOverviewProps {
  count: number;
}

export function BookingsOverview({ count }: BookingsOverviewProps) {
  return (
    <Card className="p-6">
      <div className="flex items-center gap-2 text-primary mb-4">
        <Calendar className="h-5 w-5" />
        <h3 className="font-semibold">Bookings Overview</h3>
      </div>

      <div className="space-y-4">
        <div>
          <p className="text-sm text-muted-foreground">Total Bookings</p>
          <p className="text-2xl font-bold">{count}</p>
        </div>
      </div>
    </Card>
  );
}