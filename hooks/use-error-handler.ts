"use client";

import { useCallback } from 'react';
import { logError } from '@/lib/error-handler';
import type { ErrorSource, ErrorSeverity } from '@/lib/error-handler';

interface ErrorHandlerOptions {
  showToast?: boolean;
  context?: Record<string, unknown>;
}

export function useErrorHandler() {
  const handleError = useCallback((
    error: unknown,
    source: ErrorSource,
    severity: ErrorSeverity = 'MEDIUM',
    options: ErrorHandlerOptions = {}
  ) => {
    const { showToast = true, context } = options;

    logError({
      source,
      severity,
      message: error instanceof Error ? error.message : 'An unknown error occurred',
      error,
      context,
    });

    if (!showToast) {
      console.debug('Toast notification suppressed for error:', error);
    }
  }, []);

  return handleError;
}