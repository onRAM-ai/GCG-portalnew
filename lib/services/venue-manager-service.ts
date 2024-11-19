import { 
  collection,
  query,
  where,
  getDocs,
  addDoc,
  deleteDoc,
  serverTimestamp 
} from 'firebase/firestore';
import { db } from '@/lib/firebase';

const MANAGERS_COLLECTION = 'venue_managers';

export async function addVenueManager(venueId: string, userId: string): Promise<string> {
  const docRef = await addDoc(collection(db, MANAGERS_COLLECTION), {
    venueId,
    userId,
    createdAt: serverTimestamp()
  });
  return docRef.id;
}

export async function removeVenueManager(venueId: string, userId: string): Promise<void> {
  const q = query(
    collection(db, MANAGERS_COLLECTION),
    where('venueId', '==', venueId),
    where('userId', '==', userId)
  );
  
  const snapshot = await getDocs(q);
  const deletePromises = snapshot.docs.map(doc => deleteDoc(doc.ref));
  await Promise.all(deletePromises);
}

export async function getVenueManagers(venueId: string): Promise<string[]> {
  const q = query(
    collection(db, MANAGERS_COLLECTION),
    where('venueId', '==', venueId)
  );
  
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => doc.data().userId);
}

export async function getManagedVenues(userId: string): Promise<string[]> {
  const q = query(
    collection(db, MANAGERS_COLLECTION),
    where('userId', '==', userId)
  );
  
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => doc.data().venueId);
}