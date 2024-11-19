import {
  collection,
  doc,
  query,
  where,
  orderBy,
  limit,
  getDocs,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
  type DocumentData,
  type QueryConstraint
} from 'firebase/firestore';
import { db } from './firebase';

// Collection references
export const profilesRef = collection(db, 'profiles');
export const venuesRef = collection(db, 'venues');
export const shiftsRef = collection(db, 'shifts');
export const bookingsRef = collection(db, 'bookings');
export const availabilityRef = collection(db, 'availability');
export const feedbackRef = collection(db, 'feedback');
export const notificationsRef = collection(db, 'notifications');

// Generic CRUD operations
export async function createDocument<T extends DocumentData>(
  collectionName: string,
  data: T,
  id?: string
): Promise<string> {
  const docRef = id ? doc(db, collectionName, id) : doc(collection(db, collectionName));
  await setDoc(docRef, {
    ...data,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return docRef.id;
}

export async function updateDocument<T extends DocumentData>(
  collectionName: string,
  id: string,
  data: Partial<T>
): Promise<void> {
  const docRef = doc(db, collectionName, id);
  await updateDoc(docRef, {
    ...data,
    updatedAt: serverTimestamp(),
  });
}

export async function deleteDocument(
  collectionName: string,
  id: string
): Promise<void> {
  await deleteDoc(doc(db, collectionName, id));
}

export async function getDocument<T>(
  collectionName: string,
  id: string
): Promise<T | null> {
  const docSnap = await getDoc(doc(db, collectionName, id));
  return docSnap.exists() ? (docSnap.data() as T) : null;
}

export async function queryDocuments<T>(
  collectionName: string,
  constraints: QueryConstraint[]
): Promise<T[]> {
  const q = query(collection(db, collectionName), ...constraints);
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }) as T);
}

// Helper function to create common queries
export function createQuery(
  collectionName: string,
  filters: Array<{ field: string; operator: string; value: any }> = [],
  sortBy?: { field: string; direction: 'asc' | 'desc' },
  limitTo?: number
): QueryConstraint[] {
  const constraints: QueryConstraint[] = [];

  // Add filters
  filters.forEach(({ field, operator, value }) => {
    constraints.push(where(field, operator as any, value));
  });

  // Add sorting
  if (sortBy) {
    constraints.push(orderBy(sortBy.field, sortBy.direction));
  }

  // Add limit
  if (limitTo) {
    constraints.push(limit(limitTo));
  }

  return constraints;
}