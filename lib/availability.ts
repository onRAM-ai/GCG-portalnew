import { supabase } from './supabase';

export interface AvailabilityPreferences {
  available_dates: Date[];
  preferred_suburbs: string[];
  preferred_venues: string[];
  preferred_shift_types: string[];
  notes?: string;
}

export async function saveAvailabilityPreferences(preferences: AvailabilityPreferences) {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error('User not authenticated');
  }

  const { error } = await supabase
    .from('availability_preferences')
    .upsert({
      user_id: user.id,
      available_dates: preferences.available_dates.map(date => date.toISOString().split('T')[0]),
      preferred_suburbs: preferences.preferred_suburbs,
      preferred_venues: preferences.preferred_venues,
      preferred_shift_types: preferences.preferred_shift_types,
      notes: preferences.notes,
      updated_at: new Date().toISOString()
    }, {
      onConflict: 'user_id'
    });

  if (error) {
    throw error;
  }
}

export async function getAvailabilityPreferences(): Promise<AvailabilityPreferences | null> {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error('User not authenticated');
  }

  const { data, error } = await supabase
    .from('availability_preferences')
    .select('*')
    .eq('user_id', user.id)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return null;
    }
    throw error;
  }

  return {
    available_dates: data.available_dates.map(date => new Date(date)),
    preferred_suburbs: data.preferred_suburbs,
    preferred_venues: data.preferred_venues,
    preferred_shift_types: data.preferred_shift_types,
    notes: data.notes
  };
}