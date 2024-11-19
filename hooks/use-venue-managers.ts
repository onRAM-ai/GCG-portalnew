"use client";

import { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';

interface VenueManager {
  id: string;
  userId: string;
  venueId: string;
  createdAt: Date;
}

export function useVenueManagers(venueId: string) {
  const [managers, setManagers] = useState<VenueManager[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const q = query(
      collection(db, 'venue_managers'),
      where('venueId', '==', venueId)
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const managerData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as VenueManager[];
        
        setManagers(managerData);
        setLoading(false);
      },
      (err) => {
        setError(err as Error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [venueId]);

  return { managers, loading, error };
}