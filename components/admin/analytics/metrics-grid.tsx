"use client";

import { Card } from "@/components/ui/card";
import { 
  TrendingUp, 
  Users, 
  Building, 
  DollarSign,
  ArrowUpRight,
  ArrowDownRight
} from "lucide-react";

interface MetricsGridProps {
  data: {
    bookings: any[];
    venues: any[];
    users: any[];
    revenue: any[];
  };
}

export function MetricsGrid({ data }: MetricsGridProps) {
  const metrics = [
    {
      title: "Total Bookings",
      value: data.bookings.length,
      change: "+12.3%",
      trend: "up",
      icon: TrendingUp,
    },
    {
      title: "Active Users",
      value: data.users.length,
      change: "+5.2%",
      trend: "up",
      icon: Users,
    },
    {
      title: "Active Venues",
      value: data.venues.length,
      change: "-2.1%",
      trend: "down",
      icon: Building,
    },
    {
      title: "Total Revenue",
      value: `$${data.revenue.reduce((sum, item) => sum + (item.amount || 0), 0).toLocaleString()}`,
      change: "+8.4%",
      trend: "up",
      icon: DollarSign,
    },
  ];

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
      {metrics.map((metric) => (
        <Card key={metric.title} className="p-6">
          <div className="flex items-center justify-between">
            <metric.icon className="h-5 w-5 text-muted-foreground" />
            <div className={`flex items-center text-sm ${
              metric.trend === "up" ? "text-green-500" : "text-red-500"
            }`}>
              {metric.change}
              {metric.trend === "up" ? (
                <ArrowUpRight className="h-4 w-4 ml-1" />
              ) : (
                <ArrowDownRight className="h-4 w-4 ml-1" />
              )}
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-2xl font-bold">{metric.value}</h3>
            <p className="text-sm text-muted-foreground">{metric.title}</p>
          </div>
        </Card>
      ))}
    </div>
  );
}