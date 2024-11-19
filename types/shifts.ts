export type ShiftStatus = 'OPEN' | 'ASSIGNED' | 'COMPLETED';

export interface Shift {
  id: string;
  venueId: string;
  date: string;
  startTime: string;
  endTime: string;
  status: ShiftStatus;
  positions: number;
  requirements: string[];
  hourlyRate: number;
  description: string;
}

export interface ShiftAssignment {
  id: string;
  shiftId: string;
  userId: string;
  status: 'PENDING' | 'CONFIRMED' | 'CANCELLED';
  assignedAt: string;
}