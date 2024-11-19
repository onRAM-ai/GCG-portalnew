"use client";

import { useState, useEffect } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { type Venue } from '@/types/venues';

export function useVenue(venueId: string) {
  const [venue, setVenue] = useState<Venue | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const unsubscribe = onSnapshot(
      doc(db, 'venues', venueId),
      (doc) => {
        if (doc.exists()) {
          setVenue({ id: doc.id, ...doc.data() } as Venue);
        } else {
          setVenue(null);
        }
        setLoading(false);
      },
      (err) => {
        setError(err as Error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [venueId]);

  return { venue, loading, error };
}