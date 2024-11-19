"use client";

import { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { type Venue } from '@/types/venues';

interface UseVenuesOptions {
  ownerId?: string;
  status?: 'active' | 'pending' | 'suspended';
}

export function useVenues(options: UseVenuesOptions = {}) {
  const [venues, setVenues] = useState<Venue[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const constraints = [];
    
    if (options.ownerId) {
      constraints.push(where('ownerId', '==', options.ownerId));
    }
    
    if (options.status) {
      constraints.push(where('status', '==', options.status));
    }

    const q = query(collection(db, 'venues'), ...constraints);

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const venueData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Venue[];
        
        setVenues(venueData);
        setLoading(false);
      },
      (err) => {
        setError(err as Error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [options.ownerId, options.status]);

  return { venues, loading, error };
}