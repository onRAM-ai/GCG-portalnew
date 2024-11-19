"use client";

import { Card } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

interface VenueMetricsProps {
  data: any[];
}

export function VenueMetrics({ data }: VenueMetricsProps) {
  const topVenues = data
    .sort((a, b) => (b.bookings?.length || 0) - (a.bookings?.length || 0))
    .slice(0, 5);

  return (
    <Card className="p-6">
      <h2 className="text-lg font-semibold mb-4">Top Performing Venues</h2>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Venue</TableHead>
            <TableHead>Bookings</TableHead>
            <TableHead>Revenue</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {topVenues.map((venue) => (
            <TableRow key={venue.id}>
              <TableCell className="font-medium">{venue.name}</TableCell>
              <TableCell>{venue.bookings?.length || 0}</TableCell>
              <TableCell>
                ${venue.revenue?.sum?.toLocaleString() || "0"}
              </TableCell>
              <TableCell>
                <Badge
                  variant={
                    venue.status === "active"
                      ? "default"
                      : venue.status === "pending"
                      ? "secondary"
                      : "outline"
                  }
                >
                  {venue.status}
                </Badge>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Card>
  );
}