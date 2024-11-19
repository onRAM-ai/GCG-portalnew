import { supabase } from '@/lib/supabase';
import { type UserRole } from '@/lib/database.types';

export interface Invitation {
  id: string;
  email: string;
  role: UserRole;
  token: string;
  createdAt: Date;
  expiresAt: Date;
  createdBy: string;
  status: 'pending' | 'accepted' | 'expired';
}

export async function createInvitation(email: string, role: UserRole, createdBy: string): Promise<string> {
  const token = generateToken();
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7); // Expires in 7 days

  const { data, error } = await supabase
    .from('invitations')
    .insert({
      email,
      role,
      token,
      created_by: createdBy,
      created_at: new Date().toISOString(),
      expires_at: expiresAt.toISOString(),
      status: 'pending'
    })
    .select()
    .single();

  if (error) throw error;

  // Send invitation email with new Netlify URL
  await fetch('/api/invitations/send', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email,
      role,
      token,
      expiresAt,
      invitationUrl: `https://gcgshiftmanagement.netlify.app/accept-invitation?token=${token}`
    })
  });

  return data.id;
}

export async function validateInvitation(token: string): Promise<Invitation | null> {
  const { data, error } = await supabase
    .from('invitations')
    .select('*')
    .eq('token', token)
    .eq('status', 'pending')
    .single();

  if (error || !data) return null;

  // Check if invitation has expired
  if (new Date() > new Date(data.expires_at)) {
    await updateInvitationStatus(data.id, 'expired');
    return null;
  }

  return {
    id: data.id,
    email: data.email,
    role: data.role,
    token: data.token,
    createdAt: new Date(data.created_at),
    expiresAt: new Date(data.expires_at),
    createdBy: data.created_by,
    status: data.status
  };
}

export async function updateInvitationStatus(
  invitationId: string,
  status: 'accepted' | 'expired'
): Promise<void> {
  const { error } = await supabase
    .from('invitations')
    .update({ status })
    .eq('id', invitationId);

  if (error) throw error;
}

function generateToken(): string {
  return Array.from(crypto.getRandomValues(new Uint8Array(32)))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}