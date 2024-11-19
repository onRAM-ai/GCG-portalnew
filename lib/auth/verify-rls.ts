import { createServerSupabaseClient } from '@/lib/supabase/server';

export async function verifyRLSPolicies() {
  const supabase = createServerSupabaseClient();

  try {
    const { data, error } = await supabase
      .rpc('test_rls_policies');

    if (error) throw error;

    // Log results
    console.log('RLS Policy Verification Results:');
    data.forEach((result) => {
      console.log(`
        Table: ${result.table_name}
        Policy: ${result.policy_name}
        Passed: ${result.passed}
        ${result.error ? `Error: ${result.error}` : ''}
      `);
    });

    return data;
  } catch (error) {
    console.error('Error verifying RLS policies:', error);
    throw error;
  }
}