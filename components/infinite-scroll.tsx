"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useInView } from "react-intersection-observer";
import { Loader2 } from "lucide-react";

interface InfiniteScrollProps<T> {
  items: T[];
  loadMore: () => Promise<void>;
  hasMore: boolean;
  loading?: boolean;
  threshold?: number;
  children: (items: T[]) => React.ReactNode;
  onError?: (error: Error) => void;
}

export function InfiniteScroll<T>({
  items,
  loadMore,
  hasMore,
  loading = false,
  threshold = 0.5,
  children,
  onError,
}: InfiniteScrollProps<T>) {
  const [loadingMore, setLoadingMore] = useState(false);
  const loadingRef = useRef(false);
  
  // Add error handling
  const [error, setError] = useState<Error | null>(null);

  const { ref, inView } = useInView({
    threshold,
    rootMargin: '100px',
  });

  const handleLoadMore = useCallback(async () => {
    if (loadingRef.current) return;
    
    loadingRef.current = true;
    setLoadingMore(true);
    setError(null);

    try {
      await loadMore();
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to load more items');
      setError(error);
      onError?.(error);
    } finally {
      setLoadingMore(false);
      loadingRef.current = false;
    }
  }, [loadMore, onError]);

  useEffect(() => {
    if (inView && hasMore && !loadingRef.current) {
      handleLoadMore();
    }
  }, [inView, hasMore, handleLoadMore]);

  return (
    <div className="space-y-4">
      {children(items)}
      
      {error && (
        <div className="text-center text-destructive p-4">
          {error.message}
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={handleLoadMore}
            className="ml-2"
          >
            Retry
          </Button>
        </div>
      )}

      {(loading || loadingMore) && (
        <div
          className="w-full flex justify-center py-4"
          ref={ref}
          role="progressbar"
          aria-busy="true"
        >
          <Loader2 className="h-6 w-6 animate-spin" />
        </div>
      )}
    </div>
  );
}