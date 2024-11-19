export type NotificationType = 
  | 'SHIFT_CONFIRMATION' 
  | 'BOOKING_ALERT' 
  | 'MAY_NOT_RETURN' 
  | 'DOCUMENT_SHARED'
  | 'SYSTEM';

export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  metadata?: Record<string, any>;
  read: boolean;
  createdAt: string;
  emailSent?: boolean;
}

export interface NotificationPreferences {
  id: string;
  userId: string;
  emailEnabled: boolean;
  pushEnabled: boolean;
  enabledTypes: NotificationType[];
  updatedAt: string;
}