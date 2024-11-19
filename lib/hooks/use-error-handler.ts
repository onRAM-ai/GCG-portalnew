"use client";

import { useCallback } from 'react';
import { toast } from 'sonner';
import { logError } from '@/lib/error-handler';
import type { ErrorSource, ErrorSeverity } from '@/lib/error-handler';

interface ErrorHandlerOptions {
  showToast?: boolean;
  toastMessage?: string;
}

export function useErrorHandler() {
  const handleError = useCallback((
    error: unknown,
    source: ErrorSource,
    severity: ErrorSeverity = 'MEDIUM',
    options: ErrorHandlerOptions = {}
  ) => {
    const { showToast = true, toastMessage } = options;

    // Log the error
    logError({
      source,
      severity,
      message: error instanceof Error ? error.message : 'An unknown error occurred',
      error,
    });

    // Show toast notification if enabled
    if (showToast) {
      toast.error(
        toastMessage || 'An error occurred',
        {
          description: error instanceof Error ? error.message : 'Please try again later',
        }
      );
    }
  }, []);

  return handleError;
}