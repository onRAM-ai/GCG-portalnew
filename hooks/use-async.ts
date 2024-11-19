"use client";

import { useState, useCallback } from "react";
import { logError } from "@/lib/error-logger";
import { toast } from "sonner";

interface AsyncState<T> {
  data: T | null;
  error: Error | null;
  loading: boolean;
}

export function useAsync<T>(
  asyncFunction: () => Promise<T>,
  immediate = true
) {
  const [state, setState] = useState<AsyncState<T>>({
    data: null,
    error: null,
    loading: immediate,
  });

  const execute = useCallback(async () => {
    setState({ data: null, error: null, loading: true });

    try {
      const data = await asyncFunction();
      setState({ data, error: null, loading: false });
      return data;
    } catch (error) {
      const err = error as Error;
      setState({ data: null, error: err, loading: false });
      logError(err);
      toast.error("An error occurred", {
        description: err.message || "Please try again later",
      });
      throw err;
    }
  }, [asyncFunction]);

  useState(() => {
    if (immediate) {
      execute();
    }
  });

  return {
    ...state,
    execute,
    reset: () =>
      setState({ data: null, error: null, loading: false }),
  };
}