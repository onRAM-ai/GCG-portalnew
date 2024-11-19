"use client";

import { useState, useEffect } from 'react';
import { 
  collection, 
  query, 
  onSnapshot,
  type QueryConstraint,
  type DocumentData 
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { createQueryConstraints } from '@/lib/services/db-service';

interface UseCollectionOptions {
  filters?: Array<{ field: string; operator: string; value: any }>;
  sortBy?: { field: string; direction: 'asc' | 'desc' };
  limitTo?: number;
}

export function useCollection<T = DocumentData>(
  collectionName: string,
  options: UseCollectionOptions = {}
) {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const constraints: QueryConstraint[] = createQueryConstraints(
      options.filters,
      options.sortBy,
      options.limitTo
    );

    const q = query(collection(db, collectionName), ...constraints);

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const documents = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as T[];
        
        setData(documents);
        setLoading(false);
      },
      (err) => {
        setError(err as Error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [collectionName, options.filters, options.sortBy, options.limitTo]);

  return { data, loading, error };
}