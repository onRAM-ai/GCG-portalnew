"use client";

import { useEffect, useRef, useCallback } from 'react';

export function useResizeObserver<T extends HTMLElement>(
  callback: (entry: ResizeObserverEntry) => void,
  options: { debounce?: number } = {}
) {
  const elementRef = useRef<T>(null);
  const observerRef = useRef<ResizeObserver | null>(null);
  const callbackRef = useRef(callback);

  // Update callback ref when callback changes
  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  // Debounced callback to prevent loop
  const debouncedCallback = useCallback((entries: ResizeObserverEntry[]) => {
    if (entries[0]) {
      const debounceTime = options.debounce || 0;
      if (debounceTime > 0) {
        setTimeout(() => {
          if (callbackRef.current) {
            callbackRef.current(entries[0]);
          }
        }, debounceTime);
      } else {
        if (callbackRef.current) {
          callbackRef.current(entries[0]);
        }
      }
    }
  }, [options.debounce]);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    // Cleanup previous observer
    if (observerRef.current) {
      observerRef.current.disconnect();
    }

    // Create new observer with debounced callback
    observerRef.current = new ResizeObserver((entries) => {
      window.requestAnimationFrame(() => {
        debouncedCallback(entries);
      });
    });

    // Start observing
    observerRef.current.observe(element);

    // Cleanup
    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
        observerRef.current = null;
      }
    };
  }, [debouncedCallback]);

  return elementRef;
}