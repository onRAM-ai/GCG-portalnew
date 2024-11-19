"use client";

import { Card } from "@/components/ui/card";
import { Users } from "lucide-react";

interface EntertainerStatsProps {
  count: number;
}

export function EntertainerStats({ count }: EntertainerStatsProps) {
  return (
    <Card className="p-6">
      <div className="flex items-center gap-2 text-primary mb-4">
        <Users className="h-5 w-5" />
        <h3 className="font-semibold">Entertainers</h3>
      </div>

      <div className="space-y-4">
        <div>
          <p className="text-sm text-muted-foreground">Total Entertainers</p>
          <p className="text-2xl font-bold">{count}</p>
        </div>
      </div>
    </Card>
  );
}