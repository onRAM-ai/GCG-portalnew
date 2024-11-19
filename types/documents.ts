export type DocumentType = 'VENUE_GUIDE' | 'USER_GUIDE' | 'POLICY';

export interface Document {
  id: string;
  type: DocumentType;
  title: string;
  content: string;
  venueId?: string;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
}

export interface DocumentAccess {
  id: string;
  documentId: string;
  userId: string;
  accessType: 'VIEW' | 'EDIT';
  grantedAt: string;
  grantedBy: string;
}