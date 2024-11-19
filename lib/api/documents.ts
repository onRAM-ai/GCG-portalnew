import { supabase } from '@/lib/supabase';
import { type Document, type DocumentAccess } from '@/types/documents';

export async function createDocument(document: Omit<Document, 'id' | 'createdAt' | 'updatedAt'>) {
  const { data, error } = await supabase
    .from('documents')
    .insert([{
      ...document,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }])
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function getDocuments(filters?: {
  type?: string;
  venueId?: string;
}) {
  let query = supabase.from('documents').select(`
    *,
    venue:venues(name),
    creator:profiles(name)
  `);

  if (filters?.type) {
    query = query.eq('type', filters.type);
  }
  if (filters?.venueId) {
    query = query.eq('venue_id', filters.venueId);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data;
}

export async function updateDocument(
  documentId: string,
  updates: Partial<Document>
) {
  const { data, error } = await supabase
    .from('documents')
    .update({
      ...updates,
      updated_at: new Date().toISOString()
    })
    .eq('id', documentId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function grantDocumentAccess(
  documentId: string,
  userId: string,
  accessType: 'VIEW' | 'EDIT'
) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { data, error } = await supabase
    .from('document_access')
    .insert([{
      document_id: documentId,
      user_id: userId,
      access_type: accessType,
      granted_by: user.id
    }])
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function revokeDocumentAccess(
  documentId: string,
  userId: string
) {
  const { error } = await supabase
    .from('document_access')
    .delete()
    .match({
      document_id: documentId,
      user_id: userId
    });

  if (error) throw error;
}