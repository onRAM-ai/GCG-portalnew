export interface Feedback {
  id: string;
  venueId: string;
  userId: string;
  rating: number;
  mayNotReturn: boolean;
  comment: string;
  createdAt: string;
  status: 'PENDING' | 'REVIEWED' | 'RESOLVED';
  reviewedBy?: string;
  reviewedAt?: string;
  reviewNotes?: string;
}

export interface FeedbackStats {
  averageRating: number;
  totalFeedback: number;
  mayNotReturnCount: number;
  pendingReviewCount: number;
}