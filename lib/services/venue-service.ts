import { 
  collection,
  doc,
  query,
  where,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp 
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { type Venue } from '@/types/venues';

const VENUES_COLLECTION = 'venues';

export async function createVenue(venueData: Omit<Venue, 'id'>): Promise<string> {
  const docRef = await addDoc(collection(db, VENUES_COLLECTION), {
    ...venueData,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    status: 'pending'
  });
  return docRef.id;
}

export async function updateVenue(id: string, data: Partial<Venue>): Promise<void> {
  const docRef = doc(db, VENUES_COLLECTION, id);
  await updateDoc(docRef, {
    ...data,
    updatedAt: serverTimestamp()
  });
}

export async function deleteVenue(id: string): Promise<void> {
  await deleteDoc(doc(db, VENUES_COLLECTION, id));
}

export async function getVenuesByOwner(ownerId: string): Promise<Venue[]> {
  const q = query(
    collection(db, VENUES_COLLECTION),
    where('ownerId', '==', ownerId)
  );
  
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  } as Venue));
}

export async function getActiveVenues(): Promise<Venue[]> {
  const q = query(
    collection(db, VENUES_COLLECTION),
    where('status', '==', 'active')
  );
  
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  } as Venue));
}