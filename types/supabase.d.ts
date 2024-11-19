import { Database as DatabaseGenerated } from '@/lib/database.types';

declare global {
  type Database = DatabaseGenerated;
  type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row'];
  type Enums<T extends keyof Database['public']['Enums']> = Database['public']['Enums'][T];
  type Functions<T extends keyof Database['public']['Functions']> = Database['public']['Functions'][T];
}