"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar as CalendarIcon, List } from "lucide-react";
import { ShiftCalendar } from "@/components/shifts/shift-calendar";
import { ShiftList } from "@/components/shifts/shift-list";
import { useRequireAuth } from "@/lib/auth/hooks";
import { LoadingScreen } from "@/components/ui/loading-screen";

export default function DashboardPage() {
  const [view, setView] = useState<"calendar" | "list">("calendar");
  const { loading } = useRequireAuth(['user']);

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <div className="container mx-auto py-10">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">Dashboard</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="md:col-span-3">
          <Tabs value={view} onValueChange={(v) => setView(v as "calendar" | "list")}>
            <TabsList className="w-full justify-start border-b rounded-none p-0">
              <TabsTrigger
                value="calendar"
                className="data-[state=active]:bg-primary/10 rounded-none border-b-2 border-transparent data-[state=active]:border-primary"
              >
                <CalendarIcon className="h-4 w-4 mr-2" />
                Calendar View
              </TabsTrigger>
              <TabsTrigger
                value="list"
                className="data-[state=active]:bg-primary/10 rounded-none border-b-2 border-transparent data-[state=active]:border-primary"
              >
                <List className="h-4 w-4 mr-2" />
                List View
              </TabsTrigger>
            </TabsList>

            <TabsContent value="calendar" className="m-0">
              <ShiftCalendar />
            </TabsContent>

            <TabsContent value="list" className="m-0">
              <ShiftList />
            </TabsContent>
          </Tabs>
        </Card>

        <div className="space-y-6">
          <Card className="p-6">
            <h2 className="text-lg font-semibold mb-4">Upcoming Shifts</h2>
            {/* Add UpcomingShifts component here */}
          </Card>

          <Card className="p-6">
            <h2 className="text-lg font-semibold mb-4">Quick Stats</h2>
            {/* Add QuickStats component here */}
          </Card>
        </div>
      </div>
    </div>
  );
}