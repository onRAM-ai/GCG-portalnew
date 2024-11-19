export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type UserRole = 'admin' | 'venue' | 'user';
export type ShiftStatus = 'pending' | 'confirmed' | 'cancelled' | 'completed';
export type VenueStatus = 'active' | 'inactive' | 'pending';

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          auth_id: string
          email: string
          role: UserRole
          first_name: string | null
          last_name: string | null
          phone: string | null
          created_at: string
          updated_at: string
          last_login: string | null
        }
        Insert: {
          id?: string
          auth_id: string
          email: string
          role?: UserRole
          first_name?: string | null
          last_name?: string | null
          phone?: string | null
          created_at?: string
          updated_at?: string
          last_login?: string | null
        }
        Update: {
          id?: string
          auth_id?: string
          email?: string
          role?: UserRole
          first_name?: string | null
          last_name?: string | null
          phone?: string | null
          updated_at?: string
          last_login?: string | null
        }
      }
      shifts: {
        Row: {
          id: string
          start_time: string
          end_time: string
          role: string
          employee_name: string | null
          user_id: string | null
          venue_id: string
          status: ShiftStatus
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          start_time: string
          end_time: string
          role: string
          employee_name?: string | null
          user_id?: string | null
          venue_id: string
          status?: ShiftStatus
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          start_time?: string
          end_time?: string
          role?: string
          employee_name?: string | null
          user_id?: string | null
          venue_id?: string
          status?: ShiftStatus
          notes?: string | null
          updated_at?: string
        }
      }
      venues: {
        Row: {
          id: string
          name: string
          address: string
          owner_id: string | null
          status: VenueStatus
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          address: string
          owner_id?: string | null
          status?: VenueStatus
          created_at?: string
          updated_at?: string
        }
        Update: {
          name?: string
          address?: string
          owner_id?: string | null
          status?: VenueStatus
          updated_at?: string
        }
      }
      shift_assignments: {
        Row: {
          id: string
          shift_id: string
          user_id: string
          status: ShiftStatus
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          shift_id: string
          user_id: string
          status?: ShiftStatus
          created_at?: string
          updated_at?: string
        }
        Update: {
          shift_id?: string
          user_id?: string
          status?: ShiftStatus
          updated_at?: string
        }
      }
    }
    Functions: {
      update_updated_at_column: {
        Args: Record<string, never>
        Returns: undefined
      }
    }
    Enums: {
      user_role: UserRole
      shift_status: ShiftStatus
      venue_status: VenueStatus
    }
  }
}