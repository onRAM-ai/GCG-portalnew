"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";

// Add specific error types
type ExtendedError = Error & { 
  digest?: string;
  statusCode?: number;
  code?: string;
};

interface ErrorBoundaryProps {
  error: ExtendedError;
  reset: () => void;
}

export default function ErrorBoundary({ error, reset }: ErrorBoundaryProps) {
  useEffect(() => {
    // Add structured error logging
    const errorDetails = {
      message: error.message,
      digest: error.digest,
      statusCode: error.statusCode,
      code: error.code,
      stack: error.stack,
    };
    console.error("Application error:", errorDetails);
  }, [error]);

  // Add user-friendly error messages
  const getErrorMessage = (error: ExtendedError) => {
    if (error.statusCode === 404) return "The requested resource was not found";
    if (error.statusCode === 403) return "You don't have permission to access this";
    return error.message || "An unexpected error occurred";
  };

  return (
    <Card className="p-6 max-w-md mx-auto mt-20">
      <div className="flex flex-col items-center text-center space-y-4">
        <AlertCircle className="h-12 w-12 text-destructive" aria-hidden="true" />
        <div className="space-y-2">
          <h2 className="text-lg font-semibold">Something went wrong</h2>
          <p className="text-sm text-muted-foreground" role="alert">
            {getErrorMessage(error)}
          </p>
        </div>
        <Button onClick={() => {
          reset();
          // Add analytics event
          console.log('Error boundary reset attempted');
        }}
        aria-label="Try again">
          Try again
        </Button>
      </div>
    </Card>
  );
}