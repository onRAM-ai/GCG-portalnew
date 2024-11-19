"use client";

import { ShiftForm } from "@/components/shifts/ShiftForm";
import { useRequireAuth } from "@/lib/auth/hooks";
import { Loader2 } from "lucide-react";

export default function CreateShiftPage() {
  const { loading } = useRequireAuth(['admin', 'venue']);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-2xl font-bold mb-6">Create New Shift</h1>
      <ShiftForm />
    </div>
  );
}