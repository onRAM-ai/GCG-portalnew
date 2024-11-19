"use client";

import { useState, useEffect } from 'react';
import { checkDatabaseHealth } from '@/lib/db/health';
import { toast } from 'sonner';

export function useDatabase() {
  const [isHealthy, setIsHealthy] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [lastChecked, setLastChecked] = useState<string | null>(null);

  useEffect(() => {
    checkHealth();
    
    // Check health every 5 minutes
    const interval = setInterval(checkHealth, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  async function checkHealth() {
    try {
      const health = await checkDatabaseHealth();
      setIsHealthy(health.isHealthy);
      setLastChecked(health.lastChecked);
      
      if (!health.isHealthy) {
        toast.error('Database connection issue', {
          description: health.error || 'Please try again later'
        });
      }
    } catch (error) {
      setIsHealthy(false);
      console.error('Health check failed:', error);
    } finally {
      setIsLoading(false);
    }
  }

  return { isHealthy, isLoading, lastChecked, checkHealth };
}