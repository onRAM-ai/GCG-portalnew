import { supabase } from './supabase';

export interface AvailabilityPreferences {
  available_dates: string[];
  preferred_suburbs: string[];
  preferred_venues: string[];
  preferred_shift_types: string[];
  notes?: string;
}

export async function savePreferences(preferences: AvailabilityPreferences) {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error('User not authenticated');
  }

  const { data, error } = await supabase
    .from('availability_preferences')
    .upsert({
      user_id: user.id,
      ...preferences,
      updated_at: new Date().toISOString()
    }, {
      onConflict: 'user_id'
    });

  if (error) {
    throw error;
  }

  return data;
}

export async function getPreferences() {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error('User not authenticated');
  }

  const { data, error } = await supabase
    .from('availability_preferences')
    .select('*')
    .eq('user_id', user.id)
    .single();

  if (error && error.code !== 'PGRST116') { // Not found error
    throw error;
  }

  return data;
}