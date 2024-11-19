"use client";

import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Edit2, Trash2, Search, Building } from "lucide-react";
import { type Database } from "@/lib/database.types";
import { VenueDialog } from "./venue-dialog";
import { DeleteVenueDialog } from "./delete-venue-dialog";

type Venue = Database['public']['Tables']['venues']['Row'];

interface VenueTableProps {
  venues: Venue[];
  onUpdate: () => void;
}

export function VenueTable({ venues, onUpdate }: VenueTableProps) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedVenue, setSelectedVenue] = useState<Venue | null>(null);
  const [showVenueDialog, setShowVenueDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const filteredVenues = venues.filter((venue) => {
    const matchesSearch =
      venue.name.toLowerCase().includes(search.toLowerCase()) ||
      venue.address.toLowerCase().includes(search.toLowerCase());

    const matchesStatus = statusFilter === "all" || venue.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <>
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search venues..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex gap-2">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={() => {
            setSelectedVenue(null);
            setShowVenueDialog(true);
          }}>
            <Building className="h-4 w-4 mr-2" />
            Add Venue
          </Button>
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Address</TableHead>
              <TableHead>Owner</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Managers</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredVenues.map((venue) => (
              <TableRow key={venue.id}>
                <TableCell className="font-medium">{venue.name}</TableCell>
                <TableCell>{venue.address}</TableCell>
                <TableCell>
                  {venue.owner?.first_name} {venue.owner?.last_name}
                </TableCell>
                <TableCell>
                  <Badge variant={
                    venue.status === "active" ? "default" :
                    venue.status === "pending" ? "secondary" :
                    "outline"
                  }>
                    {venue.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  {venue.managers?.length || 0} managers
                </TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setSelectedVenue(venue);
                      setShowVenueDialog(true);
                    }}
                  >
                    <Edit2 className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setSelectedVenue(venue);
                      setShowDeleteDialog(true);
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <VenueDialog
        venue={selectedVenue}
        open={showVenueDialog}
        onOpenChange={setShowVenueDialog}
        onSuccess={onUpdate}
      />

      <DeleteVenueDialog
        venue={selectedVenue}
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        onSuccess={onUpdate}
      />
    </>
  );
}