import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { storage } from '@/lib/firebase';

export async function uploadFile(
  path: string,
  file: File,
  metadata?: { contentType?: string }
): Promise<string> {
  const storageRef = ref(storage, path);
  await uploadBytes(storageRef, file, metadata);
  return getDownloadURL(storageRef);
}

export async function deleteFile(path: string): Promise<void> {
  const storageRef = ref(storage, path);
  await deleteObject(storageRef);
}

export async function uploadProfileImage(userId: string, file: File): Promise<string> {
  const fileExt = file.name.split('.').pop();
  const path = `profiles/${userId}/avatar.${fileExt}`;
  return uploadFile(path, file, { contentType: file.type });
}

export async function uploadVenueImage(venueId: string, file: File): Promise<string> {
  const fileExt = file.name.split('.').pop();
  const path = `venues/${venueId}/images/${Date.now()}.${fileExt}`;
  return uploadFile(path, file, { contentType: file.type });
}