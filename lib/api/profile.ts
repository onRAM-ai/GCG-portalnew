import { supabase } from '@/lib/supabase';
import { ProfileFormValues } from '@/lib/schemas/profile';

export async function updateProfile(userId: string, data: ProfileFormValues) {
  const { error } = await supabase
    .from('profiles')
    .upsert({
      id: userId,
      display_name: data.displayName,
      bio: data.bio,
      entertainment_type: data.entertainmentType,
      hourly_rate: parseInt(data.hourlyRate),
      experience: parseInt(data.experience),
      updated_at: new Date().toISOString(),
    });

  if (error) throw error;
}

export async function uploadProfileImage(userId: string, file: File) {
  const fileExt = file.name.split(".").pop();
  const filePath = `${userId}/avatar.${fileExt}`;

  const { error: uploadError } = await supabase.storage
    .from('avatars')
    .upload(filePath, file, { upsert: true });

  if (uploadError) throw uploadError;

  const { data: { publicUrl } } = supabase.storage
    .from('avatars')
    .getPublicUrl(filePath);

  const { error: updateError } = await supabase
    .from('profiles')
    .upsert({
      id: userId,
      avatar_url: publicUrl,
      updated_at: new Date().toISOString(),
    });

  if (updateError) throw updateError;

  return publicUrl;
}

export async function removeProfileImage(userId: string) {
  const { error: storageError } = await supabase.storage
    .from('avatars')
    .remove([`${userId}/avatar`]);

  if (storageError) throw storageError;

  const { error: updateError } = await supabase
    .from('profiles')
    .update({
      avatar_url: null,
      updated_at: new Date().toISOString(),
    })
    .eq('id', userId);

  if (updateError) throw updateError;
}