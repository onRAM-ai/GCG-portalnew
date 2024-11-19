"use client";

import { Card } from "@/components/ui/card";
import { Crown } from "lucide-react";

interface VenueStatsProps {
  count: number;
}

export function VenueStats({ count }: VenueStatsProps) {
  return (
    <Card className="p-6">
      <div className="flex items-center gap-2 text-primary mb-4">
        <Crown className="h-5 w-5" />
        <h3 className="font-semibold">Venues</h3>
      </div>

      <div className="space-y-4">
        <div>
          <p className="text-sm text-muted-foreground">Total Venues</p>
          <p className="text-2xl font-bold">{count}</p>
        </div>
      </div>
    </Card>
  );
}