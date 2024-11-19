import { getSupabaseClient } from './client';

export async function testRLSPolicies() {
  const supabase = getSupabaseClient();

  try {
    // Test admin access
    console.log('Testing admin access...');
    const { data: adminData, error: adminError } = await supabase
      .from('users')
      .select('*');

    if (adminError) {
      console.error('Admin access test failed:', adminError);
    } else {
      console.log('Admin access test passed');
    }

    // Test user access
    console.log('Testing user access...');
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('auth_id', 'test-user-id');

    if (userError) {
      console.error('User access test failed:', userError);
    } else {
      console.log('User access test passed');
    }

    // Test venue access
    console.log('Testing venue access...');
    const { data: venueData, error: venueError } = await supabase
      .from('venues')
      .select('*')
      .eq('owner_id', 'test-venue-owner-id');

    if (venueError) {
      console.error('Venue access test failed:', venueError);
    } else {
      console.log('Venue access test passed');
    }

    return {
      adminTest: !adminError,
      userTest: !userError,
      venueTest: !venueError,
    };
  } catch (error) {
    console.error('Error running RLS tests:', error);
    throw error;
  }
}